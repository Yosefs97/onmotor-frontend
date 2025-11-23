// app/page.js
export const dynamic = "force-dynamic";
import PageContainer from "@/components/PageContainer";
import MainGridContentDesktop from "@/components/MainGridContentDesktop";

const PLACEHOLDER_IMG = "/default-image.jpg";

function resolveImageUrl(rawUrl) {
  const base = process.env.STRAPI_API_URL;
  if (!rawUrl) return PLACEHOLDER_IMG;
  if (rawUrl.startsWith("http")) return rawUrl;
  return `${base}${rawUrl.startsWith("/") ? rawUrl : `/uploads/${rawUrl}`}`;
}

function extractMainImage(attrs) {
  let mainImage = PLACEHOLDER_IMG;
  let mainImageAlt = attrs.title || "תמונה ראשית";

  if (attrs.image?.data?.attributes?.url) {
    mainImage = resolveImageUrl(attrs.image.data.attributes.url);
    mainImageAlt = attrs.image.data.attributes.alternativeText || mainImageAlt;
  } else if (attrs.image?.url) {
    mainImage = resolveImageUrl(attrs.image.url);
    mainImageAlt = attrs.image.alternativeText || mainImageAlt;
  } else if (attrs.gallery?.[0]?.url) {
    mainImage = resolveImageUrl(attrs.gallery[0].url);
    mainImageAlt = attrs.gallery[0].alternativeText || mainImageAlt;
  } else if (Array.isArray(attrs.external_media_links)) {
    const valid = attrs.external_media_links.filter(
      (l) => typeof l === "string" && l.startsWith("http")
    );
    if (valid.length > 1) mainImage = valid[1].trim();
    else if (valid.length > 0) mainImage = valid[0].trim();
    mainImageAlt = "תמונה מהמדיה החיצונית";
  }

  return { mainImage, mainImageAlt };
}

async function fetchArticles() {
  const base = process.env.STRAPI_API_URL;
  const url = `${base}/api/articles?populate=*`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    const json = await res.json();

    return (
      json.data?.map((a) => {
        const attrs = a.attributes;
        const { mainImage, mainImageAlt } = extractMainImage(attrs);

        return {
          id: a.id,
          title: attrs.title,
          slug: attrs.slug,
          category: attrs.category || "general",
          date: attrs.date,
          description: attrs.description,
          headline: attrs.headline || attrs.title,
          subdescription: attrs.subdescription,
          tags: attrs.tags || [],
          href: `/articles/${attrs.slug}`,

          image: mainImage,
          imageAlt: mainImageAlt,
        };
      }) || []
    );
  } catch (err) {
    console.error("❌ שגיאה:", err.message);
    return [];
  }
}

export default async function HomePage() {
  const articles = await fetchArticles();

  return (
    <PageContainer title="דף הבית" breadcrumbs={[]}>
      <MainGridContentDesktop articles={articles} />

      <h1 className="text-2xl font-bold text-[#e60000] px-4 mt-4">
        OnMotor Media – מגזין אופנועים ישראלי
      </h1>

      <p className="px-4 mt-2 mb-4 text-gray-700">
        מגזין אופנועים בישראל – חדשות, סקירות ומבחני דרכים.
      </p>
    </PageContainer>
  );
}
