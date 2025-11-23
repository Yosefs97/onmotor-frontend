// components/CategoryPage.jsx
import SectionWithHeader from './SectionWithHeader';
import LimitedArticles from './LimitedArticles';
import { labelMap } from '@/utils/labelMap';

const API_URL = process.env.STRAPI_API_URL;
const PLACEHOLDER_IMG = '/default-image.jpg';

/* -----------------------------------------------------------
   🖼️ פונקציות עזר (תמונות)
----------------------------------------------------------- */
function resolveImageUrl(rawUrl) {
  if (!rawUrl) return PLACEHOLDER_IMG;
  if (rawUrl.startsWith('http')) return rawUrl;
  return `${API_URL}${rawUrl.startsWith('/') ? rawUrl : `/uploads/${rawUrl}`}`;
}

function groupBySubcategory(articles) {
  return articles.reduce((acc, article) => {
    const subs = Array.isArray(article.subcategory)
      ? article.subcategory
      : [article.subcategory];

    subs.forEach((sub) => {
      if (!acc[sub]) acc[sub] = [];
      acc[sub].push(article);
    });

    return acc;
  }, {});
}

function groupByValues(articles) {
  return articles.reduce((acc, article) => {
    const vals = Array.isArray(article.Values)
      ? article.Values
      : [article.Values];

    vals.forEach((val) => {
      if (!acc[val]) acc[val] = [];
      acc[val].push(article);
    });

    return acc;
  }, {});
}

/* -----------------------------------------------------------
   📡 SSR Fetch
----------------------------------------------------------- */
async function fetchArticles(categoryKey) {
  if (!API_URL) return [];

  let url = `${API_URL}/api/articles?populate=*`;

  if (categoryKey) {
    url += `&filters[category][$eq]=${categoryKey}`;
  }

  try {
    const res = await fetch(url, {
      next: { revalidate: 120 }, // cache 2 דקות
    });

    if (!res.ok) return [];

    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

/* -----------------------------------------------------------
   🟦 רכיב ה־Server Component
----------------------------------------------------------- */
export default async function CategoryPage({ categoryKey, subcategoryKey = null, guideSubKey = null }) {
  const rawArticles = await fetchArticles(categoryKey);

  if (!rawArticles || rawArticles.length === 0) {
    return <p className="text-center text-gray-500">אין עדיין כתבות בקטגוריה זו</p>;
  }

  /* -----------------------------------------------------------
     🧹 מיפוי נתונים ותמונות
  ----------------------------------------------------------- */
  const mapped = rawArticles.map((a) => {
    const attrs = a.attributes;

    // בחירת תמונה
    let mainImage = PLACEHOLDER_IMG;
    let mainImageAlt = attrs.title || 'תמונה';

    const galleryItem = attrs.gallery?.[0];
    if (galleryItem?.url) {
      mainImage = resolveImageUrl(galleryItem.url);
      mainImageAlt = galleryItem.alternativeText || mainImageAlt;
    } else if (attrs.image?.url) {
      mainImage = resolveImageUrl(attrs.image.url);
      mainImageAlt = attrs.image.alternativeText || mainImageAlt;
    } else if (Array.isArray(attrs.external_media_links)) {
      const valid = attrs.external_media_links.filter(
        (l) => typeof l === 'string' && l.startsWith('http')
      );
      if (valid.length > 1) mainImage = valid[1];
      else if (valid.length > 0) mainImage = valid[0];
    }

    return {
      id: a.id,
      title: attrs.title,
      slug: attrs.slug,
      href: `/articles/${attrs.slug}`,
      category: attrs.category,
      subcategory: Array.isArray(attrs.subcategory)
        ? attrs.subcategory
        : [attrs.subcategory ?? 'general'],
      Values: Array.isArray(attrs.Values)
        ? attrs.Values
        : [attrs.Values ?? null],
      description: attrs.description,
      headline: attrs.headline || attrs.title,
      image: mainImage,
      imageAlt: mainImageAlt,
      date: attrs.date || '',
      time: attrs.time || '00:00',
      tags: attrs.tags || [],
    };
  });

  /* -----------------------------------------------------------
     🎯 סינוני Subcategory / Values
  ----------------------------------------------------------- */
  let articles = mapped;

  if (subcategoryKey && subcategoryKey !== 'guides') {
    articles = articles.filter((a) =>
      a.subcategory.includes(subcategoryKey)
    );
  }

  if (subcategoryKey === 'guides' && !guideSubKey) {
    // נמשיך לקיבוץ Values
  }

  if (guideSubKey) {
    articles = articles.filter((a) =>
      a.Values.includes(guideSubKey)
    );
  }

  // מיון לפי תאריך
  articles.sort((a, b) => {
    const aDate = new Date(`${a.date}T${a.time}`);
    const bDate = new Date(`${b.date}T${b.time}`);
    return bDate - aDate;
  });

  /* -----------------------------------------------------------
     🔩 קיבוץ
  ----------------------------------------------------------- */
  const grouped =
    guideSubKey
      ? { [guideSubKey]: articles }
      : subcategoryKey === 'guides'
        ? groupByValues(articles)
        : subcategoryKey
          ? { [subcategoryKey]: articles }
          : groupBySubcategory(articles);

  const hebTitle =
    guideSubKey
      ? `${labelMap.guides} - ${labelMap[guideSubKey] || guideSubKey}`
      : subcategoryKey
        ? labelMap[subcategoryKey] || subcategoryKey
        : labelMap[categoryKey] || categoryKey;

  return (
    <div className="max-w-screen-xl mx-auto px-0" dir="rtl">
      {/* כותרת עליונה */}
      {!subcategoryKey && !guideSubKey && (
        <SectionWithHeader
          title={hebTitle}
          href={`/${categoryKey}`}
          variant="main"
        />
      )}

      {/* תתי־קטגוריות */}
      {Object.entries(grouped).map(([subKey, list]) => (
        <div key={subKey} className="bg-white shadow">
          {!guideSubKey && Object.keys(grouped).length > 1 && (
            <SectionWithHeader
              title={labelMap[subKey] || subKey}
              href={
                subcategoryKey === 'guides'
                  ? `/${categoryKey}/${subcategoryKey}/${subKey}`
                  : `/${categoryKey}/${subKey}`
              }
              variant="category"
            />
          )}

          <LimitedArticles articles={list} initialCount={2} />
        </div>
      ))}
    </div>
  );
}
