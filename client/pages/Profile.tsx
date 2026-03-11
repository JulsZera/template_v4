import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useUser } from "@/context/UserContext";
import { apiRequest } from "@/services/api";
import { COLORS } from "@/config/colors";
import { uploadWithProgress } from "@/services/api";
import { fetchSeoPageAPI } from "@/services/seoService";
import { useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import bgImage2 from "@/assets/e2279a7a26bd6ebfe974eab10510df738c19d7c01ce07a6a92bb3f9a1b828022.webp";
import toast from "react-hot-toast";

type Tab = "profile" | "security" | "banking" | "referral" | "statistics";

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useUser();
  const BRANCH_ID = import.meta.env.VITE_BRANCH_ID;
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(false);

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

  /* =========================
     PROFILE STATE
  ========================== */
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    phone: "",
    tier: "",
    totalDeposit: "IDR 0",
  });

  /* =========================
     SECURITY STATE
  ========================== */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* =========================
     BANKING STATE
  ========================== */
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [bankOptions, setBankOptions] = useState<any[]>([]);
  const [showAddBankModal, setShowAddBankModal] = useState(false);

  const [newBankForm, setNewBankForm] = useState({
    selectedBank: "",
    accountNumber: "",
    accountHolder: user?.name || "",
  });

  /* =========================
     REFERRAL STATE
  ========================== */
  const defaultReferral = {
    firstName: "",
    email: "",
    phone: "",
    address: "",
    bank: "",
    hasReferrals: false,
    referralTree: [] as any[],
  };

  const [referralData, setReferralData] = useState(defaultReferral);
  const [reffRequestStatus, setReffRequestStatus] = useState<number | null>(null);
  const [reffLoading, setReffLoading] = useState(false);
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [identityPreview, setIdentityPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingIdentity, setUploadingIdentity] = useState(false);

  /* =========================
     STATISTICS STATE
  ========================== */
  const [statsFilter, setStatsFilter] = useState({
    startDate: "",
    endDate: "",
    category: "semua_kategori",
    provider: "semua_provider",
  });

  const formatStartDate = (date: string) =>
    `${date} 00:00:00`;

  const formatEndDate = (date: string) =>
    `${date} 23:59:59`;

  const [datacategories, setCategories] = useState<any[]>([]);
  const [dataproviders, setProviders] = useState<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");

  const [turnoverData, setTurnoverData] = useState<any[]>([]);
  const [loadingTurnover, setLoadingTurnover] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const fetchCategories = async () => {

    const res = await apiRequest("/categories", "POST", {});

    console.log("CATEGORIES:", res)

    if (res?.data_category) {
      setCategories(res.data_category ?? []);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  
  const fetchProviders = async (category: string) => {
    
    const res = await apiRequest("/provider", "POST", {
      category: category
    });

    console.log("SELECT CATEGORY PROVIDER:", category)
    console.log("PROVIDER:", res)
    
    if (res?.data_provider) {
      setProviders(res.data_provider ?? []);
    }
  };
  
  useEffect(() => {

    if (!selectedCategory) return;

    fetchProviders(selectedCategory);

  }, [selectedCategory]);

  const handleSearchTurnover = async () => {

    if (!user) return;

    setLoadingTurnover(true);

    const res = await apiRequest("/turnover", "POST", {
      username: user.username,
      gameplayid: user.gameplayid,
      gameplaynum: user.gameplaynum,
      category: selectedCategory || "All",
      provider: selectedProvider || "All",
      start_date: formatStartDate(startDate),
      end_date: formatEndDate(endDate),
    });

    console.log("SELECT CATEGORY:", selectedCategory)
    console.log("SELECT PROVIDER:", selectedProvider)
    console.log("TURNOVER:", res)

    if (res?.data?.data) {
      setTurnoverData(res.data.data);
      toast.success("Data Turnover 🎉")
    } else {
      setTurnoverData([]);
      toast.error("Belum ada Turnover 🎉")
    }

    setLoadingTurnover(false);
  };

    /* =========================
     FETCH PROFILE / REFERRAL
  ========================== */
  const fetchProfile = useCallback(
    async (fn: "dataprofile" | "datareff") => {
      if (!user) return;

      // console.log("FETCH PROFILE CALLED WITH:", fn);
      
      setLoading(true);

      try {
        const res = await apiRequest("/profile", "POST", {
          username: user.username,
          gameplayid: user.gameplayid,
          gameplaynum: user.gameplaynum,
          function: fn,
        });

        if (!res?.status) return;

        // console.log("PROFILE RESPONSE:", res);

        const profile = res.data?.data?.[0];
        const wallets = res.data?.data_wallet ?? [];

        // console.log("PAYLOAD:", profile);
        // console.log("WALLET:", wallets);

        if (!profile) return;

        if (fn === "dataprofile") {
          setProfileData({
            username: profile.username ?? "",
            email: profile.email ?? "",
            phone: profile.phonenumber ?? "",
            tier: profile.name_tier ?? "",
            totalDeposit: profile.total_deposit ?? "IDR 0",
          });

          setBankAccounts(wallets);
          console.log("DATA PROFILE:", res)
        }

        if (fn === "datareff") {
          setReferralData(prev => ({
            ...prev,
            hasReferrals: profile.flag_referral === "1",
            referralTree: profile.tree ?? [],
          }));
          console.log("DATA REFERAL:", res)
        }

      } catch (err) {
        // console.log("PROFILE ERROR:", err);
      } finally {
        setLoading(false);
      }
    },
    [user, BRANCH_ID]
  );

  const fetchBanking = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await apiRequest("/check-wallet", "POST", {
        username: user.username,
      });
     // console.log("RESPONSE BANKING:", res)

      if (!res?.status) return;

      const wallets = res.data?.data_user ?? [];
      setBankAccounts(wallets);
      console.log("SET BANK ACCOUNT TERBARU DARI FETCH BANKING:",wallets)
    } finally {
      setLoading(false);
    }
  };

  const fetchTurnover = async () => {
  if (!user) return;

    setLoading(true);
    try {
      const res = await apiRequest("/turnover", "POST", {
        username: user.username,
        gameplayid: user.gameplayid,
        gameplaynum: user.gameplaynum,
        ...statsFilter,
      });

      if (res?.status) {
        setTurnoverData(res.data?.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBankList = async () => {
    const res = await apiRequest("/listbank", "POST", {
    });

    // console.log("RESPONSE LIST BANK:",res)

    if (res?.status) {
      setBankOptions(res.data?.data ?? []);
    }
  };

  const fetchReqReff = async () => {
    if (!user) return;

    setReffLoading(true);

    const res = await apiRequest("/check-request-reff", "POST", {
      username: user.username,
      gameplayid: user.gameplayid,
      gameplaynum: user.gameplaynum,
    });

    console.log("RESPONSE REQUEST REFF:", res);

    if (res?.status) {
      const status = Number(res.data?.status);
      setReffRequestStatus(status);

      console.log("STATUS REQUEST:",status)

      // 🔥 kalau status 1 → lanjut cek profile referral
      if (status === 1) {
        await fetchProfile("datareff");
      }
    }

    setReffLoading(false);
  };

  useEffect(() => {
    if (showAddBankModal) fetchBankList();
  }, [showAddBankModal]);

    useEffect(() => {
    if (!user) return;

    switch (activeTab) {
      case "profile":
        fetchProfile("dataprofile");
        break;
      case "banking":
        fetchBanking();
        break;
      case "referral":
        fetchReqReff();
        break;
      case "statistics":
        fetchTurnover();
        break;
    }
  }, [activeTab, user, fetchProfile]); // ← tambahkan user
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    const res = await apiRequest("/change-password", "POST", {
      oldpassword: currentPassword,
      password: newPassword,
      client_ip: "127.0.0.1",
    });

    if (res?.status) {
      toast.success("Password berhasil diubah");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleBackClick = () => {
    navigate("/");
  };

  const handleIdentityUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIdentityFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdentityPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setIdentityPreview(null);
    }
  };

  const handleSubmitReferral = async () => {
  if (!identityFile) {
    toast.error("Upload file identitas terlebih dahulu");
    return;
  }

  if (!referralData.email || !referralData.address || !referralData.bank) {
    toast.error("Lengkapi semua data terlebih dahulu");
    return;
  }

  const selectedWallet = bankAccounts.find(
    (w: any) => w.id_wallet === referralData.bank
  );

  if (!selectedWallet) {
    toast.error("Wallet tidak ditemukan");
    return;
  }

  const formData = new FormData();

  formData.append("username", user.username);
  formData.append("gameplayid", user.gameplayid);
  formData.append("gameplaynum", user.gameplaynum);
  formData.append("name", user.username);
  formData.append("email", referralData.email);
  formData.append("address", referralData.address);
  formData.append("phonenumber", user.phonenumber);
  formData.append("id_wallet", selectedWallet.id_wallet);
  formData.append("type_wallet", selectedWallet.type_wallet);
  formData.append("account_name", selectedWallet.account_name);
  formData.append("account_number", selectedWallet.account_number);
  formData.append("image_source", identityFile);

  try {
    setUploadingIdentity(true);

    const res = await uploadWithProgress(
      "/request-referral",
      formData,
      (percent) => {
        setUploadProgress(percent);
      }
    );

    if (res?.status) {
      toast.success("Pengajuan referral berhasil dikirim");
      setReffRequestStatus(0); // langsung jadi pending
    } else {
      toast.error(res?.message || "Gagal mengirim referral");
    }

  } catch (err) {
    toast.error("Server error");
  } finally {
    setUploadingIdentity(false);
  }
};

  // console.log("PROFILE DATA STATE:", profileData);
  // ===== TAB: PROFILE =====
  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-pink-100 rounded-xl p-6 border-2" style={{ borderColor: COLORS.primary.main }}>
        <h3 className="text-pink-500 text-sm font-bold mb-4">ℹ️ {t("profile_information") || "Informasi Profil"}</h3>
        <div className="text-xs text-pink-500 mb-4">{t("account_details")}</div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-pink-500">{t("username")}</label>
            <input
              type="text"
              value={profileData.username}
              disabled
              className="text-gray-600 w-full mt-2 px-3 py-2 border-2 rounded-lg text-sm bg-gray-50"
              style={{ borderColor: COLORS.primary.light }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-pink-500">{t("email") || "Email"}</label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="text-gray-600 w-full mt-2 px-3 py-2 border-2 rounded-lg text-sm bg-gray-50"
              style={{ borderColor: COLORS.primary.light }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-pink-500">{t("phone")}</label>
            <input
              type="text"
              value={profileData.phone}
              disabled
              className="text-gray-600 w-full mt-2 px-3 py-2 border-2 rounded-lg text-sm bg-gray-50"
              style={{ borderColor: COLORS.primary.light }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-pink-500">{t("account_tier")}</label>
            <input
              type="text"
              value={profileData.tier}
              disabled
              className="text-gray-600 w-full mt-2 px-3 py-2 border-2 rounded-lg text-sm bg-gray-50"
              style={{ borderColor: COLORS.primary.light }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-pink-500">{t("total_deposit")}</label>
            <input
              type="text"
              value={profileData.totalDeposit}
              disabled
              className="text-gray-600 w-full mt-2 px-3 py-2 border-2 rounded-lg text-sm bg-gray-50"
              style={{ borderColor: COLORS.primary.light }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // ===== TAB: KEAMANAN (Security) =====
  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border-2" style={{ borderColor: COLORS.primary.light }}>
        <h3 className="text-sm font-bold mb-4 text-pink-500">🔐 {t("change_password")}</h3>
        <div className="text-xs text-pink-500 mb-4">{t("update_password_instruction")}</div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-pink-500">{t("current_password")} *</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t("enter_current_password") || "Masukkan kata sandi saat ini"}
              className="w-full mt-2 px-3 py-2 border-2 rounded-lg text-sm"
              style={{ borderColor: COLORS.primary.light }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-pink-500">{t("new_password")} *</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("enter_new_password") || "Masukkan kata sandi baru"}
              className="w-full mt-2 px-3 py-2 border-2 rounded-lg text-sm"
              style={{ borderColor: COLORS.primary.light }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-pink-500">{t("confirm_password")} *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("confirm_password") || "Konfirmasi kata sandi baru"}
              className="w-full mt-2 px-3 py-2 border-2 rounded-lg text-sm"
              style={{ borderColor: COLORS.primary.light }}
            />
          </div>

          <button
            onClick={handleChangePassword}
            className="w-full mt-6 px-4 py-2 rounded-lg font-bold text-sm text-white"
            style={{ backgroundColor: COLORS.secondary.orange }}
          >
            {t("change_password") || "Ubah Kata Sandi"}
          </button>
        </div>
      </div>
    </div>
  );

  // ===== TAB: PERBANKAN (Banking) =====
  const renderBankingTab = () => (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-pink-500 ">💳 {t("banking_accounts") || "Rekening Bank"}</h3>
          <button
            onClick={() => setShowAddBankModal(true)}
            className="px-4 py-2 rounded-lg font-bold text-sm text-white"
            style={{ backgroundColor: COLORS.primary.main }}
          >
            + {t("add_bank") || "Tambah Bank"}
          </button>
        </div>

        <div className="space-y-4">
          {bankAccounts.map((account) => (
            <div
              key={account.account_number}
              className="bg-white rounded-xl p-4 border-2 flex justify-between items-center"
              style={{ borderColor: COLORS.primary.light }}
            >
              <div className="flex items-center gap-4">
                <img
                  src={account.image}
                  alt={account.bank_name}
                  className="w-12 h-12 object-contain"
                />

                <div>
                  <p className="font-bold text-sm text-pink-500">
                    {account.bank_name}
                  </p>

                  <p className="font-bold text-xs text-gray-600">
                    {account.account_number}
                  </p>

                  <p className="text-xs text-gray-600">
                    {account.account_name}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 text-xs bg-green-600 text-white rounded-full">
                Aktif
              </span>
              
            </div>
          ))}
        </div>
      </div>

      {/* Add Bank Modal */}
      {showAddBankModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border-2" style={{ borderColor: COLORS.primary.light }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{t("add_bank")}</h2>
              <button
                onClick={() => setShowAddBankModal(false)}
                className="text-white text-2xl font-bold hover:opacity-70"
              >
                ×
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Bank Selection */}
              <div>
                <label className="text-xs font-bold text-white block mb-2">{t("choose_your_bank")} *</label>
                <select
                  value={newBankForm.selectedBank}
                  onChange={(e) =>
                    setNewBankForm({ ...newBankForm, selectedBank: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border-2 border-gray-700 focus:outline-none"
                  style={{ borderColor: COLORS.primary.light }}
                >
                  <option value="">---- {t("choose_bank_ewallet")} -----</option>

                  {/* GROUP BANK */}
                  <optgroup label="Bank">
                    {bankOptions
                      .filter((bank) => bank.type_wallet === "1")
                      .map((bank, index) => (
                        <option
                          key={`bank-${bank.id_wallet}-${bank.name}`}
                          value={`${bank.id_wallet}-${bank.name}`}
                        >
                          {bank.name}
                        </option>
                      ))}
                  </optgroup>

                  {/* GROUP E-WALLET */}
                  <optgroup label="E-Wallets">
                    {bankOptions
                      .filter((bank) => bank.type_wallet === "2")
                      .map((bank, index) => (
                        <option
                          key={`ewallet-${bank.id_wallet}-${bank.name}`}
                          value={`${bank.id_wallet}-${bank.name}`}
                        >
                          {bank.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* Account Number */}
              <div>
                <label className="text-xs font-bold text-white block mb-2">{t("account_number")} *</label>
                <input
                  type="text"
                  value={newBankForm.accountNumber}
                  onChange={(e) => setNewBankForm({ ...newBankForm, accountNumber: e.target.value })}
                  placeholder={t("enter_banknumber") || "Masukkan nomor rekening"}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border-2 border-gray-700 focus:outline-none placeholder-gray-500"
                  style={{ borderColor: COLORS.primary.light }}
                />
              </div>

              {/* Account Holder Name */}
              <div>
                <label className="text-xs font-bold text-white block mb-2">{t("bank_account_name")} *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={newBankForm.accountHolder}
                    onChange={(e) => setNewBankForm({ ...newBankForm, accountHolder: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border-2 border-gray-700 focus:outline-none"
                    style={{ borderColor: COLORS.primary.light }}
                  />
                  {/* <span className="absolute right-4 top-3 text-xs text-yellow-400">(Diambilkan dari data user)</span> */}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddBankModal(false)}
                className="flex-1 px-4 py-3 rounded-lg font-bold text-sm text-white bg-gray-700 hover:bg-gray-600 transition-all"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => {
                  if (newBankForm.selectedBank && newBankForm.accountNumber) {
                    toast.success("Rekening bank berhasil ditambahkan!");
                    setShowAddBankModal(false);
                    setNewBankForm({ selectedBank: "", accountNumber: "", accountHolder: "supri" });
                  }
                }}
                className="flex-1 px-4 py-3 rounded-lg font-bold text-sm text-white"
                style={{ backgroundColor: COLORS.secondary.orange }}
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ===== TAB: REFERRAL =====
  const renderReferralTab = () => {
    const isPending = reffRequestStatus === 0;
    const isApproved = reffRequestStatus === 1;
    const showTree = isApproved && referralData.hasReferrals;

    return (
      <div className="space-y-6">

        {/* ===============================
            FORM SECTION
        =============================== */}
        {!showTree && (
          <div
            className="bg-white rounded-xl p-6 border-2"
            style={{ borderColor: COLORS.primary.light }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">👥</div>
              <div>
                <h3 className="text-pink-500 text-sm font-bold">
                  {t("referral_program")}
                </h3>
                <p className="text-xs text-gray-600">
                  {t("earn_bonus_from_referrals")}
                </p>
              </div>
            </div>

            {/* 🔥 Pending Notice */}
            {isPending && (
              <div className="bg-yellow-100 rounded-lg p-3 mb-4 text-sm text-yellow-800 border border-yellow-300">
                Pengajuan referral sedang diproses
              </div>
            )}

            <div className="space-y-4">

              {/* FIRST NAME (SESSION) */}
              <div>
                <label className="text-xs font-bold text-pink-500">
                  Nama *
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.username || ""}
                  className="text-gray-500 w-full mt-2 px-3 py-2 border-2 rounded-lg text-sm bg-gray-100"
                  style={{ borderColor: COLORS.primary.light }}
                />
              </div>

              {/* PHONE (SESSION) */}
              <div>
                <label className="text-xs font-bold text-pink-500">
                  Nomor Telepon *
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.phonenumber || ""}
                  className="text-gray-500 w-full mt-2 px-3 py-2 border-2 rounded-lg text-sm bg-gray-100"
                  style={{ borderColor: COLORS.primary.light }}
                />
              </div>

              {/* EMAIL (MANUAL) */}
              <div>
                <label className="text-xs font-bold text-pink-500">
                  Email *
                </label>
                <input
                  type="email"
                  disabled={isPending}
                  value={referralData.email}
                  onChange={(e) =>
                    setReferralData({
                      ...referralData,
                      email: e.target.value,
                    })
                  }
                  placeholder="Masukkan email aktif"
                  className="text-gray-500 w-full mt-2 px-3 py-2 border-2 rounded-lg text-sm"
                  style={{ borderColor: COLORS.primary.light }}
                />
              </div>

              {/* ADDRESS (MANUAL) */}
              <div>
                <label className="text-xs font-bold text-pink-500">
                  Alamat *
                </label>
                <input
                  type="text"
                  disabled={isPending}
                  value={referralData.address}
                  onChange={(e) =>
                    setReferralData({
                      ...referralData,
                      address: e.target.value,
                    })
                  }
                  placeholder="Masukkan alamat lengkap"
                  className="text-gray-500 w-full mt-2 px-3 py-2 border-2 rounded-lg text-sm"
                  style={{ borderColor: COLORS.primary.light }}
                />
              </div>

              {/* BANK FROM WALLET */}
              <div>
                <label className="text-xs font-bold text-pink-500">
                  {t("bank_ewallet")} *
                </label>
                <select
                  disabled={isPending}
                  value={referralData.bank}
                  onChange={(e) =>
                    setReferralData({
                      ...referralData,
                      bank: e.target.value,
                    })
                  }
                  className="text-gray-500 w-full mt-2 px-3 py-2 border-2 rounded-lg text-sm"
                  style={{ borderColor: COLORS.primary.light }}
                >
                  <option value="">
                    --- {t("choose_bank_ewallet")} ---
                  </option>

                  {bankAccounts.map((wallet: any) => (
                    <option
                      key={wallet.account_number}
                      value={wallet.id_wallet}
                    >
                      {wallet.bank_name} - {wallet.account_number}
                    </option>
                  ))}
                </select>
              </div>

              {/* UPLOAD IDENTITAS */}
              <div>
                <label className="text-xs font-bold text-pink-500">
                  {t("identity_file")} *
                </label>

                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors mt-2"
                  style={{ borderColor: COLORS.primary.light }}
                >
                  <input
                    type="file"
                    id="identity-upload"
                    disabled={isPending}
                    onChange={handleIdentityUpload}
                    className="hidden"
                    accept="image/*"
                  />

                  <label
                    htmlFor="identity-upload"
                    className={`cursor-pointer block ${isPending ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <p className="text-4xl mb-2">🪪</p>
                    <p className="font-bold text-gray-700">
                      {identityFile ? identityFile.name : t("click_upload_identity")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Format: JPG / PNG - Maks 10MB
                    </p>
                  </label>

                  {/* PROGRESS BAR */}
                  {uploadingIdentity && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded">
                        <div
                          className="bg-yellow-500 h-2 rounded"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs mt-1">
                        Upload {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {/* PREVIEW */}
                  {identityPreview && (
                    <div className="mt-3">
                      <img
                        src={identityPreview}
                        alt="preview"
                        className="w-full rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                disabled={isPending || uploadingIdentity}
                onClick={handleSubmitReferral}
                className={`w-full mt-6 px-4 py-2 rounded-lg font-bold text-sm text-white ${
                  isPending || uploadingIdentity
                    ? "bg-gray-400 cursor-not-allowed"
                    : ""
                }`}
                style={{
                  backgroundColor:
                    isPending || uploadingIdentity
                      ? undefined
                      : COLORS.secondary.orange,
                }}
              >
                {uploadingIdentity ? "Uploading...." : t("send_application")}
              </button>

            </div>
          </div>
        )}

        {/* ===============================
            REFERRAL TREE SECTION
        =============================== */}
        {showTree && (
          <div
            className="bg-white rounded-xl p-6 border-2"
            style={{ borderColor: COLORS.primary.light }}
          >
            <h3 className="text-sm font-bold mb-4">
              🌳 {t("referral_tree")}
            </h3>

            <div className="text-right mb-4">
              <span
                className="text-xs font-bold"
                style={{ color: COLORS.secondary.orange }}
              >
                Total Referral: {referralData.referralTree.length}
              </span>
            </div>

            <div className="space-y-3">
              {referralData.referralTree.map((item: any, index: number) => (
                <div key={index}>
                  <div className="font-bold text-sm">
                    👤 {item.username}
                  </div>

                  {item.children?.length > 0 && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child: any, idx: number) => (
                        <div key={idx} className="text-xs text-gray-600">
                          ↳ {child.username}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ===== TAB: STATISTIK (Statistics) =====
  const renderStatisticsTab = () => (
    <div className="space-y-6">
      <div className="bg-pink-100 rounded-xl p-6 border-2" style={{ borderColor: COLORS.primary.light }}>
        <h3 className="text-gray-600 text-sm font-bold mb-4">📊 {t("data_turnover") || "Data Turnover"}</h3>
        <div className="text-xs text-pink-500 mb-4">{t("view_performance") || "Pantau performa bemain Anda dengan filter"}</div>

        {/* Filter Section */}
        <div className="mb-6 pb-6 border-b-2" style={{ borderColor: COLORS.primary.light }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🔍</span>
            <p className="text-gray-600 text-xs font-bold">{t("filter_data") || "Filter Data"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-pink-500">{t("start_date") || "Tanggal Mulai"}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-gray-600 w-full mt-2 px-3 py-2 border-2 rounded-lg text-sm"
                style={{ borderColor: COLORS.primary.light }}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-pink-500">{t("end_date") || "Tanggal Selesai"}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-gray-600 w-full mt-2 px-3 py-2 border-2 rounded-lg text-sm"
                style={{ borderColor: COLORS.primary.light }}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-pink-500">{t("category") || "Kategori"}</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-gray-600 w-full mt-2 px-3 py-2 border-2 rounded-lg text-sm"
                style={{ borderColor: COLORS.primary.light }}
              >
                <option value="">Semua Kategori</option>

                {datacategories.map((cat) => (
                  <option key={cat.id} value={cat.category}>
                    {cat.display_category}
                  </option>
                ))}

              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-pink-500">{t("provider") || "Provider"}</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="text-gray-600 w-full mt-2 px-3 py-2 border-2 rounded-lg text-sm"
                style={{ borderColor: COLORS.primary.light }}
              >
                <option value="">Semua Provider</option>

                {dataproviders.map((prov) => (
                  <option key={prov.id_mapping_provider} value={prov.provider_name}>
                    {prov.provider_display}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSearchTurnover}
            className="bg-pink-500 w-full mt-4 px-4 py-2 rounded-lg font-bold text-sm text-white"
            style={{ backgroundColor: COLORS.primary.main }}
          >
            {t("search_data") || "Cari Data"}
          </button>
        </div>

        {/* Results Section */}
        <div>
          <h4 className="text-gray-600 text-sm font-bold mb-4">
            Hasil Pencarian: {turnoverData.length} hasil
          </h4>

          {turnoverData.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm font-bold">Belum ada data turnover</p>
            </div>
          ) : (
            <table className="w-full text-xs border mt-4">
              <thead className="bg-pink-200">
                <tr>
                  <th className="p-2 border">Tanggal</th>
                  <th className="p-2 border">Provider</th>
                  <th className="p-2 border">Kategori</th>
                  <th className="p-2 border">Bet</th>
                  <th className="p-2 border">Win/Loss</th>
                </tr>
              </thead>
              <tbody>
                {turnoverData.map((item, i) => (
                  <tr key={i} className="text-center">
                    <td className="p-2 border">{item.date}</td>
                    <td className="p-2 border">{item.provider}</td>
                    <td className="p-2 border">{item.category}</td>
                    <td className="p-2 border">{item.total_bet}</td>
                    <td className="p-2 border">{item.win_loss}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: "profile", label: t("profile") || "Profil", icon: "👤" },
    { id: "security", label: t("security") || "Keamanan", icon: "🔒" },
    { id: "banking", label: t("banking") || "Perbankan", icon: "🏦" },
    { id: "referral", label: t("referral") || "Referral", icon: "🤝" },
    { id: "statistics", label: t("statistics") || "Statistik", icon: "📈" }
  ];

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
      <div className="flex items-center justify-between px-4 md:px-8 py-6 bg-pink-300 border-b-2" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)", borderColor: COLORS.primary.main }}>
        <button onClick={handleBackClick} className="text-white text-5xl font-bold">
          <ArrowLeft size={24} />
        </button>
        {seoData?.logo && (
            <img 
            src={seoData.logo} 
            alt="Logo"
            onClick={() => navigate("/")}
            className="h-16 w-auto flex-shrink-0" 
            />
          )}
        <div className="w-12"></div>
      </div>

      {/* User Info Board */}
      <div className="px-4 md:px-8 py-6 border-b-2 bg-pink-50" style={{ borderColor: COLORS.primary.main }}>
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="text-8xl">
                <img 
                  src={user?.tierImage ?? "-"} 
                  alt="Logo"
                  className="w-auto flex-shrink-0" 
                />
              </div>
          </div>
          <div className="text-gray-800 flex-1 flex flex-col justify-between text-right">
            <p className="font-bold text-sm" style={{ color: COLORS.primary.main }}>
              {user?.username}
            </p>
            <p className="font-bold text-2xl" style={{ color: COLORS.primary.main }}>
              {user?.idr_balance}
            </p>
            <p className="font-semibold text-sm" style={{ color: COLORS.primary.main }}>
              {user?.tierName}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Horizontal scroll only, no scrollbars */}
      <div className="bg-white border-b-2" style={{ borderColor: COLORS.primary.light }}>
        <div
          className="px-4 md:px-8 overflow-x-auto md:overflow-x-visible"
          style={{
            overflowY: "hidden",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
            // WebkitScrollbarWidth: "0"
          }}
          onWheel={(e) => {
            const element = e.currentTarget;
            if (e.deltaY !== 0) {
              e.preventDefault();
              element.scrollLeft += e.deltaY;
            }
          }}
        >
          <style>{`
            div[style*="overflow-x-auto"]::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className="flex gap-2 md:gap-0 md:flex-row">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`px-3 py-3 font-bold text-sm transition-all duration-300 border-b-4 transform text-center whitespace-nowrap md:flex-1`}
                style={{
                  backgroundColor: activeTab === tab.id ? COLORS.primary.light : "transparent",
                  color: activeTab === tab.id ? "white" : COLORS.primary.main,
                  borderColor: activeTab === tab.id ? COLORS.primary.main : "transparent",
                  transform: activeTab === tab.id ? "scale(1.05)" : "scale(1)"
                }}
              >
                <span className="inline-block mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {seoData?.custom_footer && (
        <div
          dangerouslySetInnerHTML={{
            __html: seoData.custom_footer
          }}
        />
      )}

      {/* Tab Content */}
      <div className="px-4 md:px-8 py-6 min-h-screen">
        {activeTab === "profile" && renderProfileTab()}
        {activeTab === "security" && renderSecurityTab()}
        {activeTab === "banking" && renderBankingTab()}
        {activeTab === "referral" && renderReferralTab()}
        {activeTab === "statistics" && renderStatisticsTab()}
      </div>
    </div>
  );
};

export default Profile;
