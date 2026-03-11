export function applyRouteSEO(
  pathname: string,
  seo: any
) {

  if (!seo) return;

  const segments = pathname.split("/").filter(Boolean);

  const category = segments[0];
  const provider = segments[1];

  let title = seo.meta_title;
  let description = seo.meta_description;

  if (category) {

    title = `${category.toUpperCase()} - ${seo.website_name}`;

    description =
      `Mainkan permainan ${category} terbaik di ${seo.website_name}. ` +
      (seo.meta_description || "");

  }

  if (provider) {

    title =
      `${provider.toUpperCase()} ${category?.toUpperCase()} - ${seo.website_name}`;

    description =
      `Mainkan ${provider} ${category} terbaik di ${seo.website_name}. ` +
      (seo.meta_description || "");

  }

  document.title = title;

  let metaDesc = document.querySelector("meta[name='description']");

  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.setAttribute("name", "description");
    document.head.appendChild(metaDesc);
  }

  metaDesc.setAttribute("content", description);

}