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

// ✅ הגדרת בסיס לכתובות מדיה
const API_URL = process.env.STRAPI_API_URL;
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL;

// ✅ פונקציה קטנה שמתקנת נתיבי תמונות יחסיים
function fixRelativeImages(html) {
  if (!html) return html;
  return html.replace(
    /<img\s+[^>]*src=["'](?!https?:\/\/)([^"']+)["']/g,
    (match, src) => {
      const fullSrc = src.startsWith('/')
        ? `${PUBLIC_API_URL}${src}`
        : `${PUBLIC_API_URL}/uploads/${src}`;
      return match.replace(src, fullSrc);
    }
  );
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

  const article = {
    title: data.title || "כתבה ללא כותרת",
    description: data.description || "אין תיאור זמין",

    // ✅ תמונה ראשית מהגלריה או מהשדה image
    image:
      data.gallery?.[0]?.url
        ? `${PUBLIC_API_URL}${data.gallery[0].url}`
        : data.image?.url
        ? `${PUBLIC_API_URL}${data.image.url}`
        : "/default-image.jpg",

    imageAlt:
      data.gallery?.[0]?.alternativeText ||
      data.image?.alternativeText ||
      "תמונה ראשית",

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
    gallery:
      data.gallery?.map((img) => ({
        src: img.url.startsWith("http")
          ? img.url
          : `${PUBLIC_API_URL}${img.url}`,
        alt: img.alternativeText || "תמונה מהגלריה",
      })) || [],
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

  // ✅ רינדור בלוקים כולל קישורים, תמונות והטמעות
  const renderParagraph = (block, i) => {
    // ---- טקסט רגיל (string) ----
    if (typeof block === "string") {
      const cleanText = block.trim();

      // תמונות בפורמט [[img:...]] (עדיין נתמך)
      if (cleanText.startsWith("[[img:") && cleanText.endsWith("]]")) {
        const parts = cleanText.slice(6, -2).split("||");
        const [src, alt = "", caption = ""] = parts;
        const fixedSrc = src.startsWith("http")
          ? src
          : `${PUBLIC_API_URL}${src}`;
        return <InlineImage key={i} src={fixedSrc} alt={alt} caption={caption} />;
      }

      // תמונות מהעורך (Rich Text)
      const fixedText = fixRelativeImages(cleanText);

      const hasHTMLTags = /<\/?[a-z][\s\S]*>/i.test(fixedText);
      if (hasHTMLTags) {
        return (
          <p
            key={i}
            className="article-text text-gray-800 text-[18px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: fixedText }}
          />
        );
      }

      const urlMatch = fixedText.match(/https?:\/\/[^\s]+/);
      if (urlMatch) return <EmbedContent key={i} url={urlMatch[0]} />;

      return (
        <p
          key={i}
          className="article-text text-gray-800 text-[18px] leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: fixedText.replace(/\n/g, "<br/>"),
          }}
        />
      );
    }

    // ---- Rich Text מ-Strapi ----
    if (block.type === "paragraph" && block.children) {
      const html = block.children
        .map((child) => {
          if (child.type === "link" && child.url) {
            const label =
              (child.children && child.children[0]?.text) || child.url;
            const href = child.url.startsWith("http")
              ? child.url
              : `${child.url.startsWith("/") ? child.url : "/" + child.url}`;
            return `<a href="${href}" target="_blank" rel="noopener noreferrer"
              class="text-blue-600 underline hover:text-blue-800 transition-colors duration-150">${label}</a>`;
          }

          let text = child.text || "";
          if (child.bold) text = `<strong>${text}</strong>`;
          if (child.italic) text = `<em>${text}</em>`;
          if (child.underline) text = `<u>${text}</u>`;

          // ✅ גם כאן נתקן תמונות במלל
          return fixRelativeImages(text);
        })
        .join("");

      return (
        <p
          key={i}
          className="article-text text-gray-800 text-[18px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    // ---- כותרות ----
    if (block.type === "heading") {
      const level = block.level || 2;
      const Tag = `h${Math.min(level, 3)}`;
      const text = block.children?.map((c) => c.text).join("") || "";
      const fixedText = fixRelativeImages(text); // ✅ גם בכותרת
      return (
        <Tag
          key={i}
          className="font-bold text-2xl text-gray-900 mt-4 mb-2"
          dangerouslySetInnerHTML={{ __html: fixedText }}
        />
      );
    }

    return null;
  };

  // ✅ בניית הפסקאות
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
        <Gallery images={article.gallery} />
        <Tags tags={article.tags} />
        <SimilarArticles currentSlug={article.slug} category={article.category} />
        <CommentsSection articleUrl={`https://www.onmotormedia.com${article.href}`} />
      </div>
    </PageContainer>
  );
}
