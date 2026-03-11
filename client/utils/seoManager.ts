export function applySEO(seo: any) {

  if (!seo) return;

  /* ================= TITLE ================= */

  document.title = seo.page_title;

  /* ================= META DESCRIPTION ================= */

  if (seo.meta_description) {

    let meta = document.querySelector("meta[name='description']");

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", seo.meta_description);
  }

  /* ================= META KEYWORDS ================= */

  if (seo.meta_keyword) {

    let meta = document.querySelector("meta[name='keywords']");

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "keywords");
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", seo.meta_keyword);
  }

  /* ================= META PIXEL ================= */

  if (seo.meta_pixel && !document.getElementById("seo-meta-pixel")) {

    const wrapper = document.createElement("div");
    wrapper.id = "seo-meta-pixel";
    wrapper.innerHTML = seo.meta_pixel;

    document.head.appendChild(wrapper);
  }

  /* ================= CANONICAL ================= */

  if (seo.canonical_domain) {

    let canonical = document.querySelector("link[rel='canonical']");

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    canonical.setAttribute("href", seo.canonical_domain);
  }

  /* ================= AMP ================= */

  if (seo.amp_tag) {

    const wrapper = document.createElement("div");
    wrapper.innerHTML = seo.amp_tag;

    document.head.appendChild(wrapper);
  }

  /* ================= FAVICON ================= */

  if (seo.favicon) {

    let favicon = document.querySelector("link[rel='icon']");

    if (!favicon) {
      favicon = document.createElement("link");
      favicon.setAttribute("rel", "icon");
      document.head.appendChild(favicon);
    }

    favicon.setAttribute("href", seo.favicon);
  }

  /* ================= LIVECHAT ================= */

  if (seo.script_livechat && !window.Tawk_API) {

    const container = document.createElement("div");
    container.innerHTML = seo.script_livechat;

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

  /* ================= LINK LIVECHAT ================= */

  if (seo.link_livechat) {

    const a = document.createElement("a");
    a.href = seo.link_livechat;
    a.target = "_blank";
    a.style.display = "none";

    document.body.appendChild(a);
  }

  /* ================= CUSTOM HEAD SCRIPT ================= */

  const headScript =
    seo.custom_script_page ||
    seo.custom_script_global;

  if (headScript && !document.getElementById("seo-head-script")) {

    const wrapper = document.createElement("div");
    wrapper.id = "seo-head-script";
    wrapper.innerHTML = headScript;

    document.head.appendChild(wrapper);
  }

  /* ================= CUSTOM BODY SCRIPT ================= */

  const bodyScript =
    seo.custom_script_body_page ||
    seo.custom_script_body_global;

  if (bodyScript && !document.getElementById("seo-body-script")) {

    const wrapper = document.createElement("div");
    wrapper.id = "seo-body-script";
    wrapper.innerHTML = bodyScript;

    document.body.prepend(wrapper);
  }

  /* ================= OPEN GRAPH ================= */

  const setOG = (property: string, content: string) => {

    if (!content) return;

    let meta = document.querySelector(`meta[property='${property}']`);

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("property", property);
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", content);
  };

  setOG("og:title", seo.meta_title || seo.page_title);
  setOG("og:description", seo.meta_description);
  setOG("og:image", seo.logo);
  setOG("og:type", "website");
  setOG("og:url", window.location.href);

}