import { apiRequest } from "@/services/api";
import toast from "react-hot-toast";

export async function launchGame(data: {
  game_id: string;
  game_code: string;
  id_mapping_provider: string;
  provider_name: string;
  category: string;
  type_game: string;
}) {

  const result = await apiRequest("/launchgame", "POST", data);

  if (!result || result?.data?.rcode !== "00") {
    toast.error(result?.data?.message)
    console.error("Launch game failed", result);
    return null;
  }

  return result;
}

export async function launchProvider(data: {
  apigame_url: string;
  game_id: string;
  game_code: string;
  id_mapping_provider: string;
  provider_name: string;
  category: string;
  type_game: string;
}) {

  const result = await apiRequest("/launchprovider", "POST", data);

  console.log("RESULT PROV:", result)

    if (result?.data?.rcode !== "00") {
      toast.error(result?.data?.message)
      console.error("Launch game failed", result);
    return null;
  }

  return result;

}