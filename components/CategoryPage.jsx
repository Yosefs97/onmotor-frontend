// components/CategoryPage.jsx
'use client';
import React, { useEffect, useState } from 'react';
import SectionWithHeader from './SectionWithHeader';
import LimitedArticles from './LimitedArticles';
import { labelMap } from '@/utils/labelMap';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || process.env.STRAPI_API_URL;
const PLACEHOLDER_IMG = '/default-image.jpg';

// ----------------------
//  פונקציה לתיקון תמונה
// ----------------------
function resolveImageUrl(rawUrl) {
  if (!rawUrl) return PLACEHOLDER_IMG;
  if (rawUrl.startsWith('http')) return rawUrl;
  return `${API_URL}${rawUrl.startsWith('/') ? rawUrl : `/uploads/${rawUrl}`}`;
}

// ----------------------
//  קיבוץ לפי תת־קטגוריה
// ----------------------
function groupBySubcategory(articles) {
  return articles.reduce((acc, article) => {
    const subcategories = Array.isArray(article.subcategory)
      ? article.subcategory
      : [article.subcategory];

    subcategories.forEach((subcat) => {
      if (!acc[subcat]) acc[subcat] = [];
      acc[subcat].push(article);
    });

    return acc;
  }, {});
}

// ----------------------
//  קיבוץ לפי Values
// ----------------------
function groupByValues(articles) {
  return articles.reduce((acc, article) => {
    const values = Array.isArray(article.Values)
      ? article.Values
      : [article.Values];

    values.forEach((val) => {
      if (!acc[val]) acc[val] = [];
      acc[val].push(article);
    });

    return acc;
  }, {});
}

// ==========================================================
//               רכיב CategoryPage — גרסה מתוקנת
// ==========================================================
export default function CategoryPage({ categoryKey = ' ', subcategoryKey = null, guideSubKey = null }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        let url = `${API_URL}/api/articles?populate=*`;

        if (categoryKey) {
          url += `&filters[category][$eq]=${categoryKey}`;
        }

        const res = await fetch(url);
        const json = await res.json();
        let data = json.data || [];

        // 🛠️ חשוב! ניקוי נתונים פגומים (למניעת undefined.title)
        data = data.filter(a => a && a.attributes);

        // --------------------------
        // סינון לפי תת־קטגוריה
        // --------------------------
        if (subcategoryKey) {
          data = data.filter((a) => {
            const sub = a.attributes.subcategory;
            if (!sub) return false;
            if (Array.isArray(sub)) return sub.includes(subcategoryKey);
            return sub === subcategoryKey;
          });
        }

        // --------------------------
        // סינון לפי Values
        // --------------------------
        if (guideSubKey) {
          data = data.filter((a) => {
            const vals = a.attributes.Values;
            if (!vals) return false;
            if (Array.isArray(vals)) return vals.includes(guideSubKey);
            return vals === guideSubKey;
          });
        }

        // --------------------------
        // מיפוי כתבות
        // --------------------------
        const mapped = data.map((a) => {
          const attrs = a.attributes || {};

          let mainImage = PLACEHOLDER_IMG;
          let mainImageAlt = attrs.title || 'תמונה ראשית';

          const galleryItem = attrs.gallery?.[0];

          if (galleryItem?.url) {
            mainImage = resolveImageUrl(galleryItem.url);
            mainImageAlt = galleryItem.alternativeText || mainImageAlt;
          } else if (attrs.image?.url) {
            mainImage = resolveImageUrl(attrs.image.url);
            mainImageAlt = attrs.image.alternativeText || mainImageAlt;
          } else if (Array.isArray(attrs.external_media_links)) {
            const links = attrs.external_media_links.filter((l) => typeof l === 'string' && l.startsWith('http'));
            if (links.length > 1) mainImage = links[1];
            else if (links.length > 0) mainImage = links[0];
          }

          return {
            id: a.id,
            title: attrs.title || '',
            slug: attrs.slug,
            image: mainImage,
            imageAlt: mainImageAlt,
            category: attrs.category || 'general',
            subcategory: Array.isArray(attrs.subcategory)
              ? attrs.subcategory
              : [attrs.subcategory ?? 'general'],
            Values: Array.isArray(attrs.Values)
              ? attrs.Values
              : [attrs.Values ?? null],
            description: attrs.description,
            headline: attrs.headline || attrs.title,
            subdescription: attrs.subdescription,
            href: `/articles/${attrs.slug}`,
            tags: attrs.tags || [],
            date: attrs.date || '',
            time: attrs.time || '00:00',
          };
        });

        // מיון
        const sorted = mapped.sort((a, b) => {
          const aDateTime = new Date(`${a.date}T${a.time}`);
          const bDateTime = new Date(`${b.date}T${b.time}`);
          return bDateTime - aDateTime;
        });

        setArticles(sorted);
      } catch (err) {
        console.error('שגיאה בטעינת כתבות:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [categoryKey, subcategoryKey, guideSubKey]);

  if (loading) return <p className="text-center text-gray-500">טוען כתבות...</p>;
  if (articles.length === 0) return <p className="text-center text-gray-500">אין עדיין כתבות</p>;

  const grouped =
    guideSubKey
      ? { [guideSubKey]: articles }
      : subcategoryKey === 'guides'
        ? groupByValues(articles)
        : subcategoryKey
          ? { [subcategoryKey]: articles }
          : groupBySubcategory(articles);

  const hebTitle = guideSubKey
    ? `${labelMap['guides']} - ${labelMap[guideSubKey] || guideSubKey}`
    : subcategoryKey
      ? labelMap[subcategoryKey] || subcategoryKey
      : labelMap[categoryKey] || categoryKey;

  return (
    <div className="max-w-screen-xl mx-auto px-0">
      <div className="flex flex-col gap-0" dir="rtl">
        {!subcategoryKey && !guideSubKey && (
          <SectionWithHeader title={hebTitle} href={`/${categoryKey}`} variant="main" />
        )}

        {Object.entries(grouped).map(([subKey, subArticles]) => (
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

            <LimitedArticles articles={subArticles} initialCount={2} />
          </div>
        ))}
      </div>
    </div>
  );
}
