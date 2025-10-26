// app/articles/[slug]/page.jsx
export const dynamic = 'force-dynamic';

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

const API_URL = process.env.STRAPI_API_URL;
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL;
const PLACEHOLDER_IMG = "/default-image.jpg";

// ✅ בדיקה אם תמונה קיימת בשרת
async function isImageAvailable(url) {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

// ✅ פונקציה שמתקנת נתיבי תמונות יחסיים בתוך HTML
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

// ✅ פונקציה עם fallback כמו ב־TabLeftSidebar.jsx
async function resolveImageUrl(rawUrl) {
  if (!rawUrl) return PLACEHOLDER_IMG;
  const fullUrl = rawUrl.startsWith("http")
    ? rawUrl
    : `${PUBLIC_API_URL}${rawUrl.startsWith("/") ? rawUrl : `/uploads/${rawUrl}`}`;
  const exists = await isImageAvailable(fullUrl);
  return exists ? fullUrl : PLACEHOLDER_IMG;
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

  // ✅ טיפול נכון בגלריה גם ב-Strapi v4
  const galleryItems = data.gallery?.data
    ? data.gallery.data.map((item) => item.attributes)
    : data.gallery || [];

  // ✅ תמונה ראשית: מגלריה או מהשדה הראשי
  const mainImageData = galleryItems[0];
  const mainImage = await resolveImageUrl(
    mainImageData?.url ||
    data.image?.url
  );

  const mainImageAlt =
    mainImageData?.alternativeText ||
    data.image?.alternativeText ||
    "תמונה ראשית";

  // ✅ גלריה מלאה
  const gallery = await Promise.all(
    galleryItems.map(async (img) => ({
      src: await resolveImageUrl(img.url),
      alt: img.alternativeText || "תמונה מהגלריה",
    }))
  );

  const article = {
    title: data.title || "כתבה ללא כותרת",
    description: data.description || "אין תיאור זמין",
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
    font_family: data.font_family || "Heebo, sans-serif",
  };

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

  // ✅ רינדור בלוקים של תוכן (כולל בלוק תמונה של Strapi)
  const renderParagraph = (block, i) => {
    // ---- טקסט רגיל ----
    if (typeof block === "string") {
      const cleanText = fixRelativeImages(block.trim());
      const hasHTMLTags = /<\/?[a-z][\s\S]*>/i.test(cleanText);

      if (hasHTMLTags) {
        return (
          <p
            key={i}
            className="article-text text-gray-800 text-[18px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: cleanText }}
          />
        );
      }

      const urlMatch = cleanText.match(/https?:\/\/[^\s]+/);
      if (urlMatch) return <EmbedContent key={i} url={urlMatch[0]} />;

      return (
        <p
          key={i}
          className="article-text text-gray-800 text-[18px] leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: cleanText.replace(/\n/g, "<br/>"),
          }}
        />
      );
    }

    // ---- כותרות ----
    if (block.type === "heading") {
      const level = block.level || 2;
      const Tag = `h${Math.min(level, 3)}`;
      const text = block.children?.map((c) => c.text).join("") || "";
      return (
        <Tag
          key={i}
          className="font-bold text-2xl text-gray-900 mt-4 mb-2"
          dangerouslySetInnerHTML={{ __html: fixRelativeImages(text) }}
        />
      );
    }

    // ✅ בלוק תמונה מתוך העורך של Strapi (כמו בטאבים)
    if (block.type === "image") {
      const imageData =
        block.image?.data?.attributes || block.image?.attributes || block.image;

      if (!imageData?.url) return null;

      const alt = imageData.alternativeText || "תמונה מתוך הכתבה";
      const caption = imageData.caption || "";

      return (
        <InlineImage
          key={i}
          src={imageData.url.startsWith("http") ? imageData.url : `${PUBLIC_API_URL}${imageData.url}`}
          alt={alt}
          caption={caption}
        />
      );
    }

    return null;
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
          <p className="font-bold text-2xl text-gray-600">
            {article.description}
          </p>
        )}

        {paragraphs.map(renderParagraph)}

        {article.tableData && <SimpleKeyValueTable data={article.tableData} />}
        <Gallery images={article.gallery} />
        <Tags tags={article.tags} />
        <SimilarArticles
          currentSlug={article.slug}
          category={article.category}
        />
        <CommentsSection
          articleUrl={`https://www.onmotormedia.com${article.href}`}
        />
      </div>
    </PageContainer>
  );
}
