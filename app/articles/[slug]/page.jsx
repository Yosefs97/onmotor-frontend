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
    // =================================
    // 1. נסיון שליפת המידע
    // =================================
    const res = await fetch(
      `${API_URL}/api/articles?filters[slug][$eq]=${params.slug}&populate=image,gallery,external_media_links,headline`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error(`API fetch failed with status ${res.status}`);
  	}

  	const json = await res.json();
  	
  	// =================================
    // 2. נסיון חילוץ המידע
    // =================================
    const article = json.data?.[0]?.attributes; 

  	if (!article) {
  	  // זו לא קריסה, זו פשוט כתבה שלא קיימת
      throw new Error(`Article not found for slug: ${params.slug}. (json.data[0] was empty)`);
  	}

  	// =================================
    // 3. נסיון בניית המטא-דאטה
    // =================================
  	const title = article.title || "OnMotor Media";
  	
  	const description =
  	  article.headline ||
  	  article.description ||
  	  article.subdescription ||
  	  "כתבה מתוך מגזין OnMotor Media";

  	let imageUrl = "https://www.onmotormedia.com/full_Logo.jpg";
  	
  	if (
  	  Array.isArray(article.external_media_links) &&
  	  article.external_media_links.length > 1 &&
  	  article.external_media_links[1]?.startsWith("http") // וידוא בטיחותי
  	) {
  	  imageUrl = article.external_media_links[1].trim();
  	} else if (article.image?.data?.attributes?.url) {
  	  imageUrl = `${API_URL}${article.image.data.attributes.url}`;
  	}

  	// =================================
    // 4. הצלחה! החזרת המידע הנכון
    // =================================
  	return {
  	  title: `${title} | OnMotor Media`,
  	  description,
  	  alternates: { canonical: `${SITE_URL}/articles/${params.slug}` },
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

  } catch (err) {
  	// =================================
    // 5. נכשל! החזרת הודעת השגיאה
    // =================================
  	console.error("⚠️ Metadata generation error (DEBUG MODE):", err);
  	
  	const errorMessage = err.message || "An unknown error occurred";
  	
  	return {
  	  title: "Error in generateMetadata", // יופיע בכותרת הדפדפן
  	  description: errorMessage, 
  	  openGraph: {
  	    title: "SERVER ERROR", // זה יופיע ב-og:title
  	    description: `Debug Info: ${errorMessage.substring(0, 200)}`, // זה יופיע ב-og:description
  	    images: [
  	  	  { 
  	  	    url: "https://www.onmotormedia.com/full_Logo.jpg", // לוגו ברירת מחדל
  	  	    width: 1200,
  	  	    height: 630,
  	  	    alt: "Error"
  	  	  }
  	    ]
  	  },
  	};
  }
}

// ===================================================================
//      הפונקציה הראשית של הדף - חזרה לקוד המקורי שלך
// ===================================================================

export default async function ArticlePage({ params }) {
  const res = await fetch(
    `${API_URL}/api/articles?filters[slug][$eq]=${params.slug}&populate=*`,
    { next: { revalidate: 0 } }
  );

  const json = await res.json();
  const rawArticle = json.data?.[0];
  if (!rawArticle) return notFound();

  const data = rawArticle; // <-- חזרנו לקוד המקורי שלך (ללא .attributes)

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

  // חזרה ללוגיקת התמונה המקורית שלך
  if (galleryItems?.length > 0 && galleryItems[0]?.url) {
    mainImage = resolveImageUrl(galleryItems[0].url);
    mainImageAlt = galleryItems[0].alternativeText || "תמונה ראשית";
  } else if (data.image?.data?.attributes?.url) { // התאמה למבנה של populate=*
    mainImage = resolveImageUrl(data.image.data.attributes.url);
    mainImageAlt = data.image.data.attributes.alternativeText || "תמונה ראשית";
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

  // ✅ רינדור תוכן עיקרי (כולל קישורים, תמונות, Embed)
  const renderParagraph = (block, i) => {
    // טקסט רגיל
    if (typeof block === "string") {
      const cleanText = fixRelativeImages(block.trim());
  	  const hasHTMLTags = /<\/?[a-z][\s\S]*>/i.test(cleanText);

  	  if (hasHTMLTags) {
  	    return (
  	  	  <div
  	  	    key={i}
  	  	    className="article-text text-gray-800 text-[18px] leading-relaxed"
  	  	    dangerouslySetInnerHTML={{ __html: cleanText }}
  	  	  />
  	    );
  	  }

  	  const urlMatch = cleanText.match(/https?:\/\/[^\s]+/);
  	  if (urlMatch) {
  	    const url = urlMatch[0].trim();
  	    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
  	  	  return <InlineImage key={i} src={url} alt="תמונה מתוך הכתבה" caption="" />;
  	    }
  	    if (
  	  	  /(youtube\.com|youtu\.be|facebook\.com|instagram\.com|tiktok\.com|x\.com|twitter\.com)/i.test(
  	  	    url
  	  	  )
  	    ) {
  	  	  return <EmbedContent key={i} url={url} />;
  	    }
  	    return (
  	  	  <p key={i} className="article-text text-blue-600 underline">
  	  	    <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
  	  	  </p>
  	    );
  	  }

  	  return (
  	    <p
  	  	  key={i}
  	  	  className="article-text text-gray-800 text-[18px] leading-relaxed"
  	  	  dangerouslySetInnerHTML={{ __html: cleanText.replace(/\n/g, "<br/>") }}
  	    />
  	  );
    }

    // בלוק מסוג פסקה (Rich Text מ-Strapi)
    if (block.type === "paragraph" && block.children) {
      let html = toHtmlFromStrapiChildren(block.children);
      html = fixRelativeImages(html);

  	  const urlMatch = html.match(/https?:\/\/[^\s"']+/);
  	  if (urlMatch) {
  	    const url = urlMatch[0];
  	    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
  	  	  return <InlineImage key={i} src={url} alt="תמונה" caption="" />;
  	    }
  	    if (
  	  	  /(youtube\.com|youtu\.be|facebook\.com|instagram\.com|tiktok\.com|x\.com|twitter\.com)/i.test(
  	  	    url
  	  	  )
  	    ) {
  	  	  return <EmbedContent key={i} url={url} />;
  	    }
  	  }

  	  return (
  	    <p
  	  	  key={i}
  	  	  className="article-text text-gray-800 text-[18px] leading-relaxed"
  	  	  dangerouslySetInnerHTML={{ __html: html }}
  	    />
  	  );
    }

    // כותרות
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

    // תמונה מתוך בלוק Strapi
    if (block.type === "image") {
      const imageData =
        block.image?.data?.attributes || block.image?.attributes || block.image;
      if (!imageData?.url) return null;
      const alt = imageData.alternativeText || "תמונה מתוך הכתבה";
      const caption = imageData.caption || "";
  	  return (
  	    <InlineImage
  	  	  key={i}
  	  	  src={
  	  	    imageData.url.startsWith("http")
  	  	      ? imageData.url
  	  	      : `${PUBLIC_API_URL}${imageData.url}`
  	  	  }
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