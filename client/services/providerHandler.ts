import { fetchGameList } from "@/services/api";
import { directLaunchGame } from "@/services/directLaunch";

export async function handleProvider(
  provider: any,
  category: string,
  setGames: (games: any[]) => void
) {

  // 🔥 PROVIDER DIRECT LAUNCH
  if (provider.hasDirectLaunch) {

    const result = await directLaunchGame(provider.apiGameUrl);

    if (result?.data?.url) {
      window.open(result.data.url, "_blank");
    }

    return;
  }

  // 🔥 PROVIDER WITH GAMELIST
  const games = await fetchGameList(
    category,
    provider.slug,
    provider.id
  );

  setGames(games);
}