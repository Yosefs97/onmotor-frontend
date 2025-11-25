// app/tags/[tag]/page.jsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageContainer from '@/components/PageContainer';
import ArticleCard from '@/components/ArticleCards/ArticleCard';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || process.env.STRAPI_API_URL;
const PLACEHOLDER_IMG = '/default-image.jpg';

// ✅ פונקציה לתיקון כתובת תמונה
function resolveImageUrl(rawUrl) {
  if (!rawUrl) return PLACEHOLDER_IMG;
  if (rawUrl.startsWith('http')) return rawUrl;
  return `${API_URL}${rawUrl.startsWith('/') ? rawUrl : `/uploads/${rawUrl}`}`;
}

// ✅ פונקציה לניקוי תגית לטובת התאמה לשדה
function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       
    .replace(/[^\w\-א-ת]+/g, '') 
    .replace(/\-\-+/g, '-');     
}

export default function TagPage() {
  const { tag } = useParams();
  const decodedTag = decodeURIComponent(tag);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // למניעת עדכוני state אם הרכיב ירד מהמסך

    (async () => {
      try {
        setLoading(true);
        
        // 🚀 אופטימיזציה: מושכים רק את ה-100 הכתבות החדשות ביותר
        // במקום להעמיס את כל מסד הנתונים על הדפדפן של המשתמש
        const res = await fetch(
          `${API_URL}/api/articles?populate=*&pagination[limit]=100&sort=createdAt:desc`, 
          { next: { revalidate: 3600 } }
        );
        
        if (!res.ok) throw new Error('Failed to fetch articles');
        const json = await res.json();

        if (isMounted) {
          // סינון חכם בצד לקוח (כי ה-Slug ב-URL לא תמיד זהה לאיך שזה שמור ב-DB)
          const targetSlug = slugify(decodedTag);

          const filtered = (json.data || []).filter(a => {
            const tags = a.tags || [];
            return Array.isArray(tags) && tags.some(t => slugify(t) === targetSlug);
          });

          // נרמול הנתונים לתצוגה
          const normalized = filtered.map(a => {
            let mainImage = PLACEHOLDER_IMG;
            let mainImageAlt = a.title || 'תמונה ראשית';

            // 1. גלריה
            const galleryItem = a.gallery?.[0];
            if (galleryItem?.url) {
              mainImage = resolveImageUrl(galleryItem.url);
              mainImageAlt = galleryItem.alternativeText || mainImageAlt;
            } 
            // 2. תמונה ראשית
            else if (a.image?.url) {
              mainImage = resolveImageUrl(a.image.url);
              mainImageAlt = a.image.alternativeText || mainImageAlt;
            } 
            // 3. לינקים חיצוניים
            else if (Array.isArray(a.external_media_links) && a.external_media_links.length > 0) {
              const externalLinks = a.external_media_links.filter(l => typeof l === 'string' && l.startsWith('http'));
              if (externalLinks.length > 1) mainImage = externalLinks[1].trim();
              else if (externalLinks.length > 0) mainImage = externalLinks[0].trim();
              mainImageAlt = 'תמונה ראשית מהמדיה החיצונית';
            }

            return {
              id: a.id,
              title: a.title,
              slug: a.slug,
              href: `/articles/${a.slug}`,
              headline: a.headline || a.title,
              description: a.description || '',
              date: a.date || new Date().toISOString(),
              image: mainImage,
              imageAlt: mainImageAlt,
            };
          });

          setArticles(normalized);
        }
      } catch (err) {
        console.error('Error fetching articles by tag:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [decodedTag]);

  // הצגה נקייה של שם התגית בכותרת
  const displayTag = decodedTag.replace(/-/g, ' ');

  const breadcrumbs = [
    { label: 'דף הבית', href: '/' },
    { label: `תגית: ${displayTag}` },
  ];

  return (
    <PageContainer title={`כתבות עם תגית: ${displayTag}`} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {loading && (
          <div className="text-center py-10 text-gray-500">טוען כתבות...</div>
        )}

        {!loading && articles.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p className="text-xl font-bold">לא נמצאו כתבות</p>
            <p>לא נמצאו כתבות חדשות עבור התגית "{displayTag}"</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}