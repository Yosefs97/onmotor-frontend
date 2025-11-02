// utils/generateArticleMetadata.js
export async function generateArticleMetadata(params) {
  const API_URL = process.env.STRAPI_API_URL;
  const SITE_URL = "https://www.onmotormedia.com";

  try {
    // ✅ נמשוך גם external_media_links כדי להשתמש בתמונה מהשורה השנייה
    const res = await fetch(
      `${API_URL}/api/articles?filters[slug][$eq]=${params.slug}&populate=tags,image,gallery,external_media_links`,
      { cache: "no-store" }
    );

    const json = await res.json();
    const article = json.data?.[0]?.attributes;

    if (!article) {
      return { title: "OnMotor Media" };
    }

    // ✅ כותרת ותיאור
    const title = article.title || "OnMotor Media";
    const description =
      article.description ||
      article.subdescription ||
      article.excerpt ||
      article.content?.slice(0, 160).replace(/<[^>]*>?/gm, "") ||
      "כתבה מתוך מגזין OnMotor Media";

    // ✅ מילות מפתח
    const keywords =
      article.tags?.data?.map((tag) => tag.attributes.name).join(", ") || "";

    // ✅ תמונה ראשית - נלקחת מהשורה השנייה של external_media_links
    let imageUrl = "https://www.onmotormedia.com/full_Logo.jpg";

    if (
      Array.isArray(article.external_media_links) &&
      article.external_media_links.length > 1 &&
      typeof article.external_media_links[1] === "string" &&
      article.external_media_links[1].startsWith("http")
    ) {
      imageUrl = article.external_media_links[1].trim();
    } else if (article.image?.data) {
      imageUrl = `${API_URL}${article.image.data.attributes.url}`;
    } else if (article.gallery?.data?.length > 0) {
      imageUrl = `${API_URL}${article.gallery.data[0].attributes.url}`;
    }

    // ✅ מבנה מלא ל-Open Graph ול-Twitter
    return {
      title: `${title} | OnMotor Media`,
      description,
      keywords,
      openGraph: {
        title,
        description,
        type: "article",
        locale: "he_IL",
        url: `${SITE_URL}/articles/${params.slug}`,
        siteName: "OnMotor Media",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("❌ Metadata generation failed:", error);
    return { title: "OnMotor Media" };
  }
}
