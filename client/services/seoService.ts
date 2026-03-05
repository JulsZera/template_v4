import { apiRequest } from "@/services/api";

const BRANCH_ID = import.meta.env.VITE_BRANCH_ID;

export const fetchSeoPageAPI = async (pageUrl: string) => {
  const domainName = window.location.hostname;

  const res = await apiRequest("/seo-page", "POST", {
    branch_id: BRANCH_ID,
    page_url: pageUrl,
    domain_name: domainName,
  });

//   console.log("PAGE : ",pageUrl)

//   console.log("RESPONSE SEO API: ",res?.data?.data_seo)

  if (res?.data?.rcode === "00") {
    return res.data?.data_seo?.[0] ?? null;
  }

  return null;
};