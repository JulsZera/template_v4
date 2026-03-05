import path from "path";
import { createServer } from "./index";
import * as express from "express";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";

const app = createServer();

// ✅ benerin penulisan port
const port = Number(process.env.PORT || 3000);

// (opsional) kalau kamu butuh IP real dari LB
app.set("trust proxy", true);

/**
 * ✅ Proxy semua /zera/* ke Go lokal
 * - Go HARUS listen di 127.0.0.1:7714 (bukan 0.0.0.0)
 * - fixRequestBody penting karena biasanya createServer() sudah pakai body parser,
 *   tanpa ini POST JSON bisa kekirim kosong ke Go.
 */
app.use(
  "/zera",
  createProxyMiddleware({
    // ⚠️ penting: tambahin /zera di target (karena v3 tidak patch req.url)
    target: "http://127.0.0.1:7714/zera",
    changeOrigin: true,
    ws: true,
    xfwd: true,
    on: {
      proxyReq: fixRequestBody,
      error: (err, req, res) => {
        // @ts-ignore
        res.writeHead?.(502, { "Content-Type": "application/json" });
        // @ts-ignore
        res.end?.(JSON.stringify({ error: "zera backend unavailable", detail: String(err) }));
      },
    },
  }) as any
);

const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

app.use(express.static(distPath));

/**
 * Catch-all SPA untuk GET saja
 */
app.get("/{*any}", (req, res, next) => {
  // kalau /zera/*, biarkan middleware proxy di atas yang handle
  if (req.path.startsWith("/zera/")) return next();

  // jangan tangani endpoint backend
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 Vite API: http://localhost:${port}/zera`);
});