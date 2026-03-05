import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { apiRequest } from "@/services/api";
import { fetchSeoPageAPI } from "@/services/seoService";
import { useLocation } from "react-router-dom";
import bgImage2 from "@/assets/e2279a7a26bd6ebfe974eab10510df738c19d7c01ce07a6a92bb3f9a1b828022.webp";

export default function Promo() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const BRANCH_ID = import.meta.env.VITE_BRANCH_ID;
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  //============ SEO PAGE ================//
  
    const location = useLocation();
    const [seoData, setSeoData] = useState<any>(null);
  
      useEffect(() => {
        const loadSEO = async () => {
          const seoData = await fetchSeoPageAPI(location.pathname);
  
          console.log("RESPONSE SEO BANKING: ", seoData)
  
          if (seoData) {
            setSeoData(seoData);
          }
        };
        loadSEO();
      }, [location.pathname]);
  
      useEffect(() => {
        if (!seoData) return;
  
      /* ================= TITLE ================= */
  
        const title =
          seoData.page_title ||
          seoData.default_website_title ||
          seoData.website_name ||
          document.title;
  
        document.title = title;
  
        /* ================= META PIXEL ================= */
  
        if (seoData.meta_pixel && !document.getElementById("seo-meta-pixel")) {
          const wrapper = document.createElement("div");
          wrapper.id = "seo-meta-pixel";
          wrapper.innerHTML = seoData.meta_pixel;
  
          document.head.appendChild(wrapper);
        }
  
      /* ================= META DESCRIPTION ================= */
  
        const description =
          seoData.meta_description ||
          seoData.running_text ||
          "";
  
        if (description) {
          let metaDesc = document.querySelector("meta[name='description']");
  
          if (!metaDesc) {
            metaDesc = document.createElement("meta");
            metaDesc.setAttribute("name", "description");
            document.head.appendChild(metaDesc);
          }
  
          metaDesc.setAttribute("content", description);
        }
  
  
      /* ================= META KEYWORDS ================= */
  
        if (seoData.meta_keyboard) {
          let metaKey = document.querySelector("meta[name='keywords']");
  
          if (!metaKey) {
            metaKey = document.createElement("meta");
            metaKey.setAttribute("name", "keywords");
            document.head.appendChild(metaKey);
          }
  
          metaKey.setAttribute("content", seoData.meta_keyboard);
        }
  
  
      /* ================= FAVICON ================= */
  
        if (seoData.favicon) {
          let favicon = document.querySelector("link[rel='icon']");
  
          if (!favicon) {
            favicon = document.createElement("link");
            favicon.setAttribute("rel", "icon");
            document.head.appendChild(favicon);
          }
  
          favicon.setAttribute("href", seoData.favicon);
        }
  
  
      /* ================= CANONICAL ================= */
  
        if (seoData.custom_canonical_global) {
          let canonical = document.querySelector("link[rel='canonical']");
  
          if (!canonical) {
            canonical = document.createElement("link");
            canonical.setAttribute("rel", "canonical");
            document.head.appendChild(canonical);
          }
  
          canonical.setAttribute("href", seoData.custom_canonical_global);
        }
  
      /* ================= LIVECHAT ================= */
  
        if (seoData.script_livechat && !window.Tawk_API) {
          const container = document.createElement("div");
          container.innerHTML = seoData.script_livechat;
  
          const scripts = container.querySelectorAll("script");
  
          scripts.forEach((oldScript) => {
            const newScript = document.createElement("script");
  
            if (oldScript.src) {
              newScript.src = oldScript.src;
              newScript.async = true;
            } else {
              newScript.innerHTML = oldScript.innerHTML;
            }
  
            document.body.appendChild(newScript);
          });
        }
  
  
      /* ================= CUSTOM HEAD SCRIPT ================= */
  
        const headScript =
          seoData.custom_script_page ||
          seoData.custom_script_global ||
          "";
  
        if (headScript && !document.getElementById("seo-head-script")) {
          const wrapper = document.createElement("div");
          wrapper.id = "seo-head-script";
          wrapper.innerHTML = headScript;
  
          document.head.appendChild(wrapper);
        }
  
  
      /* ================= CUSTOM BODY SCRIPT ================= */
  
        const bodyScript =
          seoData.custom_script_body_page ||
          seoData.custom_script_body_global ||
          "";
  
        if (bodyScript && !document.getElementById("seo-body-script")) {
          const wrapper = document.createElement("div");
          wrapper.id = "seo-body-script";
          wrapper.innerHTML = bodyScript;
  
          document.body.appendChild(wrapper);
        }
  
      }, [seoData]);
  
  //============ END SEO PAGE ================//

  useEffect(() => {
    if (!user) return;

    const fetchPromo = async () => {
      setLoading(true);

      // console.log("USER IN PROMO:", user);
      // console.log("JWT IN PROMO:", localStorage.getItem("jwt"));

      const res = await apiRequest("/get-promotion", "POST", {
        branch_id: BRANCH_ID,
        username: user.username,
      });

      // console.log("BRANCH_ID :", BRANCH_ID)
      // console.log("USERNAME : ",user.username)
      // console.log("RESPONSE: ",res?.data?.rcode)

      if (res?.data?.rcode === "00") {
        setPromos(res.data?.data ?? []);
      }

      setLoading(false);
    };

    fetchPromo();
  }, [user]);

  return (
    <div className="w-screen min-h-screen pb-24 md:pb-0 relative overflow-x-hidden"
      style={{
        backgroundImage: `url(${bgImage2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
      >
      {/* Header */}
      <header className="sticky top-0 z-40 shadow-lg" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className="text-white p-2 hover:bg-white/20 rounded transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-white font-bold text-lg">{t("promotion")}</h1>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Promo Content */}
      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Promo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-600">Loading promo...</p>
              </div>
            ) : promos.length === 0 ? (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-600">Belum ada promo tersedia</p>
              </div>
            ) : (
              promos.map((promo, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-105"
              >
                {/* IMAGE */}
                <img
                  src={promo.image_url}
                  alt={promo.name}
                  className="w-full h-48 object-cover"
                />

                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {promo.name}
                  </h3>

                  <div
                    className="text-sm text-gray-600 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: promo.description }}
                  />

                  <button
                    onClick={() => navigate("/deposit")}
                    className="mt-4 w-full bg-gradient-to-r from-pink-400 to-pink-300 hover:from-pink-500 hover:to-pink-400 text-white font-bold py-2 rounded-lg transition-all"
                  >
                    {t("play")}
                  </button>
                </div>
              </div>
          )))}
        </div>

        {/* Banner Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 text-center md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            🎯 {t("promotion")} Eksklusif
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan pemain yang sudah merasakan keuntungan dari promosi menarik kami. Dapatkan bonus setiap hari dan nikmati pengalaman bermain yang luar biasa!
          </p>
          <button
            style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}
            className="text-white font-bold px-8 py-3 rounded-full hover:shadow-lg transition-all"
          >
            {t("deposit")}
          </button>
        </div>
      </div>
    </div>
  );
}
