import { apiRequest, normalizeCategoryAPI } from "@/services/api";
const BRANCH_ID = import.meta.env.VITE_BRANCH_ID;

export interface ProviderData {
  id: string;
  name: string;
  display: string;
  slug: string;
  image: string;
  flag: string;
  active: string;
  apiGameUrl?: string | null;
}

const providerSlugToId: Record<string, string> = {};

function slugifyProviderName(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export async function fetchProviders(
  categorySlug: string
): Promise<ProviderData[]> {

  const result = await apiRequest("/provider", "POST", {
    branch_id: BRANCH_ID,
    category: normalizeCategoryAPI(categorySlug),
  });

  if (!result || result.rcode !== "00") {
    console.error("Failed load providers", result);
    return [];
  }

  const providersRaw = result.data_provider || [];

    return providersRaw.map((provider: any) => {

        const slug = slugifyProviderName(provider.provider_name);

        providerSlugToId[slug] = provider.id_mapping_provider;

        let finalImage = provider.image_url;

        if (provider.active === "0") {
            finalImage = provider.image_comingsoon;
        }

        if (provider.active === "2") {
            finalImage = provider.image_maintenance;
        }

        const hasDirectLaunch = !!provider.api_game_url;

        return {
            id: provider.id_mapping_provider,
            name: provider.provider_name,
            display: provider.provider_display,
            slug,
            image: finalImage,
            flag: "🎮",
            active: provider.active,
            apiGameUrl: provider.api_game_url || null,
            hasDirectLaunch
        };
    });
}

