import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft } from "lucide-react";

export default function Promo() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const promoItems = [
    {
      icon: "🎉",
      title: t("announcement"),
      description: "Dapatkan bonus dan promosi spesial hari ini",
    },
    {
      icon: "💰",
      title: t("free_spins"),
      description: "Menang besar dengan putaran gratis",
    },
    {
      icon: "🎁",
      title: t("promotion_bonus"),
      description: "Bonus 50% untuk semua game setiap hari",
    },
    {
      icon: "⭐",
      title: t("welcome_bonus"),
      description: "Dapatkan 100 poin gratis sebagai bonus selamat datang",
    },
    {
      icon: "💎",
      title: "Exclusive Rewards",
      description: "Kumpulkan poin dan tukarkan dengan hadiah menarik",
    },
    {
      icon: "🏆",
      title: "VIP Program",
      description: "Nikmati benefit eksklusif sebagai member VIP",
    },
    {
      icon: "🎊",
      title: "Weekly Contest",
      description: "Ikuti kontes mingguan dan menangkan hadiah besar",
    },
    {
      icon: "🚀",
      title: "Flash Deal",
      description: "Penawaran terbatas dengan bonus fantastis",
    },
  ];

  return (
    <div className="w-screen min-h-screen pb-24 md:pb-0 relative overflow-x-hidden" style={{ backgroundColor: "#F1C8D6" }}>
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
          {promoItems.map((promo, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="text-4xl mb-3">{promo.icon}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {promo.title}
              </h3>
              <p className="text-sm text-gray-600">
                {promo.description}
              </p>
              <button className="mt-4 w-full bg-gradient-to-r from-pink-400 to-pink-300 hover:from-pink-500 hover:to-pink-400 text-white font-bold py-2 rounded-lg transition-all">
                {t("play")}
              </button>
            </div>
          ))}
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
