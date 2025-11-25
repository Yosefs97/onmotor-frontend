// app/tags/[tag]/page.jsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageContainer from '@/components/PageContainer';
import ArticleCard from '@/components/ArticleCards/ArticleCard';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || process.env.STRAPI_API_URL;
const PLACEHOLDER_IMG = '/default-image.jpg';

// פונקציה לתיקון כתובת תמונה
function resolveImageUrl(rawUrl) {
  if (!rawUrl) return PLACEHOLDER_IMG;
  if (rawUrl.startsWith('http')) return rawUrl;
  return `${API_URL}${rawUrl.startsWith('/') ? rawUrl : `/uploads/${rawUrl}`}`;
}

// פונקציה לניקוי תגית לטובת התאמה לשדה
function slugify(text) {
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
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/articles?populate=*&filters[tags][$contains]=${decodedTag}`, { next: { revalidate: 3600 } });
        const json = await res.json();

        const filtered = (json.data || []).filter(a => {
          const tags = a.tags || [];
          return Array.isArray(tags) && tags.some(t => slugify(t) === slugify(decodedTag));
        });

        const normalized = filtered.map(a => {
          // 🎯 לוגיקת בחירת תמונה אחידה עם עמוד הכתבה
          let mainImage = PLACEHOLDER_IMG;
          let mainImageAlt = a.title || 'תמונה ראשית';

          // 1️⃣ קודם נבדוק את הגלריה
          const galleryItem = a.gallery?.[0];
          if (galleryItem?.url) {
            mainImage = resolveImageUrl(galleryItem.url);
            mainImageAlt = galleryItem.alternativeText || mainImageAlt;
          }
          // 2️⃣ אם אין גלריה — נבדוק את שדה התמונה הראשית
          else if (a.image?.url) {
            mainImage = resolveImageUrl(a.image.url);
            mainImageAlt = a.image.alternativeText || mainImageAlt;
          }
          // 3️⃣ אם גם זה לא קיים — נבדוק את external_media_links
          else if (
            Array.isArray(a.external_media_links) &&
            a.external_media_links.length > 0
          ) {
            const externalLinks = a.external_media_links.filter(l => typeof l === 'string' && l.startsWith('http'));
            if (externalLinks.length > 1) {
              mainImage = externalLinks[1].trim(); // הקישור השני
            } else if (externalLinks.length > 0) {
              mainImage = externalLinks[0].trim(); // fallback לראשון
            }
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
      } catch (err) {
        console.error('Error fetching articles by tag:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [decodedTag]);

  const breadcrumbs = [
    { label: 'דף הבית', href: '/' },
    { label: `תגית: ${decodedTag}` },
  ];

  return (
    <PageContainer title={`כתבות עם תגית: ${decodedTag}`} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {loading && <div>טוען כתבות...</div>}

        {!loading && articles.length === 0 && (
          <div>לא נמצאו כתבות עם תגית זו.</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
