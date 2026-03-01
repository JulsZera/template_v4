import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { apiRequest } from "@/services/api";

export default function Promo() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const BRANCH_ID = import.meta.env.VITE_BRANCH_ID;
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const fetchPromo = async () => {
      setLoading(true);

      console.log("USER IN PROMO:", user);
      console.log("JWT IN PROMO:", localStorage.getItem("jwt"));

      const res = await apiRequest("/get-promotion", "POST", {
        branch_id: BRANCH_ID,
        username: user.username,
      });

      console.log("BRANCH_ID :", BRANCH_ID)
      console.log("USERNAME : ",user.username)

      if (res?.rcode === "00") {
        setPromos(res.data ?? []);
      }

      setLoading(false);
    };

    fetchPromo();
  }, [user]);

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
