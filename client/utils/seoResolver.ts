export function resolveSEO(seo: any, canonicalList: any[]) {

  if (!seo) return null;

  const hostname = window.location.hostname;

  /* =========================================
     CARI CANONICAL BERDASARKAN DOMAIN
  ========================================= */

  const canonical = canonicalList?.find(
    (c: any) => c.domain_name === hostname
  );

  /* =========================================
     JIKA TIDAK ADA CANONICAL YANG COCOK
     FULL PAKAI SEO DATA
  ========================================= */

  if (!canonical) {

    return {
      ...seo,

      canonical_domain: seo.custom_canonical_global,

      meta_keyword: seo.meta_keyboard,
      meta_title: seo.meta_title,
      meta_description: seo.meta_description,

      flag_custom_footer: seo.flag_custom_footer,
      custom_footer: seo.custom_footer
    };

  }

  /* =========================================
     JIKA DOMAIN COCOK
     BARU BANDINKAN DATA
  ========================================= */

  let finalFooter = null;
  let finalFooterFlag = "0";

  if (canonical.flag_custom_footer === "1") {

    finalFooter = canonical.custom_footer;
    finalFooterFlag = "1";

  } else if (seo.flag_custom_footer === "1") {

    finalFooter = seo.custom_footer;
    finalFooterFlag = "1";

  }

  return {

    /* ================= BASIC ================= */

    website_name: seo.website_name,
    page_title: seo.page_title || seo.default_website_title,

    /* ================= META ================= */

    meta_title: canonical.meta_title || seo.meta_title,
    meta_keyword: canonical.meta_keyword || seo.meta_keyboard,
    meta_description: canonical.meta_description || seo.meta_description,

    /* ================= CANONICAL ================= */

    canonical_domain: canonical.canonical_domain || seo.custom_canonical_global,
    amp_tag: canonical.amp_tag,
    amp_page_redirect: canonical.amp_page_redirect,

    /* ================= FOOTER ================= */

    flag_custom_footer: finalFooterFlag,
    custom_footer: finalFooter,

    /* ================= SEO ORIGINAL ================= */

    meta_pixel: seo.meta_pixel,
    link_livechat: seo.link_livechat,
    script_livechat: seo.script_livechat,

    custom_script_page: seo.custom_script_page,
    custom_script_global: seo.custom_script_global,

    custom_script_body_page: seo.custom_script_body_page,
    custom_script_body_global: seo.custom_script_body_global,

    running_text: seo.running_text,
    logo: seo.logo,
    favicon: seo.favicon,

    /* ================= COLORS ================= */

    color_primary: seo.color_primary,
    color_category: seo.color_category,
    color_content_game: seo.color_content_game,
    color_promotion: seo.color_promotion

  };

}