// components/CategoryPage.jsx
'use client';
import React, { useEffect, useState } from 'react';
import SectionWithHeader from './SectionWithHeader';
import LimitedArticles from './LimitedArticles';
import { labelMap } from '@/utils/labelMap';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || process.env.STRAPI_API_URL;
const PLACEHOLDER_IMG = '/default-image.jpg';

// ⭐ פונקציה שמוודאת כתובת תקינה לתמונה (כולל Cloudinary)
function resolveImageUrl(rawUrl) {
  if (!rawUrl) return PLACEHOLDER_IMG;
  if (rawUrl.startsWith('http')) return rawUrl;
  return `${API_URL}${rawUrl.startsWith('/') ? rawUrl : `/uploads/${rawUrl}`}`;
}

// ⭐ קיבוץ לפי תת־קטגוריה
function groupBySubcategory(articles) {
  return articles.reduce((acc, article) => {
    const subcategories = Array.isArray(article.subcategory)
      ? article.subcategory
      : [article.subcategory];

    subcategories.forEach((subcat) => {
      if (!subcat) return;
      if (!acc[subcat]) acc[subcat] = [];
      acc[subcat].push(article);
    });

    return acc;
  }, {});
}

// ⭐ קיבוץ לפי Values (למדריכים)
function groupByValues(articles) {
  return articles.reduce((acc, article) => {
    const values = Array.isArray(article.Values)
      ? article.Values
      : [article.Values];

    values.forEach((val) => {
      if (!val) return;
      if (!acc[val]) acc[val] = [];
      acc[val].push(article);
    });

    return acc;
  }, {});
}

export default function CategoryPage({ categoryKey = ' ', subcategoryKey = null, guideSubKey = null }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐⭐⭐ שינוי יחיד: החלפת הפניה ל־Strapi → API פנימי
  useEffect(() => {
    async function fetchArticles() {
      try {
        // בונים URL פנימי – ללא Strapi
        let url = '/api/articles';

        const params = new URLSearchParams();
        params.set('populate', '*');

        // ⭐ סינון ברמת Strapi
        if (categoryKey) {
          params.append('filters[category][$eq]', categoryKey);
        }

        // בניית ה־URL הסופי
        url += `?${params.toString()}`;

        // מביאים את הנתונים מהשרת הפנימי
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();

        let data = Array.isArray(json.data) ? json.data : [];

        // ⭐ "הרמת" attributes לאובייקט שטוח
        data = data.map((item) => ({
          id: item.id,
          ...item.attributes,
        }));

        // ⭐ סינון בצד הלקוח
        if (subcategoryKey) {
          data = data.filter((a) => {
            const sub = a.subcategory;
            if (!sub) return false;
            if (Array.isArray(sub)) return sub.includes(subcategoryKey);
            if (typeof sub === 'string') return sub.includes(subcategoryKey);
            return false;
          });
        }

        if (guideSubKey) {
          data = data.filter((a) => {
            const vals = a.Values;
            if (!vals) return false;
            if (Array.isArray(vals)) return vals.includes(guideSubKey);
            if (typeof vals === 'string') return vals.includes(guideSubKey);
            return false;
          });
        }

        // ⭐ מיפוי נתונים + תמונות
        const mapped = data.map((a) => {
          let mainImage = PLACEHOLDER_IMG;
          let mainImageAlt = a.title || 'תמונה ראשית';

          const galleryItem = a.gallery?.[0];
          if (galleryItem?.url) {
            mainImage = resolveImageUrl(galleryItem.url);
            mainImageAlt = galleryItem.alternativeText || mainImageAlt;
          } else if (a.image?.url) {
            mainImage = resolveImageUrl(a.image.url);
            mainImageAlt = a.image.alternativeText || mainImageAlt;
          } else if (Array.isArray(a.external_media_links)) {
            const valid = a.external_media_links.filter((l) => typeof l === 'string' && l.startsWith('http'));
            if (valid.length > 1) mainImage = valid[1];
            else if (valid.length > 0) mainImage = valid[0];
            mainImageAlt = 'תמונה ראשית מהמדיה החיצונית';
          }

          return {
            id: a.id,
            title: a.title,
            slug: a.slug,
            image: mainImage,
            imageAlt: mainImageAlt,
            category: a.category || 'general',
            subcategory: Array.isArray(a.subcategory) ? a.subcategory : [a.subcategory ?? 'general'],
            Values: Array.isArray(a.Values) ? a.Values : [a.Values ?? null],
            description: a.description,
            headline: a.headline || a.title,
            subdescription: a.subdescription,
            href: `/articles/${a.slug}`,
            tags: a.tags || [],
            date: a.date || '',
            time: a.time || '00:00',
          };
        });

        // ⭐ מיון מהחדש לישן
        const sorted = mapped.sort((a, b) => {
          const aD = new Date(`${a.date}T${a.time}`);
          const bD = new Date(`${b.date}T${b.time}`);
          return bD - aD;
        });

        setArticles(sorted);
      } catch (err) {
        console.error('שגיאה בטעינת כתבות:', err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [categoryKey, subcategoryKey, guideSubKey]);

  // ⭐ העיצוב לא משתנה – בדיוק מה שיש אצלך
  if (loading) {
    return <p className="text-center text-gray-500">טוען כתבות...</p>;
  }

  if (articles.length === 0) {
    return <p className="text-center text-gray-500">אין עדיין כתבות בקטגוריה זו</p>;
  }

  // ⭐ Grouping זהה
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

  const shouldShowMainTitle =
    subcategoryKey !== null || guideSubKey !== null || Object.keys(grouped).length === 1;

  return (
    <div className="max-w-screen-xl mx-auto px-0">
      <div className="flex flex-col gap-0" dir="rtl">
        {!subcategoryKey && !guideSubKey && shouldShowMainTitle && (
          <SectionWithHeader
            title={hebTitle}
            href={`/${categoryKey}`}
            variant="main"
          />
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
