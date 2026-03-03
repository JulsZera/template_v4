import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useLanguage, Language } from "@/context/LanguageContext";
import { fetchAllProviders, fetchProvidersByCategory, ProviderData, fetchProviderAPI, Game, getBalance, launchGame } from "@/services/api";
import { Wallet, Home, Zap, TrendingUp, Gift, Menu, X, Eye, EyeOff, LogOut, Search, Settings, Globe } from "lucide-react";
import { fetchPageData } from "@/services/api";
import { apiRequest } from "@/services/api";
import { getCategories } from "@/services/api";
import { fetchGameList } from "@/services/api";
import { getMostPlay } from "@/services/api";
import { getBanners } from "@/services/api";
import { getBankStatus } from "@/services/api";
import { getSEO } from "@/services/api";
import { getPopup } from "@/services/api";
import toast from "react-hot-toast";
import { useUser } from "@/context/UserContext";
import { COLORS } from "@/config/colors";

export default function Index() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ category?: string; provider?: string }>();
  const { t, language, setLanguage } = useLanguage();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [marqueePosition, setMarqueePosition] = useState(0);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState("gamehit");
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [dynamicProviders, setDynamicProviders] = useState<ProviderData[]>([]);
  const [dynamicGames, setDynamicGames] = useState<Game[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [loadingGames, setLoadingGames] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [bankStatus, setBankStatus] = useState<any[]>([]);
  const [popup, setPopup] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [customFooter, setCustomFooter] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(21);
  const [seoData, setSeoData] = useState<any>(null);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const { user, setUser, updateBalance, pendingTransactions, setPendingTransactions, logout } = useUser();
  const isLoggedIn = !!user;
  const [showPendingPopup, setShowPendingPopup] = useState(false);
  const [animatePopup, setAnimatePopup] = useState(false);
  const [currentPopupData, setCurrentPopupData] = useState<any>(null);
  const BRANCH_ID = import.meta.env.VITE_BRANCH_ID;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [allProviders, setAllProviders] = useState<ProviderData[]>([]);
  
  // const [turnover, setTurnover ] = useState<any>(null);

  // useEffect(() => {
  //   console.log("USER DI INDEX:", user);
  // }, [user]);
 
//======================================================//
//==================== USE EFFECT ======================//
//======================================================//

//================   S  E  O   ==================//

const injectScript = (id: string, content: string, target: "head" | "body" = "head") => {
  if (!content) return;

  if (document.getElementById(id)) return;

  const script = document.createElement("script");
  script.id = id;
  script.innerHTML = content;

  if (target === "head") {
    document.head.appendChild(script);
  } else {
    document.body.appendChild(script);
  }
};

const injectHTML = (id: string, html: string, target: "head" | "body" = "body") => {
  if (!html) return;

  if (document.getElementById(id)) return;

  const container = document.createElement("div");
  container.id = id;
  container.innerHTML = html;

  if (target === "head") {
    document.head.appendChild(container);
  } else {
    document.body.appendChild(container);
  }
};

const setMetaTag = (property: string, content: string) => {
  let element = document.querySelector(`meta[property='${property}']`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

const setNameMeta = (name: string, content: string) => {
  let element = document.querySelector(`meta[name='${name}']`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

const injectRawHTML = (id: string, content: string, target: "head" | "body" = "head") => {
  if (!content) return;

  if (document.getElementById(id)) return;

  const container = document.createElement("div");
  container.id = id;
  container.innerHTML = content;

  if (target === "head") {
    document.head.appendChild(container);
  } else {
    document.body.appendChild(container);
  }
};

useEffect(() => {
  if (!seoData) return;

  // ===============================
  // CANONICAL
  // ===============================
  if (seoData.custom_canonical_global) {
    let link = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", seoData.custom_canonical_global);
  }

  // ===============================
  // META PIXEL (Tiktok / GTM)
  // ===============================
  if (seoData.meta_pixel) {
    injectRawHTML("meta_pixel_script", seoData.meta_pixel, "head");
  }

  // ===============================
  // GLOBAL HEAD SCRIPT
  // ===============================
  if (seoData.custom_script_global) {
    injectRawHTML("custom_script_global", seoData.custom_script_global, "head");
  }

  // ===============================
  // GLOBAL BODY SCRIPT
  // ===============================
  if (seoData.custom_script_body_global) {
    injectRawHTML("custom_script_body_global", seoData.custom_script_body_global, "body");
  }

  // ===============================
  // PAGE SCRIPT
  // ===============================
  if (seoData.custom_script_page) {
    injectRawHTML("custom_script_page", seoData.custom_script_page, "body");
  }

  // ===============================
  // LIVECHAT
  // ===============================
  if (seoData.script_livechat) {
    injectRawHTML("livechat_script", seoData.script_livechat, "body");
  }

}, [seoData]);

useEffect(() => {
  if (!seoData) return;

  document.title =
    seoData.default_website_title || seoData.website_name;

  const desc = seoData.running_text || "";

  setNameMeta("description", desc);
  setMetaTag("og:title", seoData.default_website_title || "");
  setMetaTag("og:description", desc);
  setMetaTag("og:image", seoData.logo || "");

  // 🔥 Inject custom head script
  injectScript("seo-head-script", seoData.script_head, "head");

  // 🔥 Inject body script
  injectScript("seo-body-script", seoData.script_body, "body");

  // 🔥 Inject custom HTML
  injectHTML("seo-custom-html", seoData.custom_html, "body");

}, [seoData]);

useEffect(() => {
  if (!seoData) return;

  if (seoData.flag_custom_footer === "1" && seoData.custom_footer) {
    setCustomFooter(seoData.custom_footer);
  }

}, [seoData]);

//====================END SEO====================//

useEffect(() => {
  const init = async () => {
    await fetchPageData();

    const seo = getSEO();
    const popupData = getPopup();
    const bannerRaw = getBanners();

    setCategories(getCategories());
    setBankStatus(getBankStatus());
    setSeoData(seo);
    setPopup(popupData);

    const formatted = bannerRaw.map((b: any, index: number) => ({
      id: b.id || index + 1,
      image: b.url_mobile || b.url || "",
    }));

    setBanners(formatted);
    setDynamicGames(getMostPlay());

    if (popupData && popupData.status === "1") {
      setShowPopup(true);
    }
    // 🔥 TAMBAHKAN INI
    const providers = await fetchAllProviders();
      setAllProviders(providers);
    };

  init();
}, []);

useEffect(() => {
  if (activeCategory === "gamehit") {
    setDynamicGames(getMostPlay());
  }
}, [activeCategory]);

useEffect(() => {
  if (!seoData) return;

  document.title = seoData.default_website_title || seoData.website_name;

  const desc = seoData.running_text || "";

  let metaDesc = document.querySelector("meta[name='description']");
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.setAttribute("name", "description");
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute("content", desc);

  if (seoData.favicon) {
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "icon");
      document.head.appendChild(link);
    }
    link.setAttribute("href", seoData.favicon);
  }

}, [seoData]);

useEffect(() => {
  if (!banners.length) {
    const data = getBanners();
    if (data && data.length > 0) {
      setBanners(data);
    }
  }
}, []);

  useEffect(() => {

    const path = location.pathname.split("/")[1];
    // root = Game Hit
    if (!path) {
      setActiveCategory("gamehit");
      setSelectedProvider("");
      return;
    }
    setActiveCategory(path);
    setSelectedProvider("");
  }, [location.pathname]);

useEffect(() => {

  if (!selectedProvider || selectedProvider === "") {
    if (activeCategory !== "gamehit") {
      setDynamicGames([]);
    }
    return;
  }
  const loadGames = async () => {

    try {
      setLoadingGames(true);
      // console.log("CALL FETCH:", activeCategory, selectedProvider);
      const games = await fetchGameList(
        activeCategory,
        selectedProvider,
        filterType
      );
      setDynamicGames(games);
    } catch (err) {
      console.error("Load game error:", err);
    } finally {
      setLoadingGames(false);
    }
  };

  loadGames();

}, [activeCategory, selectedProvider, filterType]);

//============== LOGIN Include Profile and Get Balance ==============//

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoginLoading(true);
  setLoginError("");

  try {
    const res = await apiRequest("/login", "POST", {
      branch_id: BRANCH_ID,
      username: loginPhone,
      password: loginPassword,
      client_ip: "127.0.0.1",
    });

    if (res.status) {
      const jwt = res.data.jwt;

      // console.log("JWT :", jwt)

      localStorage.setItem("jwt", jwt);
      setJwtToken(jwt);

      // 🔥 HIT PROFILE
      const profileRes = await apiRequest("/profile", "POST");

      // 🔥 HIT BALANCE
      const balanceRes = await apiRequest("/balance", "POST");

      const pendingData = balanceRes?.data?.data_pending || [];
      const hasPendingDeposit = pendingData.length > 0;
      const balanceData = balanceRes?.data?.data;

      const decoded = parseJwt(jwt);
      //  console.log("DECODED JWT:", decoded); // 👈 TARUH DI SINI
      
      const userData = {

        username: decoded?.username || loginPhone,
        gameplayid: decoded?.gameplayid || "",
        gameplaynum: decoded?.gameplaynum || "",
        sessionToken: decoded?.token || "",
        name: decoded?.name || "",
        email: decoded?.email || "",
        phonenumber: decoded?.phonenumber || "",

        id_tier: balanceData.id_tier,
        balance: Number(balanceData.balance),
        idr_balance: balanceData.idr_balance,
        type_wallet: balanceData.type_wallet,
        tierName: balanceData.name_tier,
        tierImage: balanceData.tier_image,
        referralCode: profileRes?.data?.refferal_code,

        hasPendingDeposit,
      };

      setUser(userData);
      // console.log("USER AFTER SET:", userData);
      // console.log("FULL LOGIN RESPONSE:", res);
      localStorage.setItem("userData", JSON.stringify(userData));
      processBalanceResponse(balanceRes);
      // setAuthLoading(false); // 🔥 TAMBAHKAN DI SINI
      // console.log("SET USER SUCCESS");
      setShowSignInModal(false);

      toast.success("Login berhasil 🎉")
    } else {
      setLoginError("Login gagal");
      toast.error("Login Gagal !")
    }
  } catch (err) {
    setLoginError("Server error");
    toast.error("Server Error")
  } finally {
    setLoginLoading(false);
  }
};

useEffect(() => {
  if (!popup) return;

  if (popup.status === "1") {
    setShowPopup(true);
  }

}, [popup]);

//========== POPUP TRANSACTION =============//

useEffect(() => {
  if (!user) return;

  const initCheck = async () => {
    const res = await getBalance();
    processBalanceResponse(res);
  };

  initCheck();
}, [user]);

const processBalanceResponse = (res: any) => {
  if (!user) return; 

  const balanceData = res?.data?.data;
  const pendingData = res?.data?.data_pending ?? [];

  if (balanceData) {
    updateBalance(
      Number(balanceData.balance),
      balanceData.idr_balance
    );
  }

  setPendingTransactions(pendingData);

  if (!pendingData.length) return;

  for (const trx of pendingData) {
    const approveFlag = String(trx.flag_approve);
    const popupFlag = String(trx.flag_popup_pending);

    const shouldShow =
      (approveFlag === "0" && popupFlag === "0") ||
      ((approveFlag === "1" || approveFlag === "2") &&
        popupFlag === "1");

    if (!shouldShow || showPendingPopup) continue;

    // 🔥 GUARD ANTI DOUBLE POPUP
    if (
      currentPopupData?.txid === trx.txid &&
      showPendingPopup
    ) {
      break;
    }

    setCurrentPopupData({
      ...trx,
      label:
        trx.transaction_type === "1"
          ? "Withdraw"
          : "Deposit"
    });
    setShowPendingPopup(true);
    setAnimatePopup(true);
    break;
  }
};

useEffect(() => {
  if (!user) return;

  const interval = setInterval(async () => {
    if (!localStorage.getItem("jwt")) return;  // 🔥 guard kedua
    const res = await getBalance();
    if (!res) return;
    processBalanceResponse(res);
  }, 5000);

  return () => clearInterval(interval);
}, [user]);

const closePopup = async () => {
  if (!currentPopupData) return;

  const approveFlag = String(currentPopupData.flag_approve);

  setAnimatePopup(false);

  setTimeout(async () => {
    setShowPendingPopup(false);

    let flagPopupValue = "0";

    // Pending pertama kali
    if (approveFlag === "0") {
      flagPopupValue = "0";
    }

    // Approved / Rejected
    if (approveFlag === "1" || approveFlag === "2") {
      flagPopupValue = "1";
    }

    await apiRequest("/update-popup-transaction", "POST", {
      branch_id: BRANCH_ID,
      username: user?.username,
      gameplayid: user?.gameplayid,
      gameplaynum: user?.gameplaynum,
      txid: currentPopupData.txid,
      transaction_type: currentPopupData.transaction_type,
      flag_popup: flagPopupValue
    });

  }, 300);
};

//============= END LOGIN ==============//

  // Update active category based on current path
  useEffect(() => {
    const path = location.pathname;
    const pathSegments = path.split("/").filter(Boolean);

    // Handle dynamic routes like /slot/pragmatic-play
    if (pathSegments.length >= 1) {
      const categoryMap: Record<string, string> = {
        slot: "slot",
        casino: "casino",
        sportsbook: "sportsbook",
        p2p: "p2p",
        fishing: "fishing",
        arcade: "arcade",
        cockfighting: "sabungayam",
        togel: "togel",
      };

      const firstSegment = pathSegments[0];
      if (categoryMap[firstSegment]) {
        setActiveCategory(categoryMap[firstSegment]);
        if (pathSegments.length >= 2 && pathSegments[1]) {
          setSelectedProvider(pathSegments[1]);
        } else {
          setSelectedProvider("");
        }
      } else if (path === "/") {
        setActiveCategory("gamehit");
        setSelectedProvider(undefined);
      }
    }
  }, [location.pathname]);

  // Fetch providers based on active category
  useEffect(() => {
    const fetchProviders = async () => {
      setLoadingProviders(true);
      try {
        // const providers = await fetchProvidersByCategory(activeCategory);
        const providers = await fetchProviderAPI(activeCategory);
        setDynamicProviders(providers);
      } catch (error) {
        console.error("Error fetching providers:", error);
      } finally {
        setLoadingProviders(false);
      }
    };
    fetchProviders();
  }, [activeCategory]);

  const [showPassword, setShowPassword] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showP2PModal, setShowP2PModal] = useState(false);
  const [p2pActiveTab, setP2pActiveTab] = useState("deposit");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showContactUsModal, setShowContactUsModal] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

//============== Search ==================//
const searchedGames = dynamicGames.filter(game =>
  game.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);  

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Marquee animation
  useEffect(() => {
    const interval = setInterval(() => {
      setMarqueePosition((prev) => (prev - 2) % 100);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Banner carousel auto-rotate
 useEffect(() => {

  if (banners.length === 0) return;

  const bannerInterval = setInterval(() => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  }, 4000);

  return () => clearInterval(bannerInterval);

}, [banners]);


//================Infinity loop
useEffect(() => {

  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 200
    ) {
      setVisibleCount(prev =>
        prev >= searchedGames.length ? prev : prev + 21
      );
    }
    // console.log("scrollY:", window.scrollY);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);

}, [searchedGames]);

useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev =>
          prev >= searchedGames.length ? prev : prev + 21
        );
      }
    },
    {
      root: null,
      rootMargin: "100px",
      threshold: 0,
    }
  );

  const currentRef = loadMoreRef.current;

  if (currentRef) {
    observer.observe(currentRef);
  }

  return () => {
    if (currentRef) {
      observer.unobserve(currentRef);
    }
  };
}, [searchedGames]);

useEffect(() => {
  setVisibleCount(21);
}, [selectedProvider, activeCategory, filterType]);

//=========ANNOUNCE===========//

  const getAnnouncements = () => {

    if (!seoData?.running_text) return [];

    return [seoData.running_text];

  };

  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [angpaos, setAngpaos] = useState<Array<{ id: number; left: number; delay: number; duration: number; type: 'angpao' | 'sakura' }>>([]);
  const announcements = getAnnouncements();

  useEffect(() => {
    if (announcements.length === 0) return;

    const announcementInterval = setInterval(() => {
      setCurrentAnnouncementIndex(prev =>
        (prev + 1) % announcements.length
      );
    }, 90000);

    return () => clearInterval(announcementInterval);

  }, [announcements.length]);

  // Generate falling angpao and sakura animation
  useEffect(() => {
    const generateAngpaos = () => {
      const newAngpaos = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 4,
        type: i % 2 === 0 ? 'angpao' : 'sakura' as 'angpao' | 'sakura',
      }));
      setAngpaos(newAngpaos);
    };

    generateAngpaos();
    const interval = setInterval(generateAngpaos, 12000);
    return () => clearInterval(interval);
  }, []);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "th", name: "ไทย", flag: "🇹🇭" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "km", name: "ខ្មែរ", flag: "🇰🇭" },
    { code: "tl", name: "Tagalog", flag: "🇵🇭" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
  ];

  const [categories, setCategories] = useState<any[]>([]);

  // Use dynamic games from API
  const games = dynamicGames;

  const bottomNav = [
    { id: "signin", label: "Sign In", icon: Wallet, image: "https://cdn.builder.io/api/v1/image/assets%2Fde66772a80b6454ba51a7d50705077af%2F89b010deb2f04b32b1027d3012b6a231?format=webp&width=800&height=1200" },
    { id: "hubkami", label: "Hub Kami", icon: Gift, image: "https://cdn.builder.io/api/v1/image/assets%2Fde66772a80b6454ba51a7d50705077af%2Ff87297ac959d4da1b9ac030a09813433?format=webp&width=800&height=1200" },
    { id: "home", label: "Home", icon: Home, image: "https://cdn.builder.io/api/v1/image/assets%2Fde66772a80b6454ba51a7d50705077af%2F27626cbafb9b444caf22473615bb9e71?format=webp&width=800&height=1200" },
    { id: "promotion", label: "Promotion", icon: Zap, image: "https://cdn.builder.io/api/v1/image/assets%2Fde66772a80b6454ba51a7d50705077af%2F35917e8a65d9491ebb70a9842d491bf9?format=webp&width=800&height=1200" },
  ];

  const menuItems = [
    { icon: "💰", label: "Deposit - Withdraw" },
    { icon: "👤", label: "Profile" },
    { icon: "📜", label: "History" },
    { icon: "📢", label: "Promotion" },
    { icon: "💳", label: "Cashback" },
    { icon: "💵", label: "Earn Money" },
    { icon: "🎁", label: "Credit/Point Free" },
    { icon: "🎟️", label: "Coupon" },
    { icon: "🎰", label: "Randombox" },
    { icon: "🎡", label: "Wheel" },
    { icon: "✅", label: "Check In" },
    { icon: "🏆", label: "Ranking" },
    { icon: "💬", label: "Contact us" },
    { icon: "🇹🇭", label: "Switch language" },
    { icon: "📖", label: "Manual" },
    { icon: "📱", label: "Download Guild" },
  ];

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // setIsLoggedIn(true);
    setShowSignUpModal(false);
  };

  const handleLogout = () => {
    // console.log("CLICK LOGOUT");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setShowMenu(false);
    logout();
    navigate("/");
    toast("Logout berhasil 👋");
    console.log("USER BEFORE LOGOUT:", user);
    console.log("INDEX RENDER USER:", user);
  };

  const handleLaunchGame = async (game: any) => {
  if (!user) {
    toast.error("Silakan login dulu");
    return;
  }

  try {
    const payload = {
      game_id: game.game_id,
      game_code: game.game_code,
      id_mapping_provider: game.id_mapping_provider,
      provider_name: game.provider,
      category: game.category,
      type_game: "0",
    };

    const res = await launchGame(payload);

    // console.log("RCODE :", res)

    if (res?.status === true) {

      const providerData = res.data;

      // 🔥 CASE URL
      if (providerData?.status === "URL" && typeof providerData.data === "string") {
        window.open(providerData.data, "_blank");
        return;
      }

      // 🔥 CASE HTML
      if (providerData?.status === "HTML" && typeof providerData.data === "string") {
        const newWindow = window.open("", "_blank");
        newWindow?.document.write(providerData.data);
        newWindow?.document.close();
        return;
      }

    } else {
      toast.error(res?.message || "Gagal membuka game");
    }

  } catch (err) {
    toast.error("Terjadi kesalahan saat membuka game");
  }
};

//=============== TURN OVER =============//

const fetchTurnover = async () => {
  if (!user) return;

  const today = new Date();
  const past = new Date();
  past.setMonth(today.getMonth() - 1);

  const formatDate = (date: Date) =>
    date.toISOString().split("T")[0];

  const res = await apiRequest("/turnover", "POST", {
    branch_id: BRANCH_ID,
    username: user.username,
    gameplayid: user.gameplayid,
    gameplaynum: user.gameplaynum,
    category: "All",
    provider: "All",
    start_date: formatDate(past),
    end_date: formatDate(today),
  });

  // console.log("TURNOVER RES:", res);

  if (res?.data?.data) {
    const data = res.data.data;

    // setTurnover({
    //   current: data.total_turnover ?? "0.00",
    //   target: data.target_turnover ?? "0.00",
    // });
  }
};

useEffect(() => {
  if (showWalletModal) {
    fetchTurnover();
  }
}, [showWalletModal]);

  // if (authLoading) return null;
  // console.log("RENDER USER:", user);
  // LOGGED OUT VIEW
  if (!user) {
  return (
      <div className="w-screen min-h-screen pb-24 md:pb-0 relative overflow-x-hidden" style={{ backgroundColor: "#F1C8D6" }}>
        {/* Header */}
        <header className="sticky top-0 z-40 shadow-lg" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
          {/* Mobile Header - Logged Out */}
          <div className="flex items-center justify-between px-3 py-2 md:hidden gap-2">
            {seoData?.logo && (
              <img 
              src={seoData.logo} 
              alt="Logo"
              className="h-20 w-auto flex-shrink-0" 
              />
            )}

            {/* Right - Sign In/Register for mobile */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setShowSignInModal(true)}
                className="text-white font-bold px-3 py-2 rounded-full text-xs transition-all hover:shadow-lg auth-button-enter auth-button-glow"
                style={{ background: "#F178A1" }}
              >
                {t("sign_in")}
              </button>
              <button
                onClick={() => navigate("/register")}
                className="text-white font-bold px-3 py-2 rounded-full text-xs transition-all hover:shadow-lg auth-button-enter auth-button-glow"
                style={{ background: "#F178A1" }}
              >
                {t("sign_up")}
              </button>
            </div>
          </div>

          {/* Desktop Header - Logged Out */}
          <div className="hidden md:flex items-center justify-between px-4 py-3 desktop-header">
            {/* Center - Logo (desktop only) */}
              {seoData?.logo && (
                <img 
                src={seoData.logo} 
                alt="Logo"
                className="h-28 w-auto flex-shrink-0" 
                />
              )}

            {/* Right - Sign In/Register/Language for desktop */}
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setShowSignInModal(true)}
                className="text-white font-bold px-6 py-3 rounded-full text-sm transition-all hover:shadow-lg auth-button-enter auth-button-glow"
                style={{ background: "#F178A1" }}
              >
                {t("sign_in")}
              </button>
              <button
                onClick={() => navigate("/register")}
                className="text-white font-bold px-6 py-3 rounded-full text-sm transition-all hover:shadow-lg auth-button-enter auth-button-glow"
                style={{ background: "#F178A1" }}
              >
                {t("sign_up")}
              </button>

              {/* Language Dropdown */}
              <div className="relative ml-2">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="text-white font-bold px-4 py-3 rounded-full text-sm transition-all hover:bg-white/20 flex items-center gap-1"
                >
                  🌐
                </button>
                {showLanguageDropdown && (
                  <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-2xl z-50 overflow-hidden min-w-max">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLanguageDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition-all text-gray-800 ${
                          language === lang.code ? "bg-pink-100" : ""
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-semibold">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Marquee Announcement */}
        <div className="bg-gray-600 overflow-hidden py-2">
          <div
            ref={marqueeRef}
            className="whitespace-nowrap text-white text-xs font-semibold"
            style={{
              animation: "marquee 20s linear infinite",
            }}
          >
            {getAnnouncements()[currentAnnouncementIndex]}
          </div>
        </div>

        {/* Hero Banner Carousel */}
        <div style={{ padding: "0.25rem" }}>
          {banners.length > 0 && banners[currentBannerIndex] && (
            <div
              className="rounded-lg p-6 text-white text-center shadow-lg relative overflow-hidden banner-container flex items-center justify-center flex-col gap-3 transition-all duration-500"
              style={{
                backgroundImage: `url(${banners[currentBannerIndex]?.image || ""})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >

            <div className="flex gap-2 absolute bottom-3">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBannerIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentBannerIndex ? "bg-white w-6" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
          )}
        </div>

        {/* Provider Cards Section */}
        {dynamicProviders.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ padding: "0.25rem" }}>
            {dynamicProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  const categoryPath = activeCategory === "sabungayam" ? "cockfighting" : activeCategory;
                  navigate(`/${categoryPath}/${provider.slug}`);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  selectedProvider === provider.slug
                    ? "bg-gradient-to-r from-pink-400 to-pink-300 text-white"
                    : "bg-gradient-to-t from-[#FFC1DA] to-[#F178A1] shadow-[0_0_10px_rgba(241,120,161,0.5)] hover:bg-gray-100"
                }`}
              >
                <img
                  src={provider.image}
                  alt={provider.name}
                  className="h-8 w-auto object-contain"
                />
              </button>
            ))}
          </div>
        )}

        {/* Search Bar Section */}
        <div className="space-y-3" style={{ padding: "0.25rem" }}>
          {/* Search Bar */}
        {isSearchExpanded ? (
          <div
            className="flex items-center gap-2 bg-white rounded-lg animate-expand-search"
            style={{
              marginTop: "calc(0.25rem * calc(1 - var(--tw-space-y-reverse)))",
              padding: "0.5rem 0.75rem",
            }}
          >
            <Search size={18} className="text-gray-500 flex-shrink-0" />
            <input
              type="text"
              placeholder={t("search_games")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => setIsSearchExpanded(false)}
              autoFocus
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500"
            />
          </div>
        ) : (
          <button
            onClick={() => setIsSearchExpanded(true)}
            className="flex items-center justify-center bg-white rounded-lg hover:bg-gray-100 transition-all"
            style={{
              marginTop: "calc(0.25rem * calc(1 - var(--tw-space-y-reverse)))",
              width: "40px",
              height: "40px",
            }}
          >
            <Search size={18} className="text-gray-500" />
          </button>
        )}
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="flex gap-3 overflow-x-hidden" style={{ padding: "0.25rem" }}>
          <div className="flex flex-col gap-2 category-button" style={{ width: "58px" }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(cat.path)}
                className={`py-1 px-1 rounded-lg font-bold transition-all transform hover:animate-bounce category-button ${
                  activeCategory === cat.id ? "scale-105 shadow-lg animate-pulse" : ""
                } text-white flex flex-col items-center justify-center overflow-hidden`}
                style={{
                  background: "linear-gradient(180deg, #F178A1 0%, #FFC1DA 100%)",
                  fontSize: "10px",
                  minHeight: "58px"
                }}
              >
                {cat.emoji ? (
                  <div style={{ fontSize: "16px", animation: activeCategory === cat.id ? 'spin-icon 2s linear infinite' : 'bounce-icon 2s ease-in-out infinite' }}>{cat.emoji}</div>
                ) : (
                  <img
                    src={cat.image}
                    alt={cat.label}
                    style={{
                      width: "32px",
                      height: "32px",
                      objectFit: "contain",
                      animation: activeCategory === cat.id ? 'spin-icon 2s linear infinite' : 'bounce-icon 2s ease-in-out infinite'
                    }}
                  />
                )}
                <div style={{ fontSize: "9px", lineHeight: "1.1", marginTop: "2px", textAlign: "center" }}>{cat.label}</div>
              </button>
            ))}
          </div>

          <div className="flex-1">

            {loadingGames && (
              <div className="grid gap-2 responsive-game-grid"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))" }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-300 rounded-lg"
                    style={{
                      aspectRatio: "5/7",
                    }}
                  />
                ))}
              </div>
            )}

            {activeCategory === "gamehit" ? (
              // 🔥 GAME HIT (mostplay)
              <div
                className="grid gap-2 responsive-game-grid"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))" }}
              >
                {searchedGames.slice(0, visibleCount).map((game, idx) => (
                  <div
                    key={game.id}
                    onClick={() => handleLaunchGame(game)}
                    className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:scale-105 group"
                    style={{
                      backgroundImage: `url(${game.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      aspectRatio: "5/5",
                      minWidth: "80px",
                      maxWidth: "110px",
                      animation: `blink-card 2s ease-in-out ${idx * 0.1}s infinite`,
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <button className="bg-cyan-300 text-black font-bold px-3 py-1 rounded-full text-xs">
                        {t("play")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            ) : !selectedProvider ? (

              // 🔥 PROVIDER LIST
              <div
                className="grid gap-2 responsive-game-grid"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))" }}
              >
                {dynamicProviders.map((provider, idx) => (
                  <div
                    key={provider.id}
                    onClick={() =>
                      navigate(`/${activeCategory}/${provider.slug}`)
                    }
                    className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:scale-105 group"
                    style={{
                      backgroundImage: `url(${provider.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      aspectRatio: "7/4",
                      minWidth: "90px",
                      maxWidth: "120px",
                      animation: `blink-card 2s ease-in-out ${idx * 0.1}s infinite`,
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <button className="bg-cyan-300 text-black font-bold px-3 py-1 rounded-full text-xs">
                        {provider.name}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            ) : (

                <>
                  {/* 🔥 FILTER BUTTON */}
                  <div className="flex gap-2 mb-3 flex-wrap">

                    <button
                      onClick={() => setFilterType("all")}
                      className={`px-3 py-1 rounded-full text-xs ${
                        filterType === "all"
                          ? "bg-pink-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      Semua Game
                    </button>

                    <button
                      onClick={() => setFilterType("new")}
                      className={`px-3 py-1 rounded-full text-xs ${
                        filterType === "new"
                          ? "bg-pink-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      New
                    </button>

                    <button
                      onClick={() => setFilterType("hot")}
                      className={`px-3 py-1 rounded-full text-xs ${
                        filterType === "hot"
                          ? "bg-pink-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      Hot
                    </button>

                  </div>

                  {/* 🔥 GAME GRID */}
                  <div
                    key={`${activeCategory}_${selectedProvider}_${filterType}`}
                    className="grid gap-2 responsive-game-grid"
                    style={{
                      gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                    }}
                  >
                    {searchedGames.slice(0, visibleCount).map((game, idx) => (
                      <div
                        key={game.id}
                        onClick={() => handleLaunchGame(game)}
                        className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:scale-105 group"
                        style={{
                          backgroundImage: `url(${game.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          aspectRatio: "5/5",
                          minWidth: "80px",
                          maxWidth: "110px",
                          animation: `blink-card 2s ease-in-out ${
                            idx * 0.1
                          }s infinite`,
                        }}
                      >
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <button className="bg-cyan-300 text-black font-bold px-3 py-1 rounded-full text-xs">
                            {t("play")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div ref={loadMoreRef} style={{ height: 1 }} />
                </>
              )}
          </div>
        </div>

        {/* Premium Bank Section - Grid Version */}
          {bankStatus.length > 0 && (
            <div className="px-4 mt-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Supported Payment
              </h2>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {bankStatus.map((bank, index) => (
                  <div
                    key={index}
                    className="bg-white/70 backdrop-blur-md rounded-xl p-3 flex items-center justify-center shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <img
                      src={bank.image}
                      alt={bank.name}
                      className="max-h-7 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Provider Game Section - Grid Version */}
          {allProviders.length > 0 && (
            <div className="px-4 mt-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Provider Game
              </h2>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {allProviders
                  .sort((a: any, b: any) => (a.sort_by || 0) - (b.sort_by || 0))
                  .map((provider, index) => (
                    <div
                      key={provider.id || index}
                      className="bg-white/70 backdrop-blur-md rounded-xl p-3 flex items-center justify-center shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <img
                        src={provider.image}
                        alt={provider.name}
                        className="max-h-8 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.png";
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ===============================
            CUSTOM FOOTER (FROM CMS)
          =============================== */}
          {customFooter && (
             <div className="mt-10 w-full overflow-hidden">
              <div
                dangerouslySetInnerHTML={{ __html: customFooter }}
              />
            </div>
          )}

          {seoData?.link_livechat && (
            <a
              href={seoData.link_livechat}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg z-50"
            >
              Live Chat
            </a>
          )}

        {/* Bottom Navigation - Logged Out View */}
        <nav className="bottom-nav fixed bottom-0 left-0 right-0 px-2 py-2 flex justify-around items-center z-50 shadow-2xl" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
          {bottomNav.map((item) => {
            const handleClick = () => {
              if (item.id === "signin") setShowSignInModal(true);
              if (item.id === "hubkami") setShowContactUsModal(true);
              if (item.id === "promotion") {
                // Require login for Promotion
                if (!user) {
                  setShowSignInModal(true);
                } else {
                  navigate('/promo');
                }
              }
              if (item.id === "home") {
                // Already on home, could scroll to top if needed
              }
            };

            return (
              <button
                key={item.id}
                onClick={handleClick}
                className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg hover:bg-white/20 transition-all group"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.label}
                    className="w-6 h-6 group-hover:scale-110 transition-transform"
                    style={{ objectFit: "contain" }}
                  />
                ) : null}
                <span className="text-xs font-semibold text-white">{item.label}</span>
              </button>
            );
          })}
          {/* Language Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg hover:bg-white/20 transition-all group"
            >
              <Globe size={24} className="text-white group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-white">{t("language")}</span>
            </button>
            {/* Language Dropdown Menu */}
            {showLanguageDropdown && (
              <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-2xl z-50 overflow-hidden min-w-max">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLanguageDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition-all ${
                      language === lang.code ? "bg-pink-100" : ""
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-semibold text-gray-800">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Sign In Modal */}
        {showSignInModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up" style={{ backgroundColor: "#F178A1" }}>
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
                <h2 className="text-white font-bold text-lg">{t("sign_in")}</h2>
                <button onClick={() => setShowSignInModal(false)} className="text-white hover:bg-white/20 p-1 rounded">
                  <X size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 px-6 pt-4">
                <button className="flex-1 py-2 rounded-full font-bold text-white" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
                  {t("sign_in")}
                </button>
                <button
                  onClick={() => {
                    setShowSignInModal(false);
                    navigate("/register");
                  }}
                  className="flex-1 py-2 rounded-full font-bold text-gray-600 bg-gray-200 hover:bg-gray-300"
                >
                  {t("sign_up")}
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSignIn} className="px-6 py-4 space-y-4">
                {/* Logo */}
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-2">
                    {seoData?.logo && (
                      <img 
                      src={seoData.logo} 
                      alt="Logo"
                      className="w-auto flex-shrink-0" 
                      />
                    )}
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-bold text-blue-600 mb-2">{t("username")}</label>
                  <input
                    type="text"
                    placeholder={t("Masukan Username Anda")}
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-blue-600 mb-2">{t("password")}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("please_enter_password")}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    {loginError && (
                      <div className="text-red-500 text-sm font-bold">
                        {loginError}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-gray-700">
                    <input type="checkbox" className="w-4 h-4" />
                    {t("remember_me")}
                  </label>
                  <a href="#" className="text-pink-500 hover:underline">
                    {t("forgot_password_q")}
                  </a>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg font-bold text-white transition-all hover:shadow-lg"
                  style={{ background: "linear-gradient(90deg, #B0FFFA 0%, #00F7FF 100%)", color: "#333" }}
                  disabled={loginLoading}
                >
                   {loginLoading ? "Loading..." : t("sign_in")}
                </button>

                {/* Footer */}
                <div className="text-center text-xs text-gray-600">
                  {t("found_problem")}{" "}
                  <a href="#" className="text-pink-500 font-bold hover:underline">
                    {t("contact_customer_service")}
                  </a>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sign Up Modal */}
        {showSignUpModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden my-8 animate-slide-up" style={{ backgroundColor: "#F178A1" }}>
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
                <h2 className="text-white font-bold text-lg">Sign Up</h2>
                <button onClick={() => setShowSignUpModal(false)} className="text-white hover:bg-white/20 p-1 rounded">
                  <X size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 px-6 pt-4">
                <button
                  onClick={() => {
                    setShowSignUpModal(false);
                    setShowSignInModal(true);
                  }}
                  className="flex-1 py-2 rounded-full font-bold text-gray-600 bg-gray-200 hover:bg-gray-300"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setShowSignUpModal(false);
                    navigate("/register");
                  }}
                  className="flex-1 py-2 rounded-full font-bold text-white"
                  style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}
                >
                  Sign Up
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSignUp} className="px-6 py-4 space-y-4">
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-bold text-blue-600 mb-2">Phone Number</label>
                  <input
                    type="text"
                    placeholder="Please, enter your phone number"
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-blue-600 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Please, enter your password"
                      className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Bank Selection */}
                <div>
                  <label className="block text-sm font-bold text-blue-600 mb-2">Choose your bank</label>
                  <select className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500">
                    <option>Choose your bank</option>
                  </select>
                </div>

                {/* Bank Number */}
                <div>
                  <label className="block text-sm font-bold text-blue-600 mb-2">Enter your Banknumber</label>
                  <input
                    type="text"
                    placeholder="Enter your Banknumber"
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-blue-600 mb-2">name - lastname</label>
                  <input
                    type="text"
                    placeholder="name - lastname"
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {/* How do you know us */}
                <div>
                  <label className="block text-sm font-bold text-blue-600 mb-2">How do you know us from?</label>
                  <select className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500">
                    <option>How do you know us?</option>
                  </select>
                </div>

                {/* Bonus Radio */}
                <div>
                  <label className="block text-sm font-bold text-blue-600 mb-2">Choose to receive a bonus or not</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-gray-700">
                      <input type="radio" name="bonus" className="w-4 h-4" />
                      Receive
                    </label>
                    <label className="flex items-center gap-2 text-gray-700">
                      <input type="radio" name="bonus" className="w-4 h-4" />
                      Not receive
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg font-bold text-white transition-all hover:shadow-lg"
                  style={{ background: "linear-gradient(90deg, #B0FFFA 0%, #00F7FF 100%)", color: "#333" }}
                >
                  SIGN UP
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Wallet Modal - Logged In Only */}
        {showWalletModal && user && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
            <div className="rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up my-8" style={{ backgroundColor: "#F178A1" }}>
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
                <h2 className="text-white font-bold text-lg">{t("wallet")}</h2>
                <button onClick={() => setShowWalletModal(false)} className="text-white hover:bg-white/20 p-1 rounded">
                  <X size={24} />
                </button>
              </div>

              {/* Wallet Content */}
              <div className="px-6 py-6 space-y-4">
                {/* Credit Balance Card */}
                <div className="bg-white rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-300 flex items-center justify-center text-2xl">
                    💰
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-700">Credit Balance</p>
                    <p className="text-2xl font-bold text-pink-500">{user?.idr_balance ?? "0.00"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Promotion</p>
                    <p className="text-sm font-bold text-gray-700">Turnover<br/>0.00/0.00</p>
                  </div>
                </div>

                {/* Wallet Buttons Grid */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: "🎁", label: "Credit Free" },
                    { icon: "📢", label: "Promotion" },
                    { icon: "🎯", label: "Point Free" },
                    { icon: "🎟️", label: "Coupon" },
                    { icon: "🎰", label: "Random Box" },
                    { icon: "🎡", label: "Wheel" },
                    { icon: "🏆", label: "Ranking" },
                    { icon: "💰", label: "Earn Money" },
                    { icon: "💳", label: "Cashback" },
                    { icon: "✅", label: "Check-in" },
                    { icon: "🎪", label: "Tournament" },
                    { icon: "🔄", label: "Exchange" },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      className="bg-white rounded-lg p-3 text-center hover:shadow-lg transition-all flex flex-col items-center gap-1"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-xs font-bold text-gray-700 line-clamp-2">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* P2P (Deposit) Modal */}
        {showP2PModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
            <div className="rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up my-8" style={{ backgroundColor: "#F178A1" }}>
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
                <h2 className="text-white font-bold text-lg">{t("deposit_withdraw")}</h2>
                <button onClick={() => setShowP2PModal(false)} className="text-white hover:bg-white/20 p-1 rounded">
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-4 space-y-4">
                {/* Tabs */}
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-full font-bold text-white" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
                    Deposit
                  </button>
                  <button className="flex-1 py-2 rounded-full font-bold text-gray-600 bg-gray-200 hover:bg-gray-300">
                    Withdraw
                  </button>
                </div>

                {/* Deposit Options */}
                <div className="space-y-3">
                  {[
                    { icon: "🤖", name: "Deposit auto" },
                    { icon: "🧮", name: "Deposit decimal" },
                    { icon: "💳", name: "Truemoney" },
                    { icon: "📋", name: "Deposit confirm slip" },
                    { icon: "🎁", name: "True gift" },
                    { icon: "✔️", name: "Deposit confirm" },
                  ].map((option, idx) => (
                    <button
                      key={idx}
                      className="w-full bg-white rounded-lg p-3 text-left hover:shadow-lg transition-all flex items-center gap-3"
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <span className="font-bold text-gray-700">{option.name}</span>
                    </button>
                  ))}
                </div>

                {/* Line Bot Notification */}
                <button className="w-full bg-green-500 hover:bg-green-600 rounded-full py-3 text-white font-bold flex items-center justify-center gap-2 transition-all">
                  <span>💬</span>
                  Line bot notification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
            <div className="rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up my-8" style={{ backgroundColor: "#F178A1" }}>
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
                <div className="flex items-center gap-2 text-white">
                  <button onClick={() => setShowWithdrawModal(false)} className="hover:bg-white/20 p-1 rounded">
                    <span className="text-xl">←</span>
                  </button>
                  <h2 className="font-bold text-lg">Normal withdraw</h2>
                </div>
                <button onClick={() => setShowWithdrawModal(false)} className="text-white hover:bg-white/20 p-1 rounded">
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-4 space-y-4">
                {/* Turnover Info */}
                <div className="bg-gray-500 rounded-lg p-3 text-white text-sm font-bold text-center">
                  Turnover 0.00/0.00 Max Withdraw
                </div>

                {/* Bank Selection */}
                <div>
                  <label className="text-sm text-white mb-2 block opacity-70">Withdraw you money to the account</label>
                  <button className="w-full bg-white rounded-lg p-3 flex items-center gap-2 font-bold text-gray-700 hover:shadow-lg transition-all">
                    <span className="text-xl">💎</span>
                    BIO
                  </button>
                </div>

                {/* Withdraw Button */}
                <button className="w-full bg-red-500 hover:bg-red-600 rounded-lg p-3 text-white font-bold transition-all">
                  ไม่สามารถถอนรายได้สูงสุด
                </button>

                {/* Footer Link */}
                <p className="text-white text-xs text-center opacity-70">
                  Have any further questions?{" "}
                  <a href="#" className="underline font-bold">
                    Readmore
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Us Modal */}
        {showContactUsModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
            <div className="rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up my-8" style={{ backgroundColor: "#F178A1" }}>
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
                <h2 className="text-white font-bold text-lg">{t("hub_kami")}</h2>
                <button onClick={() => setShowContactUsModal(false)} className="text-white hover:bg-white/20 p-1 rounded">
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-4">
                <div className="text-center text-white">
                  <p className="text-lg font-bold mb-4">Contact Us</p>
                  <div className="space-y-3">
                    {seoData?.link_livechat && (
                      <div
                        onClick={() => window.open(seoData.link_livechat, "_blank")}
                        className="bg-gray-200 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-300 transition"
                      >
                        <div className="font-semibold">Live Chat Support</div>
                        <div className="text-sm opacity-70">Available 24/7</div>
                      </div>
                    )}
                    <div className="bg-white rounded-lg p-4 text-gray-700">
                      <p className="font-bold">Email</p>
                      <p className="text-sm text-gray-600 mt-1">support@mastoto.com</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-gray-700">
                      <p className="font-bold">Telegram</p>
                      <p className="text-sm text-gray-600 mt-1">@mastoto_support</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-gray-700">
                      <p className="font-bold">Whatsapp</p>
                      <p className="text-sm text-gray-600 mt-1">+62 812 3456 7890</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {customFooter && (
          <div
            className="mt-6"
            dangerouslySetInnerHTML={{ __html: customFooter }}
          />
        )}

        {/* Falling Angpao & Sakura Animation */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-30">
          {angpaos.map((angpao) => (
            <div
              key={angpao.id}
              className="absolute animate-fall-angpao"
              style={{
                left: `${angpao.left}%`,
                width: "40px",
                height: "40px",
                animation: `fall-angpao ${angpao.duration}s linear ${angpao.delay}s infinite`,
                top: "-50px",
              }}
            >
              <div className="text-4xl drop-shadow-lg">
                {angpao.type === 'angpao' ? '🧧' : '🌸'}
              </div>
            </div>
          ))}
        </div>

        {/* Keyframes */}
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }

          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slide-right {
            from {
              opacity: 0;
              transform: translateX(-100%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }

          .animate-slide-up {
            animation: slide-up 0.4s ease-out;
          }

          .animate-slide-right {
            animation: slide-right 0.4s ease-out;
          }

          @keyframes expand-search {
            from {
              opacity: 0;
              width: 40px;
              transform: scaleX(0);
              transform-origin: left;
            }
            to {
              opacity: 1;
              width: 100%;
              transform: scaleX(1);
              transform-origin: left;
            }
          }

          .animate-expand-search {
            animation: expand-search 0.3s ease-out;
          }

          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

          @keyframes fall-angpao {
            0% {
              transform: translateY(-100vh) rotate(0deg);
              opacity: 1;
            }
            50% {
              transform: translateY(50vh) rotate(10deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(-10deg);
              opacity: 0;
            }
          }

          @keyframes sway {
            0%, 100% { transform: translateX(0) rotate(0deg); }
            25% { transform: translateX(30px) rotate(5deg); }
            75% { transform: translateX(-30px) rotate(-5deg); }
          }

          @keyframes blink-card {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(247, 82, 112, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 10px 2px rgba(247, 82, 112, 0.6), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              transform: scale(1.02);
            }
          }

          /* Hide scrollbar on mobile */
          /* Hide scrollbar on all views */
          ::-webkit-scrollbar {
            display: none;
          }
          body {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          @media (max-width: 768px) {
            ::-webkit-scrollbar {
              display: none;
            }
            body {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          }

          @keyframes spin-icon {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(1); }
          }

          @keyframes bounce-icon {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-5px) scale(1.05); }
          }

          @keyframes pulse-glow {
            0%, 100% {
              box-shadow: 0 0 10px rgba(241, 120, 161, 0.5), 0 0 20px rgba(241, 120, 161, 0.3);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 20px rgba(241, 120, 161, 0.8), 0 0 30px rgba(241, 120, 161, 0.5);
              transform: scale(1.05);
            }
          }

          .auth-button-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }

          @keyframes deposit-shimmer {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.7), inset 0 0 10px rgba(255, 255, 255, 0.3);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 25px 0 rgba(0, 212, 255, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.5);
              transform: scale(1.08);
            }
          }

          .deposit-button {
            animation: deposit-shimmer 1.8s ease-in-out infinite;
            position: relative;
          }

          @keyframes slide-up-fade {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .auth-button-enter {
            animation: slide-up-fade 0.6s ease-out;
          }

          /* Responsive banner */
          .banner-container {
            height: 10rem;
            width: 100%;
          }

          @media (min-width: 768px) {
            .banner-container {
              height: 16rem;
            }
          }

          @media (min-width: 1024px) {
            .banner-container {
              height: 22rem;
            }
          }

          /* Responsive game grid */
          .responsive-game-grid {
            grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)) !important;
          }

          @media (min-width: 1024px) {
            .responsive-game-grid {
              grid-template-columns: repeat(11, 1fr) !important;
            }
          }

          /* Desktop responsive - category buttons */
          @media (min-width: 1024px) {
            .category-button {
              width: 90px !important;
              min-width: 90px;
              min-height: 110px;
              font-size: 12px;
            }
            .category-button div {
              font-size: 28px;
            }
            .category-button button {
              min-height: 90px;
              font-size: 12px;
            }
          }

          /* Hide bottom nav on desktop */
          @media (min-width: 1024px) {
            .bottom-nav {
              display: none;
            }
          }

          /* Desktop header layout */
          @media (min-width: 1024px) {
            .desktop-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 1rem 2rem;
              gap: 2rem;
            }
            .header-left {
              display: flex;
              align-items: center;
              gap: 1.5rem;
              flex: 0 0 auto;
              min-width: fit-content;
            }
            .header-left button {
              padding: 0.5rem;
              display: flex;
              align-items: center;
            }
            .header-left img {
              height: 48px;
            }
            .header-center {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 3rem;
              flex: 1;
            }
            .header-right {
              display: flex;
              align-items: center;
              gap: 2rem;
              flex: 0 0 auto;
            }
            .header-center a, .header-center button {
              color: white;
              font-weight: bold;
              transition: all 0.3s ease;
              border: none;
              background: none;
              cursor: pointer;
              padding: 0.5rem 1rem;
            }
            .header-center a:hover, .header-center button:hover {
              transform: translateY(-2px);
              text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
            }
            .nav-btn {
              color: white;
              font-weight: 600;
              font-size: 15px;
              transition: all 0.3s ease;
              border: none;
              background: none;
              cursor: pointer;
              padding: 0.75rem 1.25rem;
              white-space: nowrap;
            }
            .nav-btn:hover {
              transform: translateY(-3px);
              text-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
            }
          }

          @media (max-width: 768px) {
            .responsive-game-grid {
              grid-template-columns: repeat(3, 1fr) !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // LOGGED IN VIEW
  return (
    <div className="w-screen min-h-screen pb-24 md:pb-0 relative overflow-x-hidden" style={{ backgroundColor: "#F1C8D6" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 shadow-lg" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
        {/* Mobile Header - Logged In */}
        <div className="md:hidden flex items-center justify-between px-2 py-1 gap-2 h-16">
          {/* Left: Burger Menu (enlarged) */}
          <button onClick={() => setShowMenu(!showMenu)} className="text-white hover:bg-white/20 p-2 rounded-lg transition-all flex-shrink-0 h-14 w-14 flex items-center justify-center">
            <Menu size={32} />
          </button>
            {seoData?.logo && (
                <img 
                src={seoData.logo} 
                alt="Logo"
                className="h-14 w-auto flex-shrink-0" 
                />
              )}

          {/* Username and Balance (center) */}
          <div className="flex flex-col items-center gap-0 flex-1 min-w-0">
            <span className="text-white font-bold text-xs">
              {user?.username ?? "-"}
            </span>
            <span className="text-white font-bold text-xs">{user ? user.idr_balance : "-"}</span>
          </div>

          {/* Deposit Button (with animation) */}
          <button
            onClick={() => setShowP2PModal(true)}
            className="text-white font-bold px-4 py-2 rounded-full text-xs transition-all deposit-button hover:shadow-lg flex-shrink-0"
            style={{ background: "#00D4FF" }}
          >
            {t("deposit")}
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between px-8 py-3 gap-8 desktop-header">
          {/* Left: Burger Menu + Logo */}
          <div className="header-left">
            <button onClick={() => setShowMenu(!showMenu)} className="text-white hover:bg-white/20 p-3 rounded-lg transition-all">
              <Menu size={24} />
            </button>
              {seoData?.logo && (
                <img 
                src={seoData.logo} 
                alt="Logo"
                className="h-24 w-auto flex-shrink-0" 
                />
              )}
          </div>

          {/* Center: Navigation Menu */}
          <div className="header-center">
            <button onClick={() => navigate("/")} className="nav-btn">
              Home
            </button>
            <button onClick={() => navigate('/promo')} className="nav-btn">
              {t("promotion")}
            </button>
            <button onClick={() => setShowContactUsModal(true)} className="nav-btn">
              {t("hub_kami")}
            </button>
            <button onClick={() => setShowWalletModal(true)} className="nav-btn">
              {t("wallet")}
            </button>
          </div>

          {/* Right: Language Dropdown + Deposit + Withdraw Buttons */}
          <div className="header-right">
            {/* Language Dropdown - Moved here to be visible */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="text-white font-bold px-3 py-2 rounded-lg text-sm transition-all hover:bg-white/20 flex items-center gap-1"
              >
                🌐 {t("language")}
              </button>
              {showLanguageDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-2xl z-50 overflow-hidden min-w-max">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition-all text-gray-800 ${
                        language === lang.code ? "bg-pink-100" : ""
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-semibold">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowP2PModal(true)}
              className="text-white font-bold px-8 py-3 rounded-full text-sm transition-all deposit-button hover:shadow-2xl"
              style={{ background: "#00D4FF" }}
            >
              {t("deposit")}
            </button>
            <button
              onClick={() => {
                setShowP2PModal(true);
                setP2pActiveTab("withdraw");
              }}
              className="text-white font-bold px-6 py-3 rounded-full text-sm transition-all hover:shadow-lg"
              style={{ background: "#F178A1" }}
            >
              {t("withdraw")}
            </button>
          </div>
        </div>
      </header>

      {/* Popup Modal */}
        {showPopup && popup && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-sm w-full p-4 relative shadow-xl">
              
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black"
              >
                ✕
              </button>

              <img
                src={popup.image_source}
                alt={popup.popup_title}
                className="rounded-lg mb-3"
              />

              <div
                className="text-sm text-gray-700"
                dangerouslySetInnerHTML={{ __html: popup.description }}
              />
            </div>
          </div>
        )}

      {/* Marquee Announcement */}
      <div className="bg-gray-600 overflow-hidden py-2">
        <div
          className="whitespace-nowrap text-white text-xs font-semibold"
          style={{ animation: "marquee 20s linear infinite" }}
        >
          {getAnnouncements()[currentAnnouncementIndex]}
        </div>
      </div>

      {/* Hero Banner Carousel */}
      <div style={{ padding: "0.25rem" }}>
        {banners.length > 0 && banners[currentBannerIndex] && (
          <div
            className="rounded-lg p-6 text-white text-center shadow-lg relative overflow-hidden banner-container flex items-center justify-center flex-col gap-3 transition-all duration-500"
            style={{
              backgroundImage: `url(${banners[currentBannerIndex]?.image || ""})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
          <div className="flex gap-2 absolute bottom-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentBannerIndex ? "bg-white w-6" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
        )}
      </div>

      {/* Provider Cards Section */}
      {dynamicProviders.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ padding: "0.25rem" }}>
          {dynamicProviders.map((provider) => (
            <button
              key={provider.id}
              onClick={() => {
                const categoryPath = activeCategory === "sabungayam" ? "cockfighting" : activeCategory;
                navigate(`/${categoryPath}/${provider.slug}`);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                selectedProvider === provider.slug
                  ? "bg-gradient-to-r from-pink-400 to-pink-300 text-white"
                  : "bg-gradient-to-t from-[#FFC1DA] to-[#F178A1] shadow-[0_0_10px_rgba(241,120,161,0.5)] hover:bg-gray-100"
              }`}
            >
              <img
                  src={provider.image}
                  alt={provider.name}
                  className="h-8 w-auto object-contain"
                />
            </button>
          ))}
        </div>
      )}

      {/* Search Bar Section */}
      <div className="space-y-3" style={{ padding: "0.25rem" }}>
        {/* Search Bar */}
        {isSearchExpanded ? (
          <div
            className="flex items-center gap-2 bg-white rounded-lg animate-expand-search"
            style={{
              marginTop: "calc(0.25rem * calc(1 - var(--tw-space-y-reverse)))",
              padding: "0.5rem 0.75rem",
            }}
          >
            <Search size={18} className="text-gray-500 flex-shrink-0" />
            <input
              type="text"
              placeholder={t("search_games")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => setIsSearchExpanded(false)}
              autoFocus
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500"
            />
          </div>
        ) : (
          <button
            onClick={() => setIsSearchExpanded(true)}
            className="flex items-center justify-center bg-white rounded-lg hover:bg-gray-100 transition-all"
            style={{
              marginTop: "calc(0.25rem * calc(1 - var(--tw-space-y-reverse)))",
              width: "40px",
              height: "40px",
            }}
          >
            <Search size={18} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="flex gap-3 overflow-x-hidden mb-8" style={{ padding: "0.25rem" }}>
        <div className="flex flex-col gap-2 category-button" style={{ width: "58px" }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(cat.path)}
              className={`py-1 px-1 rounded-lg font-bold transition-all transform hover:animate-bounce category-button ${
                activeCategory === cat.id ? "scale-105 shadow-lg animate-pulse" : ""
              } text-white flex flex-col items-center justify-center overflow-hidden`}
              style={{
                background: "linear-gradient(180deg, #F178A1 0%, #FFC1DA 100%)",
                fontSize: "10px",
                minHeight: "58px"
              }}
            >
              {cat.emoji ? (
                <div style={{ fontSize: "16px", animation: activeCategory === cat.id ? 'spin-icon 2s linear infinite' : 'bounce-icon 2s ease-in-out infinite' }}>{cat.emoji}</div>
              ) : (
                <img
                  src={cat.image}
                  alt={cat.label}
                  style={{
                    width: "32px",
                    height: "32px",
                    objectFit: "contain",
                    animation: activeCategory === cat.id ? 'spin-icon 2s linear infinite' : 'bounce-icon 2s ease-in-out infinite'
                  }}
                />
              )}
              <div style={{ fontSize: "9px", lineHeight: "1.1", marginTop: "2px", textAlign: "center" }}>{cat.label}</div>
            </button>
          ))}
        </div>

        <div className="flex-1">

            {loadingGames && (
              <div className="grid gap-2 responsive-game-grid"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))" }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-300 rounded-lg"
                    style={{
                      aspectRatio: "5/7",
                    }}
                  />
                ))}
              </div>
            )}

            {activeCategory === "gamehit" ? (
              // 🔥 GAME HIT (mostplay)
              <div
                className="grid gap-2 responsive-game-grid"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))" }}
              >
                {searchedGames.slice(0, visibleCount).map((game, idx) => (
                  <div
                    key={game.id}
                    onClick={() => handleLaunchGame(game)}
                    className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:scale-105 group"
                    style={{
                      backgroundImage: `url(${game.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      aspectRatio: "5/5",
                      minWidth: "80px",
                      maxWidth: "110px",
                      animation: `blink-card 2s ease-in-out ${idx * 0.1}s infinite`,
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <button className="bg-cyan-300 text-black font-bold px-3 py-1 rounded-full text-xs">
                        {t("play")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            ) : !selectedProvider ? (

              // 🔥 PROVIDER LIST
              <div
                className="grid gap-2 responsive-game-grid"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))" }}
              >
                {dynamicProviders.map((provider, idx) => (
                  <div
                    key={provider.id}
                    onClick={() =>
                      navigate(`/${activeCategory}/${provider.slug}`)
                    }
                    className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:scale-105 group"
                    style={{
                      backgroundImage: `url(${provider.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      aspectRatio: "7/4",
                      minWidth: "90px",
                      maxWidth: "120px",
                      animation: `blink-card 2s ease-in-out ${idx * 0.1}s infinite`,
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <button className="bg-cyan-300 text-black font-bold px-3 py-1 rounded-full text-xs">
                        {provider.name}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            ) : (

                <>
                  {/* 🔥 FILTER BUTTON */}
                  <div className="flex gap-2 mb-3 flex-wrap">

                    <button
                      onClick={() => setFilterType("all")}
                      className={`px-3 py-1 rounded-full text-xs ${
                        filterType === "all"
                          ? "bg-pink-500 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      Semua Game
                    </button>

                    <button
                      onClick={() => setFilterType("new")}
                      className={`px-3 py-1 rounded-full text-xs ${
                        filterType === "new"
                          ? "bg-pink-500 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      New Game
                    </button>

                    <button
                      onClick={() => setFilterType("hot")}
                      className={`px-3 py-1 rounded-full text-xs ${
                        filterType === "hot"
                          ? "bg-pink-500 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      Hot Game
                    </button>

                  </div>

                  {/* 🔥 GAME GRID */}
                  <div
                    key={`${activeCategory}_${selectedProvider}_${filterType}`}
                    className="grid gap-2 responsive-game-grid"
                    style={{
                      gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                    }}
                  >
                    {searchedGames.slice(0, visibleCount).map((game, idx) => (
                      <div
                        key={game.id}
                        onClick={() => handleLaunchGame(game)}
                        className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:scale-105 group"
                        style={{
                          backgroundImage: `url(${game.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          aspectRatio: "5/5",
                          minWidth: "80px",
                          maxWidth: "110px",
                          animation: `blink-card 2s ease-in-out ${
                            idx * 0.1
                          }s infinite`,
                        }}
                      >
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <button className="bg-cyan-300 text-black font-bold px-3 py-1 rounded-full text-xs">
                            {t("play")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div ref={loadMoreRef} style={{ height: 1 }} />
                </>
              )}
          </div>
      </div>

      {/* Premium Bank Section - Grid Version */}
        {bankStatus.length > 0 && (
          <div className="px-4 mt-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Supported Payment
            </h2>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {bankStatus.map((bank, index) => (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-md rounded-xl p-3 flex items-center justify-center shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <img
                    src={bank.image}
                    alt={bank.name}
                    className="max-h-7 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Provider Game Section - Grid Version */}
        {allProviders.length > 0 && (
          <div className="px-4 mt-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Provider Game
            </h2>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {allProviders
                .sort((a: any, b: any) => (a.sort_by || 0) - (b.sort_by || 0))
                .map((provider, index) => (
                  <div
                    key={provider.id || index}
                    className="bg-white/70 backdrop-blur-md rounded-xl p-3 flex items-center justify-center shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <img
                      src={provider.image}
                      alt={provider.name}
                      className="max-h-8 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.png";
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}

         {/* ===============================
            CUSTOM FOOTER (FROM CMS)
          =============================== */}
          {customFooter && (
             <div className="mt-10 w-full overflow-hidden">
              <div
                dangerouslySetInnerHTML={{ __html: customFooter }}
              />
            </div>
          )}

        {showPendingPopup && currentPopupData && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center
              bg-black/60 backdrop-blur-sm
              transition-opacity duration-300
              ${animatePopup ? "opacity-100" : "opacity-0"}`}
          >
            <div
              className={`w-[90%] max-w-md rounded-2xl p-5
                bg-gradient-to-br from-[#1a1408] to-[#2a1f0d]
                border border-yellow-500 shadow-2xl text-white
                transform transition-all duration-300
                ${animatePopup ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-bold">Detail Transaksi</h2>
                  <p className="text-yellow-400 text-sm">
                    Status Transaksi
                  </p>
                </div>

                <button
                  onClick={closePopup}
                  className="text-yellow-400 text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="bg-black/40 rounded-xl p-4 mb-3 border border-yellow-600">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-bold">
                      {currentPopupData?.transaction_type === "1"
                        ? "Withdraw"
                        : "Deposit"}
                    </p>
                    <p className="text-sm font-bold">
                      {currentPopupData.flag_approve === "0" && "Pending"}
                      {currentPopupData.flag_approve === "1" && "Disetujui"}
                      {currentPopupData.flag_approve === "2" && "Ditolak"}
                    </p>
                  </div>

                  <p className="text-xs">
                    {new Date(currentPopupData.datetime).toLocaleString()}
                  </p>
                </div>

                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-yellow-400">TXID:</span>{" "}
                    {currentPopupData.txid}
                  </p>

                  <p>
                    <span className="text-yellow-400">Jumlah:</span>{" "}
                    <span className="text-green-400 font-bold">
                      IDR {Number(currentPopupData.amount).toLocaleString()}
                    </span>
                  </p>

                  <p>
                    <span className="text-yellow-400">Metode:</span>{" "}
                    {currentPopupData.account_admin?.split("/")[1]?.trim() || "-"}
                  </p>
                </div>
              </div>

              <button
                onClick={closePopup}
                className="w-full mt-4 py-2 rounded-lg bg-yellow-500 text-black font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {seoData?.link_livechat && (
          <a
            href={seoData.link_livechat}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg z-50"
          >
            Live Chat
          </a>
        )}

      {/* Bottom Navigation - Logged In View */}
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 px-2 py-2 flex justify-around items-center z-50 shadow-2xl" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
        {/* Wallet Button (replaces Sign In) */}
        <button
          onClick={() => setShowWalletModal(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg hover:bg-white/20 transition-all group"
        >
          <Wallet size={20} className="text-white group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-white">Wallet</span>
        </button>

        {bottomNav.slice(1).map((item) => {
          const handleClick = () => {
            if (item.id === "hubkami") setShowContactUsModal(true);
            if (item.id === "home") {
              // Home button - already on logged-in home view
              window.scrollTo(0, 0);
            }
            if (item.id === "promotion") navigate('/promo');
          };

          return (
            <button
              key={item.id}
              onClick={handleClick}
              className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg hover:bg-white/20 transition-all group cursor-pointer"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.label}
                  className="w-6 h-6 group-hover:scale-110 transition-transform"
                  style={{ objectFit: "contain" }}
                />
              ) : null}
              <span className="text-xs font-semibold text-white">{item.label}</span>
            </button>
          );
        })}
        {/* Language Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg hover:bg-white/20 transition-all group"
          >
            <Globe size={24} className="text-white group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-white">{t("language")}</span>
          </button>
          {/* Language Dropdown Menu */}
          {showLanguageDropdown && (
            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-2xl z-50 overflow-hidden min-w-max">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLanguageDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition-all ${
                    language === lang.code ? "bg-pink-100" : ""
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-semibold text-gray-800">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Side Menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-50 animate-fade-in">
          <div className="w-80 h-screen overflow-y-auto flex flex-col animate-slide-right" style={{ background: "linear-gradient(180deg, #F178A1 0%, #FFC1DA 100%)" }}>
            {/* Menu Header */}
            <div className="px-6 py-4 flex items-center justify-between">
              <button onClick={() => setShowMenu(false)} className="hover:bg-white/20 p-2 rounded">
                <X size={24} />
              </button>
            </div>

            {/* User Info */}
            <div className="px-6 py-4 bg-white rounded-2xl mx-4 mb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-white-400 flex items-center justify-center text-2xl">
                <img 
                src={user?.tierImage ?? "-"} 
                alt="Logo"
                className="h-10 w-auto flex-shrink-0" 
                />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-bold text-pink-500 text-sm"> {user?.username ?? "-"}</p>
                  <p className="text-pink-500">{user?.tierName ?? "-"}</p>
                  <p className="text-pink-500">{user?.idr_balance ?? "0.00"}</p>
                </div>
              </div>
            </div>

            {/* Main Menu */}
            <div className="px-4 mb-4">
              <h3 className="font-bold text-sm mb-3 text-white drop-shadow">Main Menu</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: "💰", label: "Deposit - Withdraw", action: "banking" },
                  { icon: "👤", label: "Profile", action: "profiles" },
                  { icon: "📜", label: "History", action: "history" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setShowMenu(false);
                      setTimeout(() => {
                        if (item.action === "profiles") navigate("/profiles");
                        if (item.action === "banking") navigate("/banking");
                        if (item.action === "history") navigate("/history");
                      }, 150);
                    }}
                    className="bg-white rounded-lg p-2 text-center hover:shadow-lg transition-all flex flex-col items-center gap-1"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs font-bold text-gray-700 line-clamp-2">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Promotion */}
            <div className="px-4 mb-4">
              <button
                onClick={() => navigate("/promo")} 
                className="w-full bg-white rounded-lg p-3 text-center hover:shadow-lg transition-all flex items-center justify-center gap-2 font-bold text-gray-700"
                >
                <span className="text-2xl">📢</span>
                <span>Promotion</span>
              </button>
            </div>

            {/* Income Menu */}
            <div className="px-4 mb-4">
              <h3 className="font-bold text-sm mb-3 text-white drop-shadow">Income Menu</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: "💳", label: "Cashback" },
                  { icon: "💵", label: "Earn Money" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    className="bg-white rounded-lg p-2 text-center hover:shadow-lg transition-all flex flex-col items-center gap-1"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs font-bold text-gray-700 line-clamp-2">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Event Menu */}
            <div className="px-4 mb-4">
              <h3 className="font-bold text-sm mb-3 text-white drop-shadow">Event Menu</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: "🎁", label: "Credit/Point Free" },
                  { icon: "🎟️", label: "Coupon" },
                  { icon: "🎰", label: "Randombox" },
                  { icon: "🎡", label: "Wheel" },
                  { icon: "✅", label: "Check In" },
                  { icon: "🏆", label: "Ranking" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    className="bg-white rounded-lg p-2 text-center hover:shadow-lg transition-all flex flex-col items-center gap-1"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs font-bold text-gray-700 line-clamp-2">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* More Menu */}
            <div className="px-4 mb-4">
              <h3 className="font-bold text-sm mb-3 text-white drop-shadow">More Menu</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: "💬", label: "Contact us" },
                  { icon: "🇹🇭", label: "Switch language" },
                  { icon: "📖", label: "Manual" },
                  { icon: "📱", label: "Download Guild" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    className="bg-white rounded-lg p-2 text-center hover:shadow-lg transition-all flex flex-col items-center gap-1"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs font-bold text-gray-700 line-clamp-2">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Logout Button */}
            <div className="px-4 mt-auto mb-4">
              <button
                onClick={handleLogout}
                className="w-full bg-white rounded-lg p-3 text-center hover:shadow-lg transition-all flex items-center justify-center gap-2 font-bold text-red-500"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up my-8" style={{ backgroundColor: "#F178A1" }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
              <h2 className="text-white font-bold text-lg">{t("wallet")}</h2>
              <button onClick={() => setShowWalletModal(false)} className="text-white hover:bg-white/20 p-1 rounded">
                <X size={24} />
              </button>
            </div>

            {/* Wallet Content */}
            <div className="px-6 py-6 space-y-4">
              {/* Credit Balance Card */}
              <div className="bg-white rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-300 flex items-center justify-center text-2xl">
                  💰
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-700">Credit Balance</p>
                  <p className="text-1xl font-bold text-pink-500">{user?.idr_balance ?? "0.00"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Promotion</p>
                  <p className="text-sm font-bold text-gray-700">Turnover<br/>0.00/0.00</p>
                </div>
              </div>

              {/* Wallet Buttons Grid */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: "🎁", label: "Credit Free" },
                  { icon: "📢", label: "Promotion" },
                  { icon: "🎯", label: "Point Free" },
                  { icon: "🎟️", label: "Coupon" },
                  { icon: "🎰", label: "Random Box" },
                  { icon: "🎡", label: "Wheel" },
                  { icon: "🏆", label: "Ranking" },
                  { icon: "💰", label: "Earn Money" },
                  { icon: "💳", label: "Cashback" },
                  { icon: "✅", label: "Check-in" },
                  { icon: "🎪", label: "Tournament" },
                  { icon: "🔄", label: "Exchange" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    className="bg-white rounded-lg p-3 text-center hover:shadow-lg transition-all flex flex-col items-center gap-1"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs font-bold text-gray-700 line-clamp-2">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* P2P Modal */}
      {showP2PModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up my-8" style={{ backgroundColor: "#F178A1" }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
              <h2 className="text-white font-bold text-lg">{t("deposit_withdraw")}</h2>
              <button onClick={() => setShowP2PModal(false)} className="text-white hover:bg-white/20 p-1 rounded">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-4">
              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setP2pActiveTab("deposit")}
                  className={`flex-1 py-2 rounded-full font-bold transition-all ${
                    p2pActiveTab === "deposit"
                      ? "text-white"
                      : "text-gray-600 bg-gray-200 hover:bg-gray-300"
                  }`}
                  style={p2pActiveTab === "deposit" ? { background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" } : {}}
                >
                  Deposit
                </button>
                <button
                  onClick={() => setP2pActiveTab("withdraw")}
                  className={`flex-1 py-2 rounded-full font-bold transition-all ${
                    p2pActiveTab === "withdraw"
                      ? "text-white"
                      : "text-gray-600 bg-gray-200 hover:bg-gray-300"
                  }`}
                  style={p2pActiveTab === "withdraw" ? { background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" } : {}}
                >
                  Withdraw
                </button>
              </div>

              {/* Deposit Tab Content */}
              {p2pActiveTab === "deposit" && (
                <>
                  {/* Deposit Options */}
                  <div className="space-y-3">
                    {[
                      { icon: "🔲", name: "Qris" },
                      { icon: "🏦", name: "Bank Transfer" },
                      { icon: "💰", name: "E-Wallet" },
                      { icon: "📱", name: "Pulsa" },
                    ].map((option, idx) => (
                      <button
                        key={idx}
                        className="w-full bg-white rounded-lg p-3 text-left hover:shadow-lg transition-all flex items-center gap-3"
                        onClick={() => navigate("/banking")}
                      >
                        <span className="text-2xl">{option.icon}</span>
                        <span className="font-bold text-gray-700">{option.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Line Bot Notification */}
                  <button className="w-full bg-green-500 hover:bg-green-600 rounded-full py-3 text-white font-bold flex items-center justify-center gap-2 transition-all">
                    <span>💬</span>
                    Line bot notification
                  </button>
                </>
              )}

              {/* Withdraw Tab Content */}
              {p2pActiveTab === "withdraw" && (
                <>
                  {/* Akun Bank User */}
                  <div>
                    <label className="text-sm text-white mb-2 block font-bold">Akun Bank User</label>
                    <select className="w-full bg-white rounded-lg p-3 font-bold text-gray-700 focus:outline-none border-2 border-white">
                      <option>Pilih Akun Bank</option>
                      <option>BCA - 1234567890</option>
                      <option>Mandiri - 0987654321</option>
                      <option>BRI - 5555666666</option>
                    </select>
                  </div>

                  {/* Input Nominal Penarikan */}
                  <div>
                    <label className="text-sm text-white mb-2 block font-bold">Input Nominal Penarikan</label>
                    <input
                      type="number"
                      placeholder="Masukkan jumlah penarikan"
                      className="w-full bg-white rounded-lg p-3 font-bold text-gray-700 focus:outline-none border-2 border-white"
                    />
                  </div>

                  {/* Withdraw Button */}
                  <button className="w-full bg-green-500 hover:bg-green-600 rounded-lg p-3 text-white font-bold transition-all">
                    Konfirmasi Penarikan
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up my-8" style={{ backgroundColor: "#F178A1" }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
              <div className="flex items-center gap-2 text-white">
                <button onClick={() => setShowWithdrawModal(false)} className="hover:bg-white/20 p-1 rounded">
                  <span className="text-xl">←</span>
                </button>
                <h2 className="font-bold text-lg">Withdraw</h2>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} className="text-white hover:bg-white/20 p-1 rounded">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-4">
              {/* Akun Bank User */}
              <div>
                <label className="text-sm text-white mb-2 block font-bold">Akun Bank User</label>
                <select className="w-full bg-white rounded-lg p-3 font-bold text-gray-700 focus:outline-none border-2 border-white">
                  <option>Pilih Akun Bank</option>
                  <option>BCA - 1234567890</option>
                  <option>Mandiri - 0987654321</option>
                  <option>BRI - 5555666666</option>
                </select>
              </div>

              {/* Input Nominal Penarikan */}
              <div>
                <label className="text-sm text-white mb-2 block font-bold">Input Nominal Penarikan</label>
                <input
                  type="number"
                  placeholder="Masukkan jumlah penarikan"
                  className="w-full bg-white rounded-lg p-3 font-bold text-gray-700 focus:outline-none border-2 border-white"
                />
              </div>

              {/* Withdraw Button */}
              <button className="w-full bg-green-500 hover:bg-green-600 rounded-lg p-3 text-white font-bold transition-all">
                Konfirmasi Penarikan
              </button>

              {/* Footer Link */}
              <p className="text-white text-xs text-center opacity-70">
                Ada pertanyaan? {" "}
                <a href="#" className="underline font-bold">
                  Hubungi kami
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Us Modal */}
      {showContactUsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up my-8" style={{ backgroundColor: "#F178A1" }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
              <h2 className="text-white font-bold text-lg">{t("hub_kami")}</h2>
              <button onClick={() => setShowContactUsModal(false)} className="text-white hover:bg-white/20 p-1 rounded">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-4">
              <div className="text-center text-white">
                <p className="text-lg font-bold mb-4">Contact Us</p>
                <div className="space-y-3">
                  {seoData?.link_livechat && (
                      <div
                        onClick={() => window.open(seoData.link_livechat, "_blank")}
                        className="bg-white rounded-xl p-4 text-center cursor-pointer hover:bg-gray-300 transition text-pink-700"
                      >
                        <div className="font-semibold">Live Chat Support</div>
                        <div className="text-sm opacity-70">Available 24/7</div>
                      </div>
                    )}
                  <div className="bg-white rounded-lg p-4 text-gray-700">
                    <p className="font-bold">Email</p>
                    <p className="text-sm text-gray-600 mt-1">support@mastoto.com</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-gray-700">
                    <p className="font-bold">Telegram</p>
                    <p className="text-sm text-gray-600 mt-1">@mastoto_support</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-gray-700">
                    <p className="font-bold">Whatsapp</p>
                    <p className="text-sm text-gray-600 mt-1">+62 812 3456 7890</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {customFooter && (
        <div
          className="mt-6"
          dangerouslySetInnerHTML={{ __html: customFooter }}
        />
      )}

      {/* Falling Angpao & Sakura Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-30">
        {angpaos.map((angpao) => (
          <div
            key={angpao.id}
            className="absolute animate-fall-angpao"
            style={{
              left: `${angpao.left}%`,
              width: "40px",
              height: "40px",
              animation: `fall-angpao ${angpao.duration}s linear ${angpao.delay}s infinite`,
              top: "-50px",
            }}
          >
            <div className="text-4xl drop-shadow-lg">
              {angpao.type === 'angpao' ? '🧧' : '🌸'}
            </div>
          </div>
        ))}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-right {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }

        .animate-slide-right {
          animation: slide-right 0.4s ease-out;
        }

        @keyframes expand-search {
          from {
            opacity: 0;
            width: 40px;
            transform: scaleX(0);
            transform-origin: left;
          }
          to {
            opacity: 1;
            width: 100%;
            transform: scaleX(1);
            transform-origin: left;
          }
        }

        .animate-expand-search {
          animation: expand-search 0.3s ease-out;
        }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes fall-angpao {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateY(50vh) rotate(10deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(-10deg);
            opacity: 0;
          }
        }

        @keyframes sway {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(30px) rotate(5deg); }
          75% { transform: translateX(-30px) rotate(-5deg); }
        }

        @keyframes blink-card {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(247, 82, 112, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 10px 2px rgba(247, 82, 112, 0.6), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transform: scale(1.02);
          }
        }

        /* Hide scrollbar on mobile */
        @media (max-width: 768px) {
          ::-webkit-scrollbar {
            display: none;
          }
          body {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }

        @keyframes spin-icon {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }

        @keyframes bounce-icon {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.05); }
        }

        /* Responsive banner */
        .banner-container {
          height: 10rem;
          width: 100%;
        }

        @media (min-width: 768px) {
          .banner-container {
            height: 16rem;
          }
        }

        @media (min-width: 1024px) {
          .banner-container {
            height: 22rem;
          }
        }

        /* Responsive game grid */
        .responsive-game-grid {
          grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)) !important;
        }

        @media (min-width: 1024px) {
          .responsive-game-grid {
            grid-template-columns: repeat(11, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .responsive-game-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }

        /* Desktop Header Styles for Logged-in View */
        @media (min-width: 768px) {
          .desktop-header {
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem 1rem;
            gap: 1.5rem;
            flex-wrap: nowrap;
          }
          .header-left {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex: 0 0 auto;
            min-width: fit-content;
          }
          .header-left button {
            padding: 0.25rem;
            display: flex;
            align-items: center;
            flex-shrink: 0;
          }
          .header-left img {
            height: 40px;
            width: auto;
            flex-shrink: 0;
          }
          .header-center {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            flex: 1;
            min-width: 0;
            flex-wrap: nowrap;
            overflow-x: hidden;
          }
          .header-right {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex: 0 0 auto;
            flex-wrap: nowrap;
            position: relative;
            overflow: visible !important;
          }
          .nav-btn {
            color: white;
            font-weight: 600;
            font-size: 13px;
            transition: all 0.3s ease;
            border: none;
            background: none;
            cursor: pointer;
            padding: 0.4rem 0.6rem;
            white-space: nowrap;
            flex-shrink: 0;
          }
          .nav-btn:hover {
            transform: translateY(-2px);
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
          }
        }

        @media (min-width: 1024px) {
          .desktop-header {
            padding: 1rem 2rem;
            gap: 3rem;
          }
          .header-left {
            gap: 1.5rem;
          }
          .header-left button {
            padding: 0.5rem;
          }
          .header-left img {
            height: 48px;
          }
          .header-center {
            gap: 3rem;
          }
          .header-right {
            gap: 2rem;
          }
          .nav-btn {
            font-size: 15px;
            padding: 0.7rem 1.2rem;
          }
        }

        /* Hide bottom navbar on tablet and desktop */
        @media (min-width: 768px) {
          .bottom-nav {
            display: none !important;
          }
        }

        /* Expand category buttons on tablet and desktop */
        @media (min-width: 768px) {
          .category-button {
            width: 90px !important;
            min-width: 90px;
            min-height: 110px;
            font-size: 11px;
          }
          .category-button button {
            min-height: 85px;
            font-size: 11px;
          }
          .category-button div {
            font-size: 24px;
          }
        }

        @media (min-width: 1024px) {
          .category-button {
            width: 110px !important;
            min-width: 110px;
            min-height: 130px;
            font-size: 12px;
          }
          .category-button button {
            min-height: 100px;
            font-size: 12px;
          }
          .category-button div {
            font-size: 32px;
          }
        }

        /* Deposit button animation */
        @keyframes deposit-shimmer {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.7), inset 0 0 10px rgba(255, 255, 255, 0.3);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 25px 0 rgba(0, 212, 255, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.5);
            transform: scale(1.08);
          }
        }

        .deposit-button {
          animation: deposit-shimmer 1.8s ease-in-out infinite !important;
          position: relative;
        }
      `}</style>
    </div>
  );
}
