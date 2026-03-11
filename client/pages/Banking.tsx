import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { COLORS } from "@/config/colors";
import { useUser } from "@/context/UserContext";
import { apiRequest, uploadWithProgress } from "@/services/api";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { Braces, Copy } from "lucide-react";
import { build } from "vite";
import { fetchSeoPageAPI } from "@/services/seoService";
import { useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import bgImage2 from "@/assets/e2279a7a26bd6ebfe974eab10510df738c19d7c01ce07a6a92bb3f9a1b828022.webp";

type Tab = "deposit" | "withdraw" | "history";
type PaymentMethod = "qris" | "bank_transfer" | "e_wallet" | "pulsa" | null;
type QrisProvider = string | null;
type WalletId = string;

type AdminWallet = {
  id_wallet_admin: string
  id_wallet: string
  type_wallet: string
  bank_name: string
  account_name: string
  account_number: string
  image: string
  min_depo: number
  max_depo: number
  online: string
}

type UserWallet = {
  id: string
  id_wallet: string
  type_wallet: string
  bank_name: string
  account_name: string
  account_number: string
  amount: string
}

type Promo = {
  promo_id: string
  name: string
  profit_persentase: number
  promo_type: number
  tipe_bonus: number
  id_durasi: string
  limit: number
  used: number
}

interface BankingProps {
  pendingTransactions: any[];
}

declare global {
  interface Window {
    Tawk_API?: any;
  }
}

const Banking = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<Tab>("deposit");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(null);
  const [selectedQrisProvider, setSelectedQrisProvider]  = useState<WalletId  | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [selectedPromo, setSelectedPromo] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedDestinationBank, setSelectedDestinationBank] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");
  const [selectedAdminNumber, setSelectedAdminNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptFileName, setReceiptFileName] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalBank, setWithdrawalBank] = useState("");
  const { user, updateBalance, setUser  } = useUser();
  const [adminWallets, setAdminWallets] = useState<AdminWallet[]>([]);
  const [userBanks, setUserBanks] = useState<UserWallet[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loadingPromo, setLoadingPromo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { pendingTransactions } = useUser();
  const [transactionType, setTransactionType] = useState("all");

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
  if (!user?.username) return;

  const syncBalance = async () => {
    const res = await apiRequest("/balance", "POST");
    const balanceData = res?.data?.data;

    if (balanceData) {
      updateBalance(
        Number(balanceData.balance),
        balanceData.idr_balance
      );

      setUser(prev =>
        prev
          ? {
              ...prev,
              tierId: balanceData.id_tier,
              tierName: balanceData.name_tier,
            }
          : prev
      );
    }
  };

  syncBalance();
}, []);

useEffect(() => {
  if (!user?.id_tier) return;

  const loadBanking = async () => {
    const res = await apiRequest("/check-wallet-user", "POST", {
      transaction_type: "3",
      id_tier: user.id_tier,
      type_wallet: user.type_wallet
    });

    // console.log("RESPONSE:", res);

    if (res?.rcode === "00") {
      setAdminWallets(res.data_admin || []);
      setUserBanks(res.data_user || []);

      // console.log("DATA ADMIN:", res.data_admin);
      // console.log("DATA USER", res.data_user);
    }
  };

  loadBanking();
}, [user?.id_tier]);

  // Handle file upload
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // max 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB")
      return;
    }

    setReceiptFile(file);
    setReceiptFileName(file.name);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    setTransactionType("");
  };

  // Mock user data
  const userData = {
    username: user?.username ?? "-",
    balance: user?.idr_balance ?? 0,
    ranking: user?.tierName ?? "-"
  };

//========= FILTER ==========//

 const filteredAdmin = useMemo(() => {
  if (!user?.id_tier) return [];

  return adminWallets.filter(
    w =>
      w.id_wallet_admin === user.id_tier &&
      w.online === "1"
  );
}, [adminWallets, user?.id_tier]);

 const bankTransfer = useMemo(
  () => filteredAdmin.filter(w => w.type_wallet === "1"),
  [filteredAdmin]
);

const eWallets = useMemo(
  () => filteredAdmin.filter(w => w.type_wallet === "2"),
  [filteredAdmin]
);

const qrisWallets = useMemo(
  () => filteredAdmin.filter(w => w.type_wallet === "4"),
  [filteredAdmin]
);

//========== USER ==========//

useEffect(() => {
  if (userBanks.length > 0 && !selectedBank) {
    setSelectedBank(userBanks[0].id);
  }
}, [userBanks]);

//========= QRIS ==========//

useEffect(() => {
  if (qrisWallets.length > 0 && !selectedQrisProvider) {
    setSelectedQrisProvider(qrisWallets[0].id_wallet);
  }
}, [qrisWallets]);

const selectedQrisData = useMemo(() => {
  return qrisWallets.find(
    q => String(q.id_wallet) === String(selectedQrisProvider)
  );
}, [qrisWallets, selectedQrisProvider]);


//========= BANK ==========//

useEffect(() => {
  if (bankTransfer.length > 0 && !selectedDestinationBank) {
    setSelectedDestinationBank(bankTransfer[0].id_wallet);
  }
}, [bankTransfer]);

const selectedBankData = useMemo(() => {
  return bankTransfer.find(
    b => b.id_wallet === selectedDestinationBank
  );
}, [bankTransfer, selectedDestinationBank]);

useEffect(() => {
  if (bankTransfer.length > 0 && !selectedDestinationBank) {
    setSelectedDestinationBank(bankTransfer[0].id_wallet);
  }
}, [bankTransfer]);

//========= EWALLET ==========//

useEffect(() => {
  if (eWallets.length > 0 && !selectedWallet) {
    setSelectedWallet(eWallets[0].id_wallet);
  }
}, [eWallets]);

const selectedEwalletData = useMemo(() => {
  return eWallets.find(
    w => String(w.id_wallet) === String(selectedWallet)
  );
}, [eWallets, selectedWallet]);

useEffect(() => {
  if (eWallets.length > 0 && !selectedWallet) {
    setSelectedWallet(eWallets[0].id_wallet);
  }
}, [eWallets]);

//========= PROMO ==========//

const selectedPromoData = useMemo(() => {
  return promos.find(p => p.promo_id === selectedPromo);
}, [promos, selectedPromo]);

const calculateTotal = () => {
  const amount = Number(depositAmount) || 0;

const bonusAmount = useMemo(() => {
  if (!selectedPromoData) return 0;
    if (selectedPromoData.used >= selectedPromoData.limit) return 0;

    return (amount * selectedPromoData.profit_persentase) / 100;
  }, [amount, selectedPromoData]);

  const totalReceived = amount + bonusAmount;
};

//========= API PROMOTION ==========//
useEffect(() => {
  if (!user) return;
  if (activeTab !== "deposit") return;
  if (!selectedPaymentMethod) return;

  const loadPromo = async () => {
    setLoadingPromo(true);

    const res = await apiRequest("/get-promotion-user", "POST", {
      type_promo: "4",
      type_wallet: user.type_wallet
    });

    // console.log("Username :",user?.username)
    // console.log("TW :",user.type_wallet)

    // console.log("PROMO RESULT:", res);

    // console.log("PROMO RESULT PARSING:", res?.data?.rcode);
    

    if (res?.data?.rcode === "00") {
      setPromos(res.data?.data || []);
      // console.log("PROMO :", res.data)
    }

    setLoadingPromo(false);
  };

  loadPromo();
}, [user?.username, activeTab, selectedPaymentMethod]);

const amount = Number(depositAmount) || 0;

const bonusAmount = useMemo(() => {
  if (!selectedPromoData) return 0;

  if (selectedPromoData.used >= selectedPromoData.limit) return 0;

  return (amount * selectedPromoData.profit_persentase) / 100;
}, [amount, selectedPromoData]);

const totalReceived = amount + bonusAmount;

const handleCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Berhasil disalin")
  } catch (err) {
    toast.error("Gagal menyalin")
  }
};

  // Mock data for selections

  const pulsa = [
    { id: "xl", name: "XL - 087726681939 - XL" },
  ];

  const handleBackClick = () => {
    navigate("/");
  };

//============ DEPOSIT CLICK ============//
const [depositLoading, setDepositLoading] = useState(false);

const handleDepositClick = async () => {
  if (depositLoading) return;
  try {
    if (!selectedDestinationBank) {
      toast.error("Pilih rekening tujuan dulu")
      return;
    }

    if (!depositAmount) {
      toast.error("Masukan jumlah deposit")
      return;
    }

    setDepositLoading(true);

    const formData = new FormData();

    // formData.append("branch_id", BRANCH_ID);
    formData.append("username", user.username);
    formData.append("gameplayid", user.gameplayid);
    formData.append("gameplaynum", user.gameplaynum);

    // wallet user (rekening user)
    const userBankData = userBanks.find(
      b => String(b.id) === String(selectedBank)
    );

    formData.append(
      "wallet",
      `${userBankData.id_wallet};${userBankData.account_name};${userBankData.bank_name};${userBankData.account_number};${userBankData.type_wallet}`
    );

    // wallet admin (rekening tujuan)
    formData.append(
      "wallet_admin",
      `${selectedBankData.id_wallet_admin};${selectedBankData.account_name};${selectedBankData.bank_name};${selectedBankData.account_number};${userBankData.type_wallet}`
    );

    // bonus (kalau ada)
    if (selectedPromoData) {
      formData.append(
        "bonus",
        `${selectedPromoData.promo_id};${selectedPromoData.promo_type}`
      );
    }

    formData.append("amount", depositAmount);
    formData.append("description", notes || "-");
    formData.append("image_source", receiptFile);

    // console.log("=== DEPOSIT FORM DATA ===");

    for (let pair of formData.entries()) {
      // console.log(pair[0] + ":", pair[1]);
    }

    const res = await uploadWithProgress(
      "/deposit",
      formData,
      setUploadProgress
    );


    if (res.status) {
      toast.success("Deposit berhasil dikirim 🎉")

      // reset form
      setUploadProgress(0);
      setPreviewImage(null);
      setDepositAmount("");
      setReceiptFile(null);
      setReceiptFileName("");
      setSelectedPromo("");
      setNotes("");

      navigate("/");

    } else {
      toast.error(res.message || "Deposit gagal")
    }

  } catch (err) {
    toast.error(err)
    // console.log("Error :", err)
  } finally {
    setDepositLoading(false);
  }
};

const hasPending = pendingTransactions.some(
  (trx) => String(trx.flag_approve) === "0"
);

//============ WITHDRAW ===========//
const [withdrawLoading, setWithdrawLoading] = useState(false);

const handleWithdrawClick = async () => {
  if (!user) return;
  if (withdrawLoading) return;

  try {
    // 🔥 VALIDASI BANK
    if (!selectedBankData) {
      toast.error("Pilih rekening tujuan terlebih dahulu")
      return;
    }

    // 🔥 VALIDASI NOMINAL
    if (!withdrawalAmount) {
      toast.error("Masukkan nominal penarikan")
      return;
    }

    const amountNumber = Number(withdrawalAmount);

    if (isNaN(amountNumber)) {
      toast.error("Nominal harus berupa angka")
      return;
    }

    if (amountNumber > user.balance) {
      toast.error("Saldo tidak mencukupi")
      return;
    }

    if (amountNumber < 50000) {
      toast.error("Minimal penarikan IDR 50.000")
      return;
    }

    // 🔥 CEK ADA PENDING
    const hasPending = pendingTransactions.some(
      (trx) => String(trx.flag_approve) === "0"
    );

    if (hasPending) {
      toast.error("Masih ada transaksi pending")
      return;
    }

    setWithdrawLoading(true);

    const walletString = `${selectedBankData.id_wallet};${selectedBankData.account_name};${selectedBankData.bank_name};${selectedBankData.account_number};${selectedBankData.type_wallet}`;

    const res = await apiRequest("/withdraw", "POST", {
      wallet_user: walletString,
      amount: String(amountNumber),
      description: ""
    });

    if (res.status) {
      toast.success("Penarikan berhasil dikirim 💸")
      setWithdrawalAmount("");
      navigate("/");
    } else {
      toast.error(res.message || "Gagal lakukan penarikan")
    }

  } catch (err) {
    // console.log("Withdraw Error:", err);
    toast.error("Terjadi kesalahan sistem")
  } finally {
    setWithdrawLoading(false);
  }
};

//=========== History ============//

const [historyData, setHistoryData] = useState<any[]>([]);

const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;

const today = new Date().toISOString().split("T")[0];

const [startDate, setStartDate] = useState(today);
const [endDate, setEndDate] = useState(today);

const totalPages = Math.ceil(historyData.length / itemsPerPage);

const paginatedData = historyData.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

useEffect(() => {
  if (activeTab === "history") return;
  handleSearchHistory();
}, [activeTab, transactionType, startDate, endDate]);

const formatStartDate = (date: string) =>
  `${date} 00:00:00`;

const formatEndDate = (date: string) =>
  `${date} 23:59:59`;

const handleSearchHistory = async () => {
  if (!user) return;

  const res = await apiRequest("/history", "POST", {
    start_date: formatStartDate(startDate),
    end_date: formatEndDate(endDate),
    type: transactionType // all / deposit / withdraw
  });

  // console.log(res)

  if (res.status) {
    setHistoryData(res.data?.data ?? []);
    setCurrentPage(1);
  } else {
    toast.error(res.message || "Gagal ambil history")
  }
};

  return (
    <>
    <Toaster position="top-center" reverseOrder={false} />
    <div className="w-screen min-h-screen pb-24 md:pb-0 relative overflow-x-hidden"
      style={{
        backgroundImage: `url(${bgImage2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
      >
      {/* Header */}
      <div className="sticky top-0 z-40 shadow-md" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBackClick}
            className="text-5x1 font-bold text-white hover:text-gray-900 transition-colors leading-none"
          >
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
      </div>

      <div className="max-w-6xl mx-auto px-4 py-1" style={{ gap: "0.25rem" }}>
        {/* User Info Board */}
        <div className="bg-white rounded-xl px-6 py-4 mb-1 shadow-md border-2" style={{ borderColor: COLORS.primary.main }}>
          <div className="flex items-center gap-6">
            {/* Left - Single Large Tier Icon */}
            <div className="flex-shrink-0">
              <div className="text-8xl">
                <img 
                  src={user?.tierImage ?? "-"} 
                  alt="Logo"
                  className="w-auto flex-shrink-0" 
                />
              </div>
            </div>

            {/* Right - User Info (stacked vertically, right-aligned) */}
            <div className="flex-1 flex flex-col justify-between text-right">
              <p className="font-bold text-sm" style={{ color: COLORS.primary.main }}>
                {userData.username}
              </p>
              <p className="font-bold text-2xl" style={{ color: COLORS.primary.main }}>
                {userData.balance.toLocaleString()}
              </p>
              <p className="font-semibold text-sm" style={{ color: COLORS.primary.main }}>
                {userData.ranking}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="text-pink-500 flex gap-1 mb-1 border-b-2" style={{ borderColor: COLORS.primary.main }}>
          {["deposit", "withdraw", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={`flex-1 px-3 py-2 font-bold text-sm transition-all duration-300 border-b-4 transform text-center ${
                activeTab === tab
                  ? "text-white border-b-4 scale-105"
                  : "text-pink-600 border-transparent hover:text-gray-900 scale-100"
              }`}
              style={{
                backgroundColor: activeTab === tab ? COLORS.primary.main : "transparent",
                color: activeTab === tab ? "white" : "inherit",
              }}
            >
              {tab === "deposit" && t("deposit")}
              {tab === "withdraw" && t("withdraw")}
              {tab === "history" && t("history")}
            </button>
          ))}
        </div>

        {/* Deposit Tab */}
        {activeTab === "deposit" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-1">
              {/* Payment Method Selection */}
              <div className="bg-white rounded-xl p-4 shadow-md border-2" style={{ borderColor: COLORS.primary.light }}>
                <h2 className="text-sm font-bold mb-1" style={{ color: COLORS.primary.main }}>
                  {t("choose_deposit_method")}
                </h2>
                <p className="text-xs text-gray-600 mb-3">{t("choose_payment_method")}</p>

                {/* Mobile: 2x2 grid, Desktop: 4 columns */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { id: "qris", label: t("qris"), duration: t("instant") },
                    { id: "bank_transfer", label: t("bank_transfer"), duration: t("30_60_seconds") },
                    { id: "e_wallet", label: t("e_wallet"), duration: t("30_60_seconds") },
                    { id: "pulsa", label: t("pulsa"), duration: t("30_60_seconds") }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setSelectedPaymentMethod(method.id as PaymentMethod);
                        setSelectedQrisProvider(null);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all text-center lg:text-left font-bold ${
                        selectedPaymentMethod === method.id
                          ? "text-white border-2"
                          : "text-2 border-2"
                      }`}
                      style={{
                        backgroundColor: selectedPaymentMethod === method.id ? COLORS.primary.light : "white",
                        borderColor: selectedPaymentMethod === method.id ? COLORS.primary.main : COLORS.primary.light,
                        color: selectedPaymentMethod === method.id ? "white" : COLORS.primary.main
                      }}
                    >
                      {/* Desktop: Show all info */}
                      <div className="hidden lg:block">
                        <div className="text-3xl mb-2">
                          {method.id === "qris" && "📱"}
                          {method.id === "bank_transfer" && "🏦"}
                          {method.id === "e_wallet" && "💳"}
                          {method.id === "pulsa" && "☎️"}
                        </div>
                        <p className="font-bold text-sm">{method.label}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {method.id === "qris" && t("scan_qr_instant")}
                          {method.id === "bank_transfer" && t("transfer_bank_for_deposit")}
                          {method.id === "e_wallet" && t("dana_ovo_gopay")}
                          {method.id === "pulsa" && t("deposit_via_pulsa")}
                        </p>
                        <p className="text-xs font-semibold mt-2" style={{ color: COLORS.secondary.orange }}>
                          {method.duration}
                        </p>
                      </div>

                      {/* Mobile: Show only text */}
                      <div className="lg:hidden">
                        <p className="font-bold text-sm">{method.label}</p>
                        <p className="text-xs font-semibold mt-2" style={{ color: COLORS.secondary.orange }}>
                          {method.duration}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* QRIS Method */}
              {selectedPaymentMethod === "qris" && (
                <div className="bg-white rounded-xl p-4 shadow-md border-2" style={{ borderColor: COLORS.primary.light }}>
                  <h3 className="text-sm font-bold mb-2" style={{ color: COLORS.primary.main }}>
                    {t("select_qris_provider")}
                  </h3>

                  <div className="space-y-2 mb-4">
                    {qrisWallets.map((provider) => (
                      <button
                        key={`${provider.id_wallet_admin}-${provider.id_wallet}`}
                        onClick={() => setSelectedQrisProvider(provider.id_wallet)}
                        className={`w-full flex items-center gap-4 p-3 rounded-lg border-2 transition-all text-left font-bold ${
                          selectedQrisProvider === provider.id_wallet
                            ? "text-white"
                            : ""
                        }`}
                        style={{
                          backgroundColor:
                            selectedQrisProvider === provider.id_wallet
                              ? COLORS.primary.light
                              : "white",
                          borderColor: COLORS.primary.main,
                          color:
                            selectedQrisProvider === provider.id_wallet
                              ? "white"
                              : COLORS.primary.main
                        }}
                      >
                        <img
                          src={provider.image}
                          alt={provider.bank_name}
                          className="w-10 h-10 object-contain"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-sm">{provider.bank_name}</p>
                          <p className="text-xs text-green-500 font-semibold mt-1">
                            {provider.online === "1" ? "Online" : "Offline"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Amount and Promo */}
                  <div className="space-y-1">
                    <div>
                      <label className="block font-bold mb-1 text-xs" style={{ color: COLORS.primary.main }}>
                        {t("deposit_amount")} *
                      </label>
                        <span className="font-bold text-gray-600 text-xs">{t("idr")}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder={t("enter_deposit_amount")}
                          className="w-full text-black flex-1 px-2 py-1 border-2 border-gray-300 rounded text-xs focus:outline-none"
                          style={{ borderColor: COLORS.primary.light }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {t("minimum")} IDR {Number(selectedBankData?.min_depo ?? 0).toLocaleString()} |
                        {t("maximum")} IDR {Number(selectedBankData?.max_depo ?? 0).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-xs" style={{ color: COLORS.primary.main }}>
                        {t("choose_promo")}
                      </label>
                      <select
                        value={selectedPromo}
                        onChange={(e) => setSelectedPromo(e.target.value)}
                        className="w-full px-2 py-1 border-2 rounded text-xs"
                      >
                        <option value="">Tanpa Promo</option>

                        {promos.map((promo) => (
                          <option key={promo.promo_id} value={promo.promo_id}>
                            {promo.name} - Bonus {promo.profit_persentase}%
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer Method */}
              {selectedPaymentMethod === "bank_transfer" && (
                <div className="bg-white rounded-xl p-4 shadow-md border-2 space-y-1" style={{ borderColor: COLORS.primary.light }}>
                  <h3 className="text-sm font-bold mb-2" style={{ color: COLORS.primary.main }}>
                    Formulir Deposit - {t("bank_transfer")}
                  </h3>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: COLORS.primary.main }}>
                      {t("deposit_amount")} *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-600">{t("idr")}</span>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder={t("enter_deposit_amount")}
                        className="w-full text-black flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                        style={{ borderColor: COLORS.primary.light }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {t("minimum")} IDR {Number(selectedBankData?.min_depo ?? 0).toLocaleString()} |
                      {t("maximum")} IDR {Number(selectedBankData?.max_depo ?? 0).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: COLORS.primary.main }}>
                      {t("select_your_account")} *
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="text-black w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                      style={{ borderColor: COLORS.primary.light }}
                    >
                      {userBanks.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.bank_name} - {bank.account_number}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: COLORS.primary.main }}>
                      {t("destination_account")} *
                    </label>
                    <select
                      value={selectedDestinationBank}
                      onChange={(e) => setSelectedDestinationBank(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none text-black"
                      style={{ borderColor: COLORS.primary.light }}
                    >
                      {bankTransfer.map((bank) => (
                        <option
                          key={`${bank.id_wallet_admin}-${bank.id_wallet}-${bank.account_number}`}
                          value={bank.id_wallet_admin}
                        >
                          {bank.bank_name} - {bank.account_name} - {bank.account_number}
                        </option>
                      ))}
                    </select>
                    {selectedBankData && (
                      
                      <div
                        className="bg-pink-500 rounded-xl p-4 shadow-md border-2 space-y-1" style={{ borderColor: COLORS.primary.light }}
                      >
                        <h4 className="font-bold mb-3">🏦 Rekening Tujuan</h4>

                        <div className="flex justify-between text-sm mb-2">
                          <span>Nama Bank:</span>
                          <span>{selectedBankData.bank_name}</span>
                        </div>

                        <div className="flex justify-between text-sm mb-2">
                          <span>Nama Rekening:</span>
                          <span>{selectedBankData.account_name}</span>
                        </div>

                        <div className="flex justify-between items-center text-sm font-semibold">
                          <span>Nomor Rekening:</span>

                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400">
                              {selectedBankData.account_number}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(selectedBankData.account_number)
                              }
                              className="p-1 rounded hover:bg-yellow-500/20 transition"
                              title="Copy nomor rekening"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: COLORS.primary.light }}>
                    <input
                      type="file"
                      id="receipt-upload-bank-transfer"
                      onChange={handleReceiptUpload}
                      className="hidden"
                      accept="image/*,application/pdf"
                    />
                    <label
                      htmlFor="receipt-upload-bank-transfer"
                      className="cursor-pointer block"
                    >
                      <p className="text-4xl mb-2">📁</p>
                      <p className="font-bold text-gray-700">
                        {receiptFileName || t("click_upload_receipt")}
                      </p>
                    </label>
                    {depositLoading && (
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
                    {previewImage && (
                      <div className="mt-3">
                        <img
                          src={previewImage}
                          alt="preview"
                          className="w-full rounded-lg border"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: COLORS.primary.main }}>
                      {t("additional_notes")}
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t("enter_notes")}
                      className=" text-black w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                      style={{ borderColor: COLORS.primary.light }}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: COLORS.primary.main }}>
                      {t("choose_promo")}
                    </label>
                    <select
                      value={selectedPromo}
                      onChange={(e) => setSelectedPromo(e.target.value)}
                      className="text-black w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                      style={{ borderColor: COLORS.primary.light }}
                    >
                      {promos.map((promo) => (
                        <option
                          key={promo.promo_id}
                          value={promo.promo_id}
                        >
                          {promo.name} - Bonus {promo.profit_persentase}%
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* E-Wallet Method */}
              {selectedPaymentMethod === "e_wallet" && (
                <div className="bg-white rounded-xl p-4 shadow-md border-2 space-y-1" style={{ borderColor: COLORS.primary.light }}>
                  <h3 className="text-sm font-bold mb-2" style={{ color: COLORS.primary.main }}>
                    Formulir Deposit - {t("e_wallet")}
                  </h3>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: COLORS.primary.main }}>
                      {t("deposit_amount")} *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder={t("enter_deposit_amount")}
                        className="w-full text-black flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                        style={{ borderColor: COLORS.primary.light }}
                      />
                      <span className="font-bold text-gray-600">{t("idr")}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {t("minimum")} IDR {Number(selectedBankData?.min_depo ?? 0).toLocaleString()} |
                      {t("maximum")} IDR {Number(selectedBankData?.max_depo ?? 0).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: COLORS.primary.main }}>
                      {t("select_your_account")} *
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="text-black w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                      style={{ borderColor: COLORS.primary.light }}
                    >
                      {userBanks.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.bank_name} - {bank.account_number}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: COLORS.primary.main }}>
                      {t("select_wallet")} *
                    </label>
                    <select
                      value={selectedWallet}
                      onChange={(e) => setSelectedWallet(e.target.value)}
                      className="text-black w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                      style={{ borderColor: COLORS.primary.light }}
                    >
                        {eWallets.map((wallet) => (
                          <option
                            key={`${wallet.id_wallet_admin}-${wallet.id_wallet}`}
                            value={wallet.id_wallet_admin}
                          >
                            {wallet.bank_name} - {wallet.account_name} - {wallet.account_number}
                          </option>
                        ))}
                    </select>
                    {selectedEwalletData && (
                      <div
                        className="bg-pink-500 rounded-xl p-4 shadow-md border-2 space-y-1" style={{ borderColor: COLORS.primary.main }}
                      >
                        <h4 className="font-bold mb-3">💳 E-Wallet Tujuan</h4>

                        <div className="flex justify-between text-sm mb-2">
                          <span>Provider:</span>
                          <span>{selectedEwalletData.bank_name}</span>
                        </div>

                        <div className="flex justify-between text-sm mb-2">
                          <span>Nama Akun:</span>
                          <span>{selectedEwalletData.account_name}</span>
                        </div>

                        <div className="flex justify-between items-center text-sm font-semibold">
                          <span>Nomor:</span>

                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400">
                              {selectedEwalletData.account_number}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(selectedEwalletData.account_number)
                              }
                              className="p-1 rounded hover:bg-yellow-500/20 transition"
                              title="Copy nomor"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: COLORS.primary.light }}>
                    <input
                      type="file"
                      id="receipt-upload-ewallet"
                      onChange={handleReceiptUpload}
                      className="hidden"
                      accept="image/*,application/pdf"
                    />
                    <label
                      htmlFor="receipt-upload-ewallet"
                      className="cursor-pointer block"
                    >
                      <p className="text-4xl mb-2">📁</p>
                      <p className="font-bold text-gray-700">
                        {receiptFileName || t("click_upload_receipt")}
                      </p>
                    </label>
                  </div>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: COLORS.primary.main }}>
                      {t("additional_notes")}
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t("enter_notes")}
                      className="text-black w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                      style={{ borderColor: COLORS.primary.light }}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: COLORS.primary.main }}>
                      {t("choose_promo")}
                    </label>
                    <select
                      value={selectedPromo}
                      onChange={(e) => setSelectedPromo(e.target.value)}
                      className="text-black w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                      style={{ borderColor: COLORS.primary.light }}
                    >
                      {promos.map((promo) => (
                        <option
                          key={promo.promo_id}
                          value={promo.promo_id}
                        >
                          {promo.name} - Bonus {promo.profit_persentase}%
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Pulsa Method */}
              {selectedPaymentMethod === "pulsa" && (
                <div className="bg-white rounded-xl p-4 shadow-md border-2 space-y-1" style={{ borderColor: COLORS.primary.light }}>
                  <h3 className="text-sm font-bold mb-2" style={{ color: COLORS.primary.main }}>
                    Formulir Deposit - {t("pulsa")}
                  </h3>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: COLORS.primary.main }}>
                      {t("select_admin_number")} *
                    </label>
                    <select
                      value={selectedAdminNumber}
                      onChange={(e) => setSelectedAdminNumber(e.target.value)}
                      className="text-black w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                      style={{ borderColor: COLORS.primary.light }}
                    >
                      <option value="">Pilih Nomor Admin</option>
                      {pulsa.map((admin) => (
                        <option key={admin.id} value={admin.id}>
                          {admin.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: COLORS.primary.main }}>
                      {t("deposit_amount")} *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder={t("enter_deposit_amount")}
                        className="w-full text-black flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                        style={{ borderColor: COLORS.primary.light }}
                      />
                      <span className="font-bold text-gray-600">{t("idr")}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {t("minimum")} IDR {Number(selectedBankData?.min_depo ?? 0).toLocaleString()} |
                      {t("maximum")} IDR {Number(selectedBankData?.max_depo ?? 0).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: COLORS.primary.main }}>
                      {t("recipient_phone")} *
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={t("enter_recipient_phone")}
                      className="text-black w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                      style={{ borderColor: COLORS.primary.light }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Payment Summary */}
            {selectedPaymentMethod && (
              <div className="lg:col-span-1">
                <div
                  className="bg-pink-500 rounded-xl p-4 shadow-md border-2 space-y-1" style={{ borderColor: COLORS.primary.main }}
                >
                  <h3 className="text-sm font-bold mb-3">
                    Ringkasan Pembayaran
                  </h3>

                  {/* Deposit */}
                  <div className="flex justify-between text-sm mb-2">
                    <span>Jumlah Deposit:</span>
                    <span>Rp {amount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm mb-2">
                    <span>Jumlah Pembayaran:</span>
                    <span>Rp {amount.toLocaleString()}</span>
                  </div>

                  {/* BONUS SECTION (Muncul hanya jika ada promo) */}
                  {bonusAmount > 0 && (
                    <>
                      <div className="border-t border-white my-2"></div>

                      <div className="flex justify-between text-sm text-yellow-400 mb-2">
                        <span>Bonus Promo:</span>
                        <span>+ Rp {bonusAmount.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between text-sm font-semibold text-yellow-400 mb-2">
                        <span>Total yang diterima:</span>
                        <span>Rp {totalReceived.toLocaleString()}</span>
                      </div>
                    </>
                  )}

                  <div className="border-t border-white my-2"></div>

                  {/* TOTAL */}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-yellow-400">
                      Rp {amount.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={handleDepositClick}
                    disabled={depositLoading || hasPending}
                    className="w-full py-2 rounded-lg font-bold text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#f5d77a" }}
                  >
                    {hasPending
                      ? "Masih ada transaksi pending"
                      : depositLoading
                      ? "Memproses..."
                      : "Konfirmasi Transaksi"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === "withdraw" && (
          <div className="space-y-1">
            {/* Header */}
            <div className="bg-white rounded-xl p-4 shadow-md border-2 mb-4" style={{ borderColor: COLORS.primary.light }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">💳</div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: COLORS.primary.main }}>
                    {t("withdrawal")}
                  </h2>
                  <p className="text-xs text-gray-600">Tarik dana ke rekening bank Anda</p>
                </div>
              </div>
            </div>

            {/* Withdrawal Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
              {/* Left Column - Form */}
              <div className="lg:col-span-2 space-y-1">
                <div className="bg-white rounded-xl p-4 shadow-md border-2" style={{ borderColor: COLORS.primary.light }}>
                  <div>
                    <label className="block font-bold mb-2" style={{ color: COLORS.primary.main }}>
                      {t("select_your_account")} *
                    </label>
                    <select
                      value={withdrawalBank}
                      onChange={(e) => setWithdrawalBank(e.target.value)}
                      className="text-black w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                      style={{ borderColor: COLORS.primary.light }}
                    >
                      {userBanks.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.bank_name} - {bank.account_number}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block font-bold mb-2" style={{ color: COLORS.primary.main }}>
                      {t("withdraw_amount")} *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-600">{t("idr")}</span>
                      <input
                        type="number"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        placeholder="Masukkan jumlah penarikan"
                        className="w-full text-black flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                        style={{ borderColor: COLORS.primary.light }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {t("minimum")} IDR {Number(selectedBankData?.min_depo ?? 0).toLocaleString()} |
                      {t("maximum")} IDR {Number(selectedBankData?.max_depo ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Warning Box */}
                <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                  <div className="flex gap-3">
                    <div className="text-2xl">⚠️</div>
                    <div>
                      <p className="font-bold text-sm text-yellow-900">Perhatian:</p>
                      <p className="text-xs text-yellow-800 mt-1">
                        Penarikan akan diproses dalam 1-5 menit. Pastikan data rekening sudah benar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-4 shadow-md sticky top-32 border-2" style={{ borderColor: COLORS.primary.main }}>
                  <h3 className="text-sm font-bold mb-3" style={{ color: COLORS.primary.main }}>
                    ℹ️ Informasi Penarikan
                  </h3>

                  <div className="space-y-2 border-b-2 pb-2" style={{ borderColor: COLORS.primary.light }}>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Saldo Tersedia:</span>
                      <span className="font-bold" style={{ color: COLORS.primary.main }}>
                        {userData.balance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Jumlah Penarikan:</span>
                      <span className="font-bold" style={{ color: COLORS.primary.main }}>
                        IDR {(parseInt(withdrawalAmount) || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between mt-2 mb-2">
                    <span className="text-sm font-bold">{t("total")}:</span>
                    <span className="text-lg font-bold" style={{ color: COLORS.primary.main }}>
                      IDR {(parseInt(withdrawalAmount) || 0).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={handleWithdrawClick}
                    disabled={withdrawLoading}
                    className="w-full py-2 rounded-lg font-bold text-black disabled:opacity-50"
                    style={{ backgroundColor: "#f5d77a" }}
                  >
                    {withdrawLoading ? "Memproses..." : "Konfirmasi Withdraw"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-1">
            {/* Header */}
            <div className="bg-white rounded-xl p-4 shadow-md border-2 mb-4" style={{ borderColor: COLORS.primary.light }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">📜</div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: COLORS.primary.main }}>
                    {t("history_transaction")}
                  </h2>
                  <p className="text-xs text-gray-600">{t("history_transaction_span")}</p>
                </div>
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-xl p-4 shadow-md border-2 mb-4" style={{ borderColor: COLORS.primary.light }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">🔍</div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: COLORS.primary.main }}>
                    {t("filter_transaction")}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {t("filter_transaction_span")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: COLORS.primary.main }}>
                    {t("start_date")}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-black w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none text-xs"
                    style={{ borderColor: COLORS.primary.light }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: COLORS.primary.main }}>
                    {t("finish_date")}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-black w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none text-xs"
                    style={{ borderColor: COLORS.primary.light }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: COLORS.primary.main }}>
                    {t("type_transaction")}
                  </label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    className="text-black w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none text-xs"
                    style={{ borderColor: COLORS.primary.light }}
                  >
                    <option value="all">Semua Transaksi</option>
                    <option value="deposit">Deposit</option>
                    <option value="withdraw">Penarikan</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleSearchHistory}
                    className="w-full py-2 rounded-lg font-bold text-white text-xs transition-all hover:shadow-lg"
                    style={{ backgroundColor: COLORS.secondary.orange }}
                  >
                    {t("search_history")}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
              <div className="bg-white rounded-xl p-4 shadow-md border-2" style={{ borderColor: COLORS.primary.light }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-2xl">📋</div>
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: COLORS.primary.main }}>
                      {t("history_result")}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {historyData.length} {t("find_transaction")}
                    </p>
                  </div>
                </div>

                {/* 🔥 JIKA ADA DATA */}
                {historyData.length > 0 ? (
                  <div className="space-y-3">
                    {paginatedData.map((trx: any) => (
                      <div
                        key={trx.txid}
                        className="border rounded-lg p-3 hover:shadow-md transition-all"
                        style={{ borderColor: COLORS.primary.light }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p
                              className="font-bold text-sm capitalize"
                              style={{ color: COLORS.primary.main }}
                            >
                              {trx.source}
                            </p>
                            <p className="text-xs text-gray-500">
                              {trx.datetime}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-sm">
                              {trx.amount}
                            </p>

                            <p
                              className={`text-xs font-bold ${
                                trx.flag_approve === "0"
                                  ? "text-yellow-500"
                                  : trx.flag_approve === "1"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {trx.flag_approve === "0"
                                ? "Pending"
                                : trx.flag_approve === "1"
                                ? "Disetujui"
                                : "Ditolak"}
                            </p>
                          </div>
                        </div>

                        <div className="text-xs text-gray-600 space-y-1">
                          <p>
                            <span className="font-bold">TXID:</span> {trx.txid}
                          </p>

                          <p>
                            <span className="font-bold">Bank:</span>{" "}
                            {trx.jenisbank_client}
                          </p>

                          {trx.description && trx.description !== "-" && (
                            <p>
                              <span className="font-bold">Keterangan:</span>{" "}
                              {trx.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-6 gap-2">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => prev - 1)}
                          className="px-3 py-1 rounded border text-xs"
                        >
                          Prev
                        </button>

                        <span className="text-xs font-bold px-3 py-1">
                          {currentPage} / {totalPages}
                        </span>

                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          className="px-3 py-1 rounded border text-xs"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 🔥 EMPTY STATE */
                  <div className="flex flex-col items-center justify-center py-12">
                    <div
                      className="text-5xl mb-4"
                      style={{ color: COLORS.primary.main }}
                    >
                      ⏰
                    </div>

                    <p className="font-bold text-sm text-gray-700 mb-2">
                      Tidak ada transaksi ditemukan
                    </p>

                    <p className="text-xs text-gray-600 text-center mb-6">
                      Coba ubah filter atau tanggal pencarian untuk melihat riwayat transaksi
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={handleResetFilter}
                        className="px-6 py-2 rounded-lg font-bold text-sm transition-all border-2"
                        style={{
                          borderColor: COLORS.primary.main,
                          color: COLORS.primary.main,
                          backgroundColor: "white"
                        }}
                      >
                        Reset Filter
                      </button>

                      <button
                        onClick={handleSearchHistory}
                        className="px-6 py-2 rounded-lg font-bold text-white text-sm transition-all hover:shadow-lg"
                        style={{ backgroundColor: COLORS.secondary.orange }}
                      >
                        Coba Lagi
                      </button>
                    </div>
                  </div>
                )}
              </div>
          </div>
        )}

        {seoData?.custom_footer && (
          <div
            dangerouslySetInnerHTML={{
              __html: seoData.custom_footer
            }}
          />
        )}
      </div>

      <style>{`
        * {
          scrollbar-width: none;
        }
        *::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
    </>
  );
};

export default Banking;
