import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft } from "lucide-react";

export default function Provider() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const providers = [
    { name: "PG", image: "https://cdn.builder.io/api/v1/image/assets%2Fde66772a80b6454ba51a7d50705077af%2F70aba83328f74aeb97fe43884de58ecb?format=webp&width=800&height=1200" },
    { name: "JILI", image: "https://cdn.builder.io/api/v1/image/assets%2Fde66772a80b6454ba51a7d50705077af%2Fe1eea68becc041cc8ce906cc1dfd174b?format=webp&width=800&height=1200" },
    { name: "PP", image: "https://cdn.builder.io/api/v1/image/assets%2Fde66772a80b6454ba51a7d50705077af%2F95b35df7bcf24216b18bbce308f777cf?format=webp&width=800&height=1200" },
    { name: "JOKER", image: "https://cdn.builder.io/api/v1/image/assets%2Fde66772a80b6454ba51a7d50705077af%2F7cbeefee01b34b4a978ac5237c685b18?format=webp&width=800&height=1200" },
    { name: "FC", image: "https://cdn.builder.io/api/v1/image/assets%2Fde66772a80b6454ba51a7d50705077af%2Ff6045fd6cbe8429ea30e6d46d50c9d40?format=webp&width=800&height=1200" },
    { name: "YGR" },
    { name: "AMB" },
    { name: "NEXT" },
    { name: "RELAX" },
    { name: "IDG" },
    { name: "RSG" },
    { name: "RED TIGER" },
    { name: "BLUEPRINT" },
    { name: "2JCOM" },
    { name: "BIGPOT" },
  ];

  return (
    <div className="w-screen min-h-screen pb-20 relative overflow-x-hidden" style={{ backgroundColor: "#F1C8D6" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 shadow-lg" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className="text-white p-2 hover:bg-white/20 rounded transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-white font-bold text-lg">Provider</h1>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Providers Grid */}
      <div style={{ padding: "0.75rem" }}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {providers.map((provider, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105 cursor-pointer"
            >
              {provider.image ? (
                <img
                  src={provider.image}
                  alt={provider.name}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-pink-400 to-pink-300 flex items-center justify-center">
                  <span className="font-bold text-white text-center px-2">{provider.name}</span>
                </div>
              )}
              <div className="p-3 text-center">
                <h3 className="font-bold text-gray-800 text-sm">{provider.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
