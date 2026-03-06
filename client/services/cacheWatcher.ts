import { apiRequest, fetchPageData } from "@/services/api";

let versions = {
  pagedata: 0,
  provider: 0,
  gamelist: 0
};

export function startCacheWatcher() {

  setInterval(async () => {

    try {

      const json = await apiRequest("/cache/version", "POST");

      if (json.pagedata !== versions.pagedata) {

        versions.pagedata = json.pagedata;
        await fetchPageData(true);

      }

      if (json.provider !== versions.provider) {

        versions.provider = json.provider;
        console.log("Provider cache updated");

      }

      if (json.gamelist !== versions.gamelist) {

        versions.gamelist = json.gamelist;
        console.log("Game list cache updated");

      }

    } catch (err) {

      console.error("Cache watcher error:", err);

    }

  }, 5000);

}