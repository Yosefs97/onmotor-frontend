// utils/generateArticleMetadata.js
export async function generateArticleMetadata(params) {
  const API_URL = process.env.STRAPI_API_URL;
  const SITE_URL = "https://www.onmotormedia.com";

  try {
    const res = await fetch(
      `${API_URL}/api/articles?filters[slug][$eq]=${params.slug}&populate=tags,image,gallery`,
      { cache: "no-store" }
    );

    const json = await res.json();
    const article = json.data?.[0]?.attributes;

    if (!article) {
      return { title: "OnMotor Media" };
    }

    const title = article.title || "OnMotor Media";
    const description =
      article.description ||
      article.excerpt ||
      article.content?.slice(0, 160).replace(/<[^>]*>?/gm, "") ||
      "כתבה מתוך מגזין OnMotor Media";

    const keywords =
      article.tags?.data?.map((tag) => tag.attributes.name).join(", ") || "";

    const imageUrl = article.image?.data
      ? `${API_URL}${article.image.data.attributes.url}`
      : "https://www.onmotormedia.com/full_Logo.jpg";

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
