// utils/generateArticleMetadata.js
export async function generateArticleMetadata(params) {
  const API_URL = process.env.STRAPI_API_URL;
  const SITE_URL = "https://www.onmotormedia.com";

  try {
    const res = await fetch(
      `${API_URL}/api/articles?filters[slug][$eq]=${params.slug}&populate=tags,image,gallery,external_media_links`,
      { cache: "no-store" }
    );

    const json = await res.json();
    const article = json.data?.[0]?.attributes;

    if (!article) {
      return {
        title: "OnMotor Media",
        openGraph: {
          title: "OnMotor Media",
          description: "מגזין הרוכבים של ישראל – חדשות, סקירות, מדריכים וקהילה",
          url: SITE_URL,
          siteName: "OnMotor Media",
          images: [
            {
              url: "https://www.onmotormedia.com/full_Logo.jpg",
              width: 1200,
              height: 630,
              alt: "OnMotor Media",
            },
          ],
        },
      };
    }

    const title = article.title || "OnMotor Media";
    const description =
      article.description ||
      article.subdescription ||
      article.content?.slice(0, 150).replace(/<[^>]*>?/gm, "") ||
      "כתבה מתוך מגזין OnMotor Media";

    let imageUrl = "https://www.onmotormedia.com/full_Logo.jpg";

    if (
      Array.isArray(article.external_media_links) &&
      article.external_media_links.length > 1 &&
      article.external_media_links[1].startsWith("http")
    ) {
      imageUrl = article.external_media_links[1].trim();
    } else if (article.image?.data) {
      imageUrl = `${API_URL}${article.image.data.attributes.url}`;
    }

    return {
      title: `${title} | OnMotor Media`,
      description,
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
