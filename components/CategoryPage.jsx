'use client';
import React, { useEffect, useState } from 'react';
import SectionWithHeader from './SectionWithHeader';
import LimitedArticles from './LimitedArticles';
import { labelMap } from '@/utils/labelMap';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

// קיבוץ לפי תת קטגוריות רגילות
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

// קיבוץ לפי Values (לתתי־תתי קטגוריות של מדריכים)
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

export default function CategoryPage({ categoryKey = ' ', subcategoryKey = null, guideSubKey = null }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        let url = `${API_URL}/api/articles?populate=*`;

        // ✅ סינון לפי קטגוריה ראשית
        if (categoryKey) {
          url += `&filters[category][$eq]=${categoryKey}`;
        }

        const res = await fetch(url);
        const json = await res.json();
        let data = json.data || [];

        // ✅ סינון בצד הלקוח לפי תת־קטגוריה (בגלל מגבלת SQLite)
        if (subcategoryKey) {
          data = data.filter((a) => {
            const sub = a.subcategory;
            if (!sub) return false;
            if (Array.isArray(sub)) return sub.includes(subcategoryKey);
            if (typeof sub === 'string') return sub.includes(subcategoryKey);
            return false;
          });
        }

        // ✅ סינון לפי תת־תת קטגוריה (Values)
        if (guideSubKey) {
          data = data.filter((a) => {
            const vals = a.Values;
            if (!vals) return false;
            if (Array.isArray(vals)) return vals.includes(guideSubKey);
            if (typeof vals === 'string') return vals.includes(guideSubKey);
            return false;
          });
        }

        const mapped = data.map((a) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          image: a.image?.url ? `${API_URL}${a.image.url}` : '/default-image.jpg',
          imageAlt: a.imageAlt || '',
          category: a.category || 'general',
          subcategory: Array.isArray(a.subcategory)
            ? a.subcategory
            : [a.subcategory ?? 'general'],
          Values: Array.isArray(a.Values)
            ? a.Values
            : [a.Values ?? null],
          description: a.description,
          headline: a.headline || a.title,
          subdescription: a.subdescription,
          href: `/articles/${a.slug}`,
          tags: a.tags || [],
          date: a.date || '',
          time: a.time || '00:00',
        }));
        // ✅ מיון לפי תאריך + שעה + דקה (מהחדש לישן)
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

  if (loading) {
    return <p className="text-center text-gray-500">טוען כתבות...</p>;
  }

  if (articles.length === 0) {
    return <p className="text-center text-gray-500">אין עדיין כתבות בקטגוריה זו</p>;
  }

  // ✅ לוגיקת קיבוץ
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
