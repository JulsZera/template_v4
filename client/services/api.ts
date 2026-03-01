// This file handles providers and games using real pagedata API with caching
const API_URL = import.meta.env.VITE_API_URL;
const BRANCH_ID = import.meta.env.VITE_BRANCH_ID;
// ========================================
// CATEGORY MAP (frontend → backend)
// ========================================

const CATEGORY_MAP: Record<string, string> = {

  gamehit: "mostplay",

  slot: "slots",

  casino: "casino",

  sportsbook: "sportsbook",

  p2p: "p2p",

  fishing: "fishing",

  arcade: "arcade",

  sabungayam: "cockfighting",

  togel: "togel",

};

/* =========================================================
   TYPES
========================================================= */


export interface ProviderCard {
  id: number;
  name: string;
  provider: string;
  image: string;
  category: string;
  isProvider: true;
}

export interface Game {
  id: string;
  name: string;
  provider: string;
  image: string;
  category: string;

  game_id: string;
  game_code: string;
  id_mapping_provider: string;
  url?: string;

  isProvider?: false;
}

export type GameItem = Game | ProviderCard;

export interface ProviderData {
  id: string;
  name: string;
  slug: string;
  image?: string;
  flag?: string;
}

export interface CategoryProviders {
  category: string;
  providers: ProviderData[];
}

// ========================================
// GLOBAL CACHE STATE
// ========================================

let realProviders: Record<string, ProviderData[]> = {};

let realGames: Game[] = [];

let realMostPlay: Game[] = [];

let pagedataLoaded = false;

let pagedataLoadingPromise: Promise<void> | null = null;

// ========================================
// GLOBAL PAGEDATA STATE
// ========================================
export let realCategories: any[] = [];

export let realBanners: any[] = [];

export let realBankStatus: any[] = [];

export let realSEO: any = null;

export let realPopup: any = null;

// ========================================
// GET BALANCE
// ========================================
 
// export async function getBalance() {
//   return await apiRequest("/balance", "POST");
// }

export async function getBalance() {
  const jwt = localStorage.getItem("jwt");
  if (!jwt) return null;   // 🔥 STOP DI SINI

  return await apiRequest("/balance", "POST");
}

// ========================================
// GAME LIST CACHE (ULTRA FAST)
// ========================================

const gameListCache: Record<string, Game[]> = {};

// ========================================
// PROVIDER SLUG ↔ PROVIDER ID MAP
// ========================================

const providerSlugToId: Record<string, string> = {};
// const providerSlugToName: Record<string, string> = {};
const providerSlugToName: Record<string, string> = {
  pgsoft: "pgsoft",
  habanero: "habanero",
  pragmatic: "pragmaticplay",
};

// ========================================
// API BASE
// ========================================

export function uploadWithProgress(
  endpoint: string,
  formData: FormData,
  onProgress: (percent: number) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    const jwt = localStorage.getItem("jwt");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", API_URL + endpoint);

    if (jwt) {
      xhr.setRequestHeader("Authorization", "Bearer " + jwt);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round(
          (event.loaded / event.total) * 100
        );
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      resolve(JSON.parse(xhr.responseText));
    };

    xhr.onerror = reject;

    xhr.send(formData);
  });
}


// ========================================
// GENERIC API REQUEST
// ========================================

export async function apiRequest(
  endpoint: string,
  method: string = "POST",
  data: any = null
) {
  try {
    const jwt =
      typeof window !== "undefined"
        ? localStorage.getItem("jwt")
        : null;

    const headers: Record<string, string> = {};

    // 🔥 Jangan set Content-Type kalau FormData
    const isFormData = data instanceof FormData;

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (jwt) {
      headers["Authorization"] = "Bearer " + jwt;
    }

    const response = await fetch(API_URL + endpoint, {
      method,
      headers,
      body: data
        ? isFormData
          ? data
          : JSON.stringify(data)
        : null,
    });

    // 🔥 HANDLE UNAUTHORIZED
    if (response.status === 401) {
      const existingJwt = localStorage.getItem("jwt");

      if (existingJwt) {
        localStorage.removeItem("jwt");
        localStorage.removeItem("userData");
        window.location.reload();
      }

      return {
        status: false,
        message: "Unauthorized",
      };
    }

    // 🔥 selain 401, tetap baca body response
    const json = await response.json();

    // kalau status HTTP bukan 2xx,
    // tetap return body dari backend
    if (!response.ok) {
      return json;
    }

    return json;

  } catch (error) {
    return {
      status: false,
      message: "Network error",
    };
  }
}

export async function getProfile() {
  return await apiRequest("/profile", "POST");
}

 function slugifyProviderName(name: string): string {

      if (!name) return "";

      return name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "")
        .replace(/\-+/g, "-");

    }

// ========================================
// LOAD PAGEDATA WITH GLOBAL CACHE
// ========================================

export async function fetchPageData(): Promise<void> {

  if (pagedataLoaded) return;

  if (pagedataLoadingPromise) {
    return pagedataLoadingPromise;
  }

  pagedataLoadingPromise = (async () => {

    console.log("Loading pagedata from API...");

    const result = await apiRequest("/pagedata", "POST", {
      branch_id: BRANCH_ID,
    });

    console.log("FULL PAGEDATA RESPONSE:", result);

    // FIX: gunakan rcode, bukan status
    if (!result || result.rcode !== "00") {

      console.error("Failed load pagedata");

      return;

    }

    // FIX: data sekarang langsung di root, bukan result.data
    const data = result;

    // ========================================
    // MOSTPLAY
    // ========================================

    const mostPlayRaw = data.data_mostplay || [];

    realMostPlay = mostPlayRaw.map(
      (game: any, index: number) => ({

        id: index + 1,
        name: game.game_code || "Unknown",
        provider: (game.id_mapping_provider || "").toLowerCase(),
        image: game.image_src || "",
        category: "mostplay",
        game_id: game.game_id,
        game_code: game.game_code,
        id_mapping_provider: game.id_mapping_provider,
        url: game.url,
        isProvider: false,

      })
    );

    // ========================================
    // CATEGORIES
    // ========================================

    realCategories = data.data_category || [];

    console.log("Categories raw:", realCategories);

    // ========================================
    // BANNERS
    // ========================================

    realBanners = data.data_banner || [];

    console.log("Banners:", realBanners);

    // ========================================
    // BANK STATUS
    // ========================================

    realBankStatus = data.data_bankstatus || [];

    console.log("Bank status:", realBankStatus);

    // ========================================
    // SEO
    // ========================================

    realSEO = data.data_seo?.[0] || null;

    console.log("SEO:", realSEO);

    // ========================================
    // POPUP
    // ========================================

    realPopup = data.data_popup?.[0] || null;

    console.log("Popup:", realPopup);

    // ========================================
    // PROVIDERS
    // ========================================

    const providersRaw = data.data_provider || [];
    realProviders = {};

    providersRaw.forEach((provider: any) => {
      const providerId = provider.id_mapping_provider;
      if (!providerId) return;
      const category =
        (provider.category || "slots").toLowerCase();
      if (!realProviders[category]) {
        realProviders[category] = [];
      }

      const slug = slugifyProviderName(provider.provider_name);

      providerSlugToId[slug] = providerId;

      realProviders[category].push({
        id: providerId,
        name: provider.provider_name || providerId,
        slug: slug,
        image:
          provider.image_url ||
          provider.image ||
          provider.logo ||
          "",
        flag: "🎮",
      });
    });

    console.log("Providers built:", realProviders);

    // ========================================
    // GAMES
    // ========================================

    const gamesRaw = data.data_mostplay || [];

    realGames = gamesRaw.map(
      (game: any, index: number) => ({
        id: index + 1,
        name: game.game_code || "Unknown Game",
        provider: (game.id_mapping_provider || "").toLowerCase(),
        image: game.image_src || "",
        category:(game.category || "slots").toLowerCase(),
        game_id: game.game_id,
        game_code: game.game_code,
        id_mapping_provider: game.id_mapping_provider,
        url: game.url,
        isProvider: false,

      })
    );

    console.log("Games built:", realGames);
    pagedataLoaded = true;
    console.log("Pagedata loaded successfully");
  })();

  return pagedataLoadingPromise;
}



// ========================================
// FETCH PROVIDERS BY CATEGORY
// ========================================

export async function fetchProvidersByCategory(
  category: string
): Promise<ProviderData[]> {

  await fetchPageData();
  const mapped = CATEGORY_MAP[category.toLowerCase()];
  if (!mapped) return [];
  return realProviders[mapped] || [];

}


// ========================================
// FETCH GAMES BY CATEGORY AND PROVIDER
// ========================================

export async function fetchGamesByCategoryAndProvider(
  category: string,
  provider?: string
): Promise<Game[]> {

  await fetchPageData();
  const mapped = CATEGORY_MAP[category.toLowerCase()];
  if (!mapped) return [];

  // ============================
  // GAME HIT → tampil game
  // ============================

  if (mapped === "mostplay") {
    return realMostPlay;
  }

  // ============================
  // JIKA PROVIDER BELUM DIPILIH
  // tampil provider sebagai game card
  // ============================

  // if (!provider) {

  //   const providers = realProviders[mapped] || [];

  //   return providers.map((p, index) => ({

  //     id: index + 1,
  //     name: p.name,
  //     provider: p.slug,
  //     image: p.image,
  //     category: mapped,

  //   }));

  // }

  // ============================
  // JIKA PROVIDER DIPILIH
  // tampil game provider tersebut
  // ============================

  return realGames.filter(
    g =>
      g.category === mapped &&
      g.provider === provider.toLowerCase()
  );

}


// ========================================
// FETCH ALL PROVIDERS
// ========================================

export async function fetchAllProviders(): Promise<ProviderData[]> {

  await fetchPageData();

  return Object.values(realProviders).flat();

}


// ========================================
// GET PROVIDER BY SLUG
// ========================================

export function getProviderBySlug(
  slug: string
): ProviderData | undefined {

  for (const providers of Object.values(realProviders)) {

    const provider =
      providers.find(
        (p) => p.slug === slug
      );

    if (provider) return provider;

  }

  return undefined;

}

export function normalizeCategorySlug(category: string): string {

  const map: Record<string, string> = {

    slots: "slot",
    casino: "casino",
    sportsbook: "sportsbook",
    p2p: "p2p",
    fish: "fishing",
    arcade: "arcade",
    cockfighting: "cockfighting",
    togel: "togel",

  };

  return map[category.toLowerCase()] || category.toLowerCase();

}

export function normalizeCategoryAPI(slug: string): string {

  const map: Record<string, string> = {

    slot: "slots",
    casino: "casino",
    sportsbook: "sportsbook",
    p2p: "p2p",
    fishing: "fish",
    arcade: "arcade",
    cockfighting: "cockfighting",
    togel: "togel",

  };

  return map[slug] || slug;

}

export function getCategories() {

  const mapped = realCategories.map((cat: any) => {

    const slug = normalizeCategorySlug(cat.category);

    return {

      id: slug,

      label: cat.display_category,

      image: cat.image_url,

      path: slug === "gamehit" ? "/" : `/${slug}`,

      apiURL: cat.url_provider_category,

      raw: cat.category,

    };

  });

  // urutan custom
  const order = [
    "gamehit",
    "slots",
    "casino",
    "sportsbook",
    "p2p",
    "fishing",
    "arcade",
    "cockfighting",
    "togel",
  ];

  const sorted = mapped.sort(
    (a, b) =>
      order.indexOf(a.id) - order.indexOf(b.id)
  );

  return [
    {
      id: "gamehit",
      label: "Game Hit",
      emoji: "🔥",
      path: "/",
    },
    ...sorted,
  ];
}

export async function fetchGameList(
  categorySlug: string,
  providerSlug: string,
  filter: string = "all"
): Promise<Game[]> {

  if (!providerSlug || providerSlug === "") {
    return [];
  }

  const providerId = providerSlugToId[providerSlug];
  const providerName = providerSlug;

  if (!providerId) {
    console.error("Provider ID not found:", providerSlug);
    return [];
  }

  const cacheKey = `${categorySlug}_${providerId}_${filter}`;

  // ✅ HANYA pakai cache kalau ada isi
  if (
    gameListCache[cacheKey] &&
    gameListCache[cacheKey].length > 0
  ) {
    console.log("Game list from cache:", cacheKey);
    return gameListCache[cacheKey];
  }

  console.log("Fetching game list:", cacheKey);

  const result = await apiRequest(
    "/getdata_listgame",
    "POST",
    {
      branch_id: BRANCH_ID,
      category: normalizeCategoryAPI(categorySlug),
      filter: filter,
      id_mapping_provider: providerId,
      provider_name: providerName,
    }
  );

  if (!result || result.rcode !== "00") {
    console.error("Failed load game list", result);
    return [];
  }

  const gamesRaw = Array.isArray(result.data)
    ? result.data
    : [];

  console.log("GamesRaw length:", gamesRaw.length);

  const games = gamesRaw.map((game: any) => ({
  id: `${providerSlug}_${game.id}`,
  name: game.name,
  provider: game.provider,
  image: game.image,
  category: game.category,

  game_id: game.game_id,
  game_code: game.game_code,
  id_mapping_provider: game.id_mapping_provider,
  url: game.url,
}));
  
  console.log("Game raw sample:", gamesRaw[0]);

  // ✅ hanya cache kalau ada data
  gameListCache[cacheKey] = games;

  return games;
}

// ========================================
// GETTERS
// ========================================

export function getBanners() {
  return realBanners;
}

export function getBankStatus() {
  return realBankStatus;
}

export function getSEO() {
  return realSEO;
}

export function getPopup() {
  return realPopup;
}

export function getMostPlay(): Game[] {
  return realMostPlay;
}

// ========================================
// LAUNCH GAME PGSOFT
// ========================================

export async function launchGame(data: {
  game_id: string;
  game_code: string;
  id_mapping_provider: string;
  provider_name: string;
  category: string;
  type_game: string;
}) {
  return await apiRequest("/launchgame", "POST", data);
}