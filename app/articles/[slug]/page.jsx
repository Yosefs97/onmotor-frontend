// ✅ app/articles/[slug]/page.jsx

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
import ScrollToTableButton from "@/components/ScrollToTableButton";
import ScrollToGalleryButton from "@/components/ScrollToGalleryButton";
import ScrollToCommentsButton from "@/components/ScrollToCommentsButton";
import { fixRelativeImages, resolveImageUrl, wrapHondaProxy } from "@/lib/fixArticleImages";

const API_URL = process.env.STRAPI_API_URL;
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL;
const SITE_URL = "https://www.onmotormedia.com";
const PLACEHOLDER_IMG = "/default-image.jpg";

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

export async function generateMetadata({ params }) {
  const API_URL = process.env.STRAPI_API_URL;
  const SITE_URL = "https://www.onmotormedia.com";

  try {
    const res = await fetch(
      `${API_URL}/api/articles?filters[slug][$eq]=${params.slug}&populate=*`,
      { cache: "no-store" }
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

    let imageUrl = "https://www.onmotormedia.com/full_Logo.jpg";

    if (
      Array.isArray(article.external_media_links) &&
      article.external_media_links.length > 1 &&
      article.external_media_links[1]?.startsWith("http")
    ) {
      imageUrl = article.external_media_links[1].trim();
    } else if (article.image?.data?.attributes?.url) {
      imageUrl = `${API_URL}${article.image.data.attributes.url}`;
    } else if (article.image?.url) {
      imageUrl = resolveImageUrl(article.image.url);
    }

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
        images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (err) {
    console.error("⚠️ Metadata generation error:", err);
    return {};
  }
}

// ===================================================================
//                       ArticlePage Component
// ===================================================================
export default async function ArticlePage({ params, setPageTitle, setPageBreadcrumbs }) {
  const res = await fetch(
    `${API_URL}/api/articles?filters[slug][$eq]=${params.slug}&populate=*`,
    { next: { revalidate: 0 } }
  );

  const json = await res.json();
  const rawArticle = json.data?.[0];
  if (!rawArticle) return notFound();
  const data = rawArticle;

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
  
  


  // ✅ רינדור פסקאות (כולל Honda + YouTube)
  const renderParagraph = (block, i) => {
    if (typeof block === "string") {
      const cleanText = fixRelativeImages(block.trim());
      const hasHTMLTags = /<\/?[a-z][\s\S]*>/i.test(cleanText);

      if (hasHTMLTags) {
        return (
          <div
            key={i}
            className="article-text text-gray-800 text-[18px] leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: cleanText.replace(
                /(https:\/\/hondanews\.eu[^\s"'<>]+)/gi,
                (match) => wrapHondaProxy(match)
              ),
            }}
          />
        );
      }

      const urlMatch = cleanText.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        let url = urlMatch[0].trim();
        if (url.includes("hondanews.eu")) url = wrapHondaProxy(url);
        // ✅ תמיכה בקישורי Kawasaki
        else if (url.includes("content2.kawasaki.com")) {
          // מנקה פרמטרים כמו ?w=400 מהכתובת
          url = url.split("?")[0];
        }


        if (
          /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ||
          url.includes("hondanews.eu/image/") ||
          url.includes("/api/proxy-honda?")
        ) {
          return (
            <InlineImage
              key={i}
              src={url}
              alt="תמונה מתוך הכתבה"
              caption=""
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

    if (block.type === "paragraph" && block.children) {
      let html = toHtmlFromStrapiChildren(block.children);
      html = fixRelativeImages(html);

      const urlMatch = html.match(/https?:\/\/[^\s"']+/);
      if (urlMatch) {
        let url = urlMatch[0];
        if (url.includes("hondanews.eu")) url = wrapHondaProxy(url);
        // ✅ תמיכה בקישורי Kawasaki
        else if (url.includes("content2.kawasaki.com")) {
          // מנקה פרמטרים כמו ?w=400 מהכתובת
          url = url.split("?")[0];
        }


        if (
          /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ||
          url.includes("hondanews.eu/image/") ||
          url.includes("/api/proxy-honda?") ||
          url.includes("content2.kawasaki.com/ContentStorage/")


        ) {
          return (
            <InlineImage
              key={i}
              src={url}
              alt="תמונה מתוך הכתבה"
              caption=""
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
            __html: html.replace(
              /(https:\/\/hondanews\.eu[^\s"'<>]+)/gi,
              (match) => wrapHondaProxy(match)
            ),
          }}
        />
      );
    }

        // ✅ טיפול ברשימות (ממוספרות או נקודתיות)
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
            tags={article.tags}
          />

          {article.description && (
            <p className="font-bold text-2xl text-gray-600">{article.description}</p>
          )}
          {article.subdescription && (
            <p className="second-description text-gray-700 text-[18px]">{article.subdescription}</p>
          )}
          <div className="article-content">
            {paragraphs.map(renderParagraph)}
          </div>
          {article.tableData && (
            <div className="article-table-section">
              <SimpleKeyValueTable data={article.tableData} />
            </div>
          )}

          <div className="article-gallery-section">
            <Gallery
              images={article.gallery}
              externalImageUrls={article.externalImageUrls}
              externalMediaUrl={article.externalMediaUrl}
              external_media_links={article.external_media_links}
            />
          </div>

          <Tags tags={article.tags} />
          <SimilarArticles currentSlug={article.slug} category={article.category} />
          <div className="comments-section">
            <CommentsSection articleUrl={`${SITE_URL}${article.href}`} />
          </div>
        </div>
      </PageContainer>
      <ScrollToTableButton />
      <ScrollToGalleryButton />
      <ScrollToCommentsButton />
    </>
  );
}
