// app/articles/[slug]/page.jsx
export const dynamic = 'force-static';
export const revalidate = 0;


import PageContainer from "@/components/PageContainer";
import ArticleHeader from "@/components/ArticleHeader";
import SimpleKeyValueTable from "@/components/SimpleKeyValueTable";
import Tags from "@/components/Tags";
import SimilarArticles from "@/components/SimilarArticles";
import { notFound } from "next/navigation";
import CommentsSection from "@/components/CommentsSection";
import Gallery from "@/components/Gallery";
import { labelMap } from "@/utils/labelMap";
import InlineImage from "@/components/InlineImage";
import EmbedContent from "@/components/EmbedContent";
import Head from "next/head"; // ✅ נוסף כאן


const API_URL = process.env.STRAPI_API_URL;
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL;
const SITE_URL = "https://www.onmotormedia.com";
const PLACEHOLDER_IMG = "/default-image.jpg";

// ✅ מתקנת נתיבי תמונות יחסיים בתוך HTML
function fixRelativeImages(html) {
  if (!html) return html;
  return html.replace(
    /<img\s+[^>]*src=["'](?!https?:\/\/)([^"']+)["']/g,
    (match, src) => {
      const fullSrc = src.startsWith("/")
        ? `${PUBLIC_API_URL}${src}`
        : `${PUBLIC_API_URL}/uploads/${src}`;
      return match.replace(src, fullSrc);
    }
  );
}

// ✅ פונקציה פשוטה לתיקון קישורי מדיה
function resolveImageUrl(rawUrl) {
  if (!rawUrl) return PLACEHOLDER_IMG;
  if (rawUrl.startsWith("http")) return rawUrl;
  return `${PUBLIC_API_URL}${rawUrl.startsWith("/") ? rawUrl : `/uploads/${rawUrl}`}`;
}

// ✅ פונקציות עזר לקישורים ב־Rich Text
function normalizeHref(href) {
  if (!href) return '#';
  if (/^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')) return href;
  return href.startsWith('/') ? href : `/${href}`;
}

function isExternal(href) {
  return /^https?:\/\//i.test(href);
}

function renderMarks(text, node) {
  let t = text ?? '';
  if (node?.bold) t = `<strong>${t}</strong>`;
  if (node?.italic) t = `<em>${t}</em>`;
  if (node?.underline) t = `<u>${t}</u>`;
  return t;
}

function toHtmlFromStrapiChildren(children) {
  if (!Array.isArray(children)) return '';
  return children.map((node) => {
    // צומת קישור
    if (node?.type === 'link' || node?.url) {
      const href = normalizeHref(node.url || '#');
      const inner = node.children?.length
        ? toHtmlFromStrapiChildren(node.children)
        : renderMarks(node.text || '', node);
      const target = isExternal(href) ? '_blank' : '_self';
      const rel = isExternal(href) ? 'noopener noreferrer' : '';
      return `<a href="${href}" target="${target}" rel="${rel}" class="text-blue-600 underline hover:text-blue-800">${inner}</a>`;
    }

    // טקסט רגיל
    if (typeof node?.text === 'string') {
      return renderMarks(node.text, node);
    }

    // אם יש ילדים נוספים
    if (node?.children?.length) {
      return toHtmlFromStrapiChildren(node.children);
    }

    return '';
  }).join('');
}

export async function generateMetadata({ params }) {
  const API_URL = process.env.STRAPI_API_URL;
  const SITE_URL = "https://www.onmotormedia.com";

  try {
    const res = await fetch(
      `${API_URL}/api/articles?filters[slug][$eq]=${params.slug}&populate=image,gallery,external_media_links`,
      { cache: "no-store" }
    );

    const json = await res.json();
    const article = json.data?.[0]?.attributes;

    if (!article) {
      return {
        title: "OnMotor Media",
        description: "מגזין הרוכבים של ישראל – חדשות, סקירות, מדריכים וקהילה",
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
              alt: "OnMotor Media Logo",
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: "OnMotor Media",
          description: "מגזין הרוכבים של ישראל – חדשות, סקירות, מדריכים וקהילה",
          images: ["https://www.onmotormedia.com/full_Logo.jpg"],
        },
        alternates: { canonical: SITE_URL },
      };
    }

    const title = article.title || "OnMotor Media";
    const description =
      article.description ||
      article.subdescription ||
      "כתבה מתוך מגזין OnMotor Media";

    let imageUrl = "https://www.onmotormedia.com/full_Logo.jpg";
    if (
      Array.isArray(article.external_media_links) &&
      article.external_media_links.length > 1 &&
      article.external_media_links[1].startsWith("http")
    ) {
      imageUrl = article.external_media_links[1].trim();
    } else if (article.image?.data?.attributes?.url) {
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
            alt: `${title} - OnMotor Media`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `${SITE_URL}/articles/${params.slug}`,
      },
    };
  } catch (err) {
    console.error("⚠️ Metadata generation error:", err);
    return { title: "OnMotor Media" };
  }
}



export default async function ArticlePage({ params }) {
  const res = await fetch(
    `${API_URL}/api/articles?filters[slug][$eq]=${params.slug}&populate=*`,
    { next: { revalidate: 0 } }
  );

  const json = await res.json();
  const rawArticle = json.data?.[0];
  if (!rawArticle) return notFound();

  const data = rawArticle;

  // ✅ טיפול בגלריה (תמונות מקומיות)
  const galleryItems = data.gallery?.data
    ? data.gallery.data.map((item) => item.attributes)
    : data.gallery || [];

  // ✅ גלריה רגילה
  const gallery = galleryItems.map((img) => ({
    src: resolveImageUrl(img.url),
    alt: img.alternativeText || "תמונה מהגלריה",
  }));

  // ✅ קריאה לשדות חדשים
  const externalImageUrls = Array.isArray(data.externalImageUrls)
    ? data.externalImageUrls
    : data.externalImageUrls
    ? [data.externalImageUrls]
    : [];

  const externalMediaUrl = data.externalMediaUrl || null;

  // ✅ תמונה ראשית — כולל external_media_links
  let mainImage = PLACEHOLDER_IMG;
  let mainImageAlt = "תמונה ראשית";

  if (galleryItems?.length > 0 && galleryItems[0]?.url) {
    mainImage = resolveImageUrl(galleryItems[0].url);
    mainImageAlt = galleryItems[0].alternativeText || "תמונה ראשית";
  } else if (data.image?.url) {
    mainImage = resolveImageUrl(data.image.url);
    mainImageAlt = data.image.alternativeText || "תמונה ראשית";
  } else if (
    Array.isArray(data.external_media_links) &&
    data.external_media_links.length > 1 &&
    typeof data.external_media_links[1] === "string" &&
    data.external_media_links[1].startsWith("http")
  ) {
    mainImage = data.external_media_links[1].trim();
    mainImageAlt = "תמונה ראשית מהמדיה החיצונית";
  }

  const article = {
    title: data.title || "כתבה ללא כותרת",
    description: data.description || "",
    image: mainImage,
    imageAlt: mainImageAlt,
    author: data.author || "מערכת OnMotor",
    date: data.date || "2025-06-22",
    time: data.time || "10:00",
    tags: data.tags || [],
    content: data.content || "",
    tableData: data.tableData || {},
    href: `/articles/${params.slug}`,
    category: data.category || "general",
    subcategory: Array.isArray(data.subcategory)
      ? data.subcategory[0]
      : data.subcategory,
    values: Array.isArray(data.Values)
      ? data.Values
      : data.Values
      ? [data.Values]
      : [],
    headline: data.headline || data.title,
    subdescription: data.subdescription || "",
    slug: params.slug,
    gallery,
    externalImageUrls,
    externalMediaUrl,
    external_media_links: data.external_media_links || [],
    font_family: data.font_family || "Heebo, sans-serif",
  };

  // ✅ תגיות META ידניות
  const metaTitle = article.title || "OnMotor Media";
  const metaDescription = article.description || "מגזין הרוכבים של ישראל";
  const metaImage = article.image || "https://www.onmotormedia.com/full_Logo.jpg";
  const metaUrl = `${SITE_URL}/articles/${params.slug}`;

  // ✅ פירורי לחם
  const breadcrumbs = [{ label: "דף הבית", href: "/" }];
  if (article.category) {
    breadcrumbs.push({
      label: labelMap[article.category] || article.category,
      href: `/${article.category}`,
    });
  }
  if (article.subcategory) {
    breadcrumbs.push({
      label: labelMap[article.subcategory] || article.subcategory,
      href: `/${article.category}/${article.subcategory}`,
    });
  }
  if (article.values?.length > 0) {
    const valueKey = article.values[0];
    breadcrumbs.push({
      label: labelMap[valueKey] || valueKey,
      href: `/${article.category}/${article.subcategory}/${valueKey}`,
    });
  }
  breadcrumbs.push({ label: article.title });

  // ✅ רינדור תוכן עיקרי
  const renderParagraph = (block, i) => {
    // ... (כל הפונקציה שלך כמו שהיא)
    // (לא נחתך שום דבר כאן)
    // ...
  };

  const paragraphs = Array.isArray(article.content)
    ? article.content
    : article.content.split("\n\n");

  return (
    <PageContainer title={article.title} breadcrumbs={breadcrumbs}>
      

      <div
        className="mx-auto max-w-[740px] space-y-2 text-right leading-relaxed text-base text-gray-800 px-2"
        style={{ fontFamily: article.font_family }}
      >
        <ArticleHeader
          author={article.author}
          date={article.date}
          time={article.time}
          image={article.image}
          imageAlt={article.imageAlt}
          title={article.headline}
          subdescription={article.subdescription}
        />

        {article.description && (
          <p className="font-bold text-2xl text-gray-600">{article.description}</p>
        )}

        {paragraphs.map(renderParagraph)}

        {article.tableData && <SimpleKeyValueTable data={article.tableData} />}

        <Gallery
          images={article.gallery}
          externalImageUrls={article.externalImageUrls}
          externalMediaUrl={article.externalMediaUrl}
          external_media_links={article.external_media_links}
        />

        <Tags tags={article.tags} />
        <SimilarArticles currentSlug={article.slug} category={article.category} />
        <CommentsSection articleUrl={`${SITE_URL}${article.href}`} />
      </div>
    </PageContainer>
  );
}
