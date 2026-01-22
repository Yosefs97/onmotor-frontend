// app/articles/[slug]/page.jsx

export const revalidate = 180; // רענון כתבה כל 3 דקות

import Script from "next/script";
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
import ScrollToTableButton from "@/components/ScrollToTableButton";
import ScrollToGalleryButton from "@/components/ScrollToGalleryButton";
import ScrollToCommentsButton from "@/components/ScrollToCommentsButton";
import { fixRelativeImages, resolveImageUrl } from "@/lib/fixArticleImages";
import { getArticleImage } from "@/lib/getArticleImage";
import ArticleShareBottom from "@/components/ArticleShareBottom";

const API_URL = process.env.STRAPI_API_URL;
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL;
const SITE_URL = "https://www.onmotormedia.com";
const PLACEHOLDER_IMG = "/default-image.jpg";

// ===================================================================
//              פונקציית עזר לתיקון תמונות לוואטסאפ (Cloudinary)
// ===================================================================
function optimizeCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return url;

  if (!url.includes('res.cloudinary.com')) return url;
  if (url.includes('/w_') && url.includes('/h_')) return url;

  return url.replace('/upload/', '/upload/w_1200,h_630,c_fill,g_auto,f_jpg,q_auto/');
}

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
    if (node?.type === 'link' || node?.url) {
      const href = normalizeHref(node.url || '#');
      const inner = node.children?.length
        ? toHtmlFromStrapiChildren(node.children)
        : renderMarks(node.text || '', node);
      const target = isExternal(href) ? '_blank' : '_self';
      const rel = isExternal(href) ? 'noopener noreferrer' : '';
      return `<a href="${href}" target="${target}" rel="${rel}" class="text-blue-600 underline hover:text-blue-800">${inner}</a>`;
    }
    if (typeof node?.text === 'string') return renderMarks(node.text, node);
    if (node?.children?.length) return toHtmlFromStrapiChildren(node.children);
    return '';
  }).join('');
}

// ===================================================================
//           פונקציה חדשה ומשופרת: המרת טבלת Markdown ל-HTML
// ===================================================================
function parseMarkdownTable(text) {
  if (!text) return null;

  // 1. ניקוי אגרסיבי: המרה של כל סוגי ירידות השורה וה-HTML לפורמט אחיד
  let cleanText = text
    .replace(/<br\s*\/?>/gi, '\n') // המרת <br> לניו-ליין
    .replace(/<\/p>/gi, '\n')      // סוף פסקה = ניו-ליין
    .replace(/<p>/gi, '')          // תחילת פסקה = כלום
    .replace(/&nbsp;/gi, ' ');     // רווחים קשיחים לרווח רגיל

  // 2. פירוק לשורות וניקוי רווחים מתים
  const lines = cleanText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0); // מסננים שורות ריקות לגמרי

  // בדיקת תקינות מינימלית: צריך לפחות כותרת, מפריד ושורה אחת
  if (lines.length < 2) return null;

  // בדיקה אם השורה השנייה היא המפריד (---)
  if (!lines[1].includes('---')) return null;

  try {
    const headers = lines[0]
      .split('|')
      .map(h => h.trim())
      .filter(h => h !== '');

    const rows = lines.slice(2).map(line => 
      line
        .split('|')
        .map(c => c.trim())
        .filter(c => c !== '')
    ).filter(row => row.length > 0);

    if (headers.length === 0) return null;

    let html = `<div class="overflow-x-auto my-6 border border-gray-300 rounded-lg shadow-sm">
      <table class="w-full text-right border-collapse min-w-[300px]">
        <thead class="bg-gray-100">
          <tr>`;
    
    headers.forEach(header => {
      let headerContent = header.replace(/\*\*(.*?)\*\*/g, '$1');
      headerContent = headerContent.replace(/<[^>]*>/g, '');
      html += `<th class="px-4 py-3 border-b border-gray-300 font-bold text-gray-900 text-lg">${headerContent}</th>`;
    });

    html += `</tr></thead><tbody>`;

    rows.forEach((row, rowIndex) => {
      html += `<tr class="${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors">`;
      row.forEach(cell => {
         let cellContent = cell.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-gray-900">$1</span>');
         html += `<td class="px-4 py-3 border-b border-gray-200 text-gray-800 text-base align-top">${cellContent}</td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody></table></div>`;
    return html;
  } catch (e) {
    console.error("Failed to parse markdown table", e);
    return null;
  }
}

// ===================================================================
// ✅ פונקציה חכמה: רק תגיות! (ואם אין, אז תת-קטגוריה)
// ===================================================================
async function getSimilarArticles(currentSlugOrHref, tags, subcategory) {
  try {
    // נרמול מבנה התגיות
    const tagsArray = Array.isArray(tags) ? tags : (tags?.data || []);

    // --- שלב 1: עדיפות מוחלטת לתגיות ---
    if (tagsArray.length > 0) {
      const tagIds = tagsArray.map(t => t.id);
      
      const tagsQuery = tagIds
        .map((id, index) => `filters[tags][id][$in][${index}]=${id}`)
        .join('&');

      const urlTags = `${API_URL}/api/articles?populate=*&filters[href][$ne]=${encodeURIComponent(currentSlugOrHref)}&filters[slug][$ne]=${encodeURIComponent(currentSlugOrHref)}&${tagsQuery}&pagination[limit]=9`;
      
      const resTags = await fetch(urlTags, { next: { revalidate: 60 } });
      const jsonTags = await resTags.json();
      
      // אם מצאנו אפילו כתבה אחת - זה מספיק. מחזירים ויוצאים.
      if (jsonTags.data?.length > 0) {
        return jsonTags.data;
      }
    }

    // --- שלב 2: גיבוי - תת-קטגוריה (רק אם לא נמצאו תגיות) ---
    if (subcategory) {
      // Strapi filters syntax: filters[field][$eq]=value
      const urlSubCategory = `${API_URL}/api/articles?populate=*&filters[href][$ne]=${encodeURIComponent(currentSlugOrHref)}&filters[slug][$ne]=${encodeURIComponent(currentSlugOrHref)}&filters[subcategory][$eq]=${encodeURIComponent(subcategory)}&pagination[limit]=9`;
      
      const resSub = await fetch(urlSubCategory, { next: { revalidate: 3600 } });
      const jsonSub = await resSub.json();
      return jsonSub.data || [];
    }

    return [];

  } catch (err) {
    console.error("Error fetching similar articles:", err);
    return [];
  }
}

// ===================================================================
//                          Generate Metadata
// ===================================================================
export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const decodedSlug = decodeURIComponent(resolvedParams.slug);

    const res = await fetch(
      `${API_URL}/api/articles?filters[$or][0][href][$eq]=${encodeURIComponent(decodedSlug)}&filters[$or][1][slug][$eq]=${encodeURIComponent(decodedSlug)}&populate=*`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) throw new Error(`API fetch failed with status ${res.status}`);
    const json = await res.json();
    const article = json.data?.[0];
    if (!article) return {};

    const title = article.title || "OnMotor Media";
    const description =
      article.headline ||
      article.description ||
      article.subdescription ||
      "כתבה מתוך מגזין OnMotor Media";

    let finalImageUrl = null;
    const strapiImageAttributes = article.image?.data?.attributes;
    if (strapiImageAttributes) {
        if (strapiImageAttributes.url?.includes('cloudinary')) {
            finalImageUrl = strapiImageAttributes.url;
        } 
        else if (strapiImageAttributes.formats?.medium?.url) {
            finalImageUrl = strapiImageAttributes.formats.medium.url;
        } else if (strapiImageAttributes.formats?.small?.url) {
            finalImageUrl = strapiImageAttributes.formats.small.url;
        } else {
            finalImageUrl = strapiImageAttributes.url;
        }
    }

    if (!finalImageUrl) {
        finalImageUrl = getArticleImage(article);
    }

    if (finalImageUrl && !finalImageUrl.startsWith('http')) {
        finalImageUrl = resolveImageUrl(finalImageUrl);
    }

    finalImageUrl = optimizeCloudinaryUrl(finalImageUrl);

    if (!finalImageUrl) {
        finalImageUrl = `${SITE_URL}${PLACEHOLDER_IMG}`;
    }

    return {
      title: `${title} | OnMotor Media`,
      description,
      alternates: { canonical: `${SITE_URL}/articles/${resolvedParams.slug}` },
      openGraph: {
        title,
        description,
        type: "article",
        locale: "he_IL",
        url: `${SITE_URL}/articles/${resolvedParams.slug}`,
        siteName: "OnMotor Media",
        images: [{ url: finalImageUrl, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [finalImageUrl],
      },
    };
  } catch (err) {
    console.error("⚠️ Metadata generation error:", err);
    return {};
  }
}

// ===================================================================
//                          ArticlePage Component
// ===================================================================
export default async function ArticlePage({ params }) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);

  const res = await fetch(
    `${API_URL}/api/articles?filters[$or][0][href][$eq]=${encodeURIComponent(decodedSlug)}&filters[$or][1][slug][$eq]=${encodeURIComponent(decodedSlug)}&populate=*`,
    { next: { revalidate: 360 } }
  );

  const json = await res.json();
  const rawArticle = json.data?.[0];
  if (!rawArticle) return notFound();
  const data = rawArticle;

  const realIdentifier = data.href || data.slug;
  
  // חילוץ תת-הקטגוריה לצורך שליחה לפונקציית החיפוש
  const rawSubcategory = Array.isArray(data.subcategory)
      ? data.subcategory[0]
      : data.subcategory;

  // ✅ שליחת תגיות + תת-קטגוריה (לגיבוי בלבד)
  const similarArticlesData = await getSimilarArticles(realIdentifier, data.tags, rawSubcategory);

  const galleryItems = data.gallery?.data
    ? data.gallery.data.map((item) => item.attributes)
    : data.gallery || [];

  const gallery = galleryItems.map((img) => ({
    src: resolveImageUrl(img.url),
    alt: img.alternativeText || "תמונה מהגלריה",
  }));

  const externalImageUrls = Array.isArray(data.externalImageUrls)
    ? data.externalImageUrls
    : data.externalImageUrls
    ? [data.externalImageUrls]
    : [];

  const externalMediaUrl = data.externalMediaUrl || null;

  let mainImage = PLACEHOLDER_IMG;
  let mainImageAlt = "תמונה ראשית";

  if (galleryItems?.length > 0 && galleryItems[0]?.url) {
    mainImage = resolveImageUrl(galleryItems[0].url);
    mainImageAlt = galleryItems[0].alternativeText || "תמונה ראשית";
  } else if (data.image?.data?.attributes?.url) {
    mainImage = resolveImageUrl(data.image.data.attributes.url);
    mainImageAlt = data.image.data.attributes.alternativeText || "תמונה ראשית";
  } else if (
    Array.isArray(data.external_media_links) &&
    data.external_media_links.length > 1 &&
    typeof data.external_media_links[1] === "string" &&
    data.external_media_links[1].startsWith("http")
  ) {
    mainImage = resolveImageUrl(data.external_media_links[1].trim());
    mainImageAlt = "תמונה ראשית מהמדיה החיצונית";
  } else if (
    Array.isArray(data.external_media_links) &&
    data.external_media_links.length > 0 &&
    typeof data.external_media_links[0] === "string" &&
    data.external_media_links[0].startsWith("http")
  ) {
    mainImage = resolveImageUrl(data.external_media_links[0].trim());
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
    href: `/articles/${data.href || resolvedParams.slug}`,
    category: data.category || "general",
    subcategory: rawSubcategory, // שימוש בערך שחילצנו קודם
    values: Array.isArray(data.Values)
      ? data.Values
      : data.Values
      ? [data.Values]
      : [],
    headline: data.headline || data.title,
    subdescription: data.subdescription || "",
    slug: resolvedParams.slug,
    gallery,
    externalImageUrls,
    externalMediaUrl,
    external_media_links: data.external_media_links || [],
    font_family: data.font_family || "Heebo, sans-serif",
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.onmotormedia.com/articles/${article.slug}`
    },
    "headline": article.title,
    "description": article.description || article.subdescription || "",
    "image": [article.image],
    "author": {
      "@type": "Person",
      "name": article.author || "צוות OnMotor"
    },
    "publisher": {
      "@type": "Organization",
      "name": "OnMotor Media",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.onmotormedia.com/OnMotorLogonoback.png"
      }
    },
    "datePublished": article.date,
    "dateModified": article.date,
    "inLanguage": "he-IL",
    "articleSection": article.category,
    "keywords": (article.tags || []).join(", "),
    "articleBody": typeof article.content === "string"
      ? article.content.substring(0, 500)
      : ""
  };

  const breadcrumbs = [{ label: "דף הבית", href: "/" }];
  if (article.category)
    breadcrumbs.push({
      label: labelMap[article.category] || article.category,
      href: `/${article.category}`,
    });
  if (article.subcategory)
    breadcrumbs.push({
      label: labelMap[article.subcategory] || article.subcategory,
      href: `/${article.category}/${article.subcategory}`,
    });
  if (article.values?.length > 0) {
    const valueKey = article.values[0];
    breadcrumbs.push({
      label: labelMap[valueKey] || valueKey,
      href: `/${article.category}/${article.subcategory}/${valueKey}`,
    });
  }
  breadcrumbs.push({ label: article.title });

  // ===================================================================
  //           הפונקציה המעודכנת לטיפול בטקסט + תמונות + טבלאות
  // ===================================================================
  const renderParagraph = (block, i) => {

    // 0. שיטה 1: בלוק טבלה ייעודי (JSON)
    if (block.__component === 'shared.table-block' || block.type === 'table') {
        return <SimpleKeyValueTable key={i} data={block.tableData} />;
    }

    // 1. טיפול בבלוק מסוג טקסט רגיל (String)
      if (typeof block === "string") {
        let cleanText = fixRelativeImages(block.trim());
        
        // --- שיטה 2: בדיקה אם זה Markdown Table ---
        if (cleanText.includes('---') && cleanText.includes('|')) {
            const tableHtml = parseMarkdownTable(cleanText);
            if (tableHtml) {
                return <div key={i} dangerouslySetInnerHTML={{ __html: tableHtml }} />;
            }
        }
        
        let caption = "";
        const isLikelyTable = cleanText.includes('|') && cleanText.includes('---');
        
        if (!isLikelyTable && cleanText.includes("|")) {
            const parts = cleanText.split("|");
            cleanText = parts[0].trim();
            caption = parts.slice(1).join("|").trim();
        }

        const hasHTMLTags = /<\/?[a-z][\s\S]*>/i.test(cleanText);
   
        if (hasHTMLTags) {
          return (
            <div
              key={i}
              className="article-text text-gray-800 text-[18px] leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: cleanText
              }}
            />
          );
        }
   
        const urlMatch = cleanText.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          let url = urlMatch[0].trim();
            
          if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
            return (
              <InlineImage
                key={i}
                src={url}
                alt="תמונה מתוך הכתבה"
                caption={caption}
              />
            );
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
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
            </p>
          );
        }
   
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
   
      // 2. טיפול בבלוק מסוג פסקה (Paragraph Object)
      if (block.type === "paragraph" && block.children) {
        let html = toHtmlFromStrapiChildren(block.children);
        html = fixRelativeImages(html);

        // --- שיטה 2: בדיקה אם זה Markdown Table (גם בתוך אובייקט פסקה) ---
        if (html.includes('|') && html.includes('---')) {
            const tableHtml = parseMarkdownTable(html);
            if (tableHtml) {
                 return <div key={i} dangerouslySetInnerHTML={{ __html: tableHtml }} />;
            }
        }
        
        let caption = "";
        const isLikelyTable = html.includes('|') && html.includes('---');

        if (!isLikelyTable && html.includes("|") && html.match(/https?:\/\/[^\s"']+/)) {
             const parts = html.split("|");
             html = parts[0].trim();
             caption = parts.slice(1).join("|").trim();
        }
   
        const urlMatch = html.match(/https?:\/\/[^\s"']+/);
        if (urlMatch) {
          let url = urlMatch[0];
          url = url.replace(/<[^>]*>/g, '');

          if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
            return (
              <InlineImage
                key={i}
                src={url}
                alt="תמונה מתוך הכתבה"
                caption={caption} 
              />
            );
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
            dangerouslySetInnerHTML={{
              __html: html
            }}
          />
        );
      }
   
      if (block.type === "list") {
        const isOrdered = block.format === "ordered";
        const Tag = isOrdered ? "ol" : "ul";
        return (
          <Tag
            key={i}
            dir="rtl"
            className={`my-3 pr-6 space-y-1 text-[18px] text-gray-800 leading-relaxed ${
              isOrdered ? "list-decimal" : "list-disc"
            }`}
          >
            {block.children?.map((item, idx) => {
              const html = toHtmlFromStrapiChildren(item.children || []);
              return (
                <li
                  key={idx}
                  dangerouslySetInnerHTML={{
                    __html: fixRelativeImages(html),
                  }}
                />
              );
            })}
          </Tag>
        );
      }
   
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
   
      if (block.type === "image") {
        const imageData =
          block.image?.data?.attributes || block.image?.attributes || block.image;
        if (!imageData?.url) return null;
        const alt = imageData.alternativeText || "תמונה מתוך הכתבה";
        const caption = imageData.caption || "";
        const src = resolveImageUrl(imageData.url);
        return (
          <InlineImage key={i} src={src} alt={alt} caption={caption} />
        );
      }
   
      return null;
  };

  const paragraphs = Array.isArray(article.content)
    ? article.content
    : article.content.split("\n\n");

  return (
    <>
      <Script
            id="structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageContainer title={article.title} breadcrumbs={breadcrumbs}>
        <div
          className="mx-auto max-w-[740px] space-y-0.5 text-right leading-relaxed text-base text-gray-800 px-2"
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
            tags={article.tags}
          />

          {article.description && (
            <p className="font-bold text-2xl text-gray-600">{article.description}</p>
          )}
            
          <div className="article-content">
            {paragraphs.map(renderParagraph)}
          </div>
          {article.tableData && (
            <div className="article-table-section">
              <SimpleKeyValueTable data={article.tableData} />
            </div>
          )}

          {(article.gallery.length > 0 || article.externalImageUrls.length > 0 || (article.external_media_links && article.external_media_links.length > 0)) && (
            <div className="article-gallery-section mt-10 mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 border-r-4 border-red-600 pr-3">
                גלריית תמונות
              </h2>
              
              <Gallery
                images={article.gallery}
                externalImageUrls={article.externalImageUrls}
                externalMediaUrl={article.externalMediaUrl}
                external_media_links={article.external_media_links}
              />
            </div>
          )}
          <div className="w-full flex justify-end relative my-1">
              <ArticleShareBottom />
          </div>
          <div className="comments-section">
            <CommentsSection articleUrl={`${SITE_URL}${article.href}`} />
          </div>

          <Tags tags={article.tags} />
            
          <div className="similar-articles-section">
            <SimilarArticles articles={similarArticlesData} />
          </div>
            
        </div>
      </PageContainer>
      <ScrollToTableButton />
      <ScrollToGalleryButton />
      <ScrollToCommentsButton />
    </>
  );
}