// app/tags/[tag]/page.jsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import PageContainer from '@/components/PageContainer';
import ArticleCard from '@/components/ArticleCards/ArticleCard';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || process.env.STRAPI_API_URL;
const PLACEHOLDER_IMG = '/default-image.jpg';

function resolveImageUrl(rawUrl) {
  if (!rawUrl) return PLACEHOLDER_IMG;
  if (rawUrl.startsWith('http')) return rawUrl;
  return `${API_URL}${rawUrl.startsWith('/') ? rawUrl : `/uploads/${rawUrl}`}`;
}

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
  const [visibleCount, setVisibleCount] = useState(10); 

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_URL}/api/articles?populate=*&pagination[limit]=100&sort=createdAt:desc`, 
          { next: { revalidate: 3600 } }
        );
        
        if (!res.ok) throw new Error('Failed to fetch articles');
        const json = await res.json();

        if (isMounted) {
          const targetSlug = slugify(decodedTag);

          const filtered = (json.data || []).filter(a => {
            const tags = a.tags || [];
            return Array.isArray(tags) && tags.some(t => slugify(t) === targetSlug);
          });

          const normalized = filtered.map(a => {
            let mainImage = PLACEHOLDER_IMG;
            const galleryItem = a.gallery?.[0];
            if (galleryItem?.url) mainImage = resolveImageUrl(galleryItem.url);
            else if (a.image?.url) mainImage = resolveImageUrl(a.image.url);
            else if (Array.isArray(a.external_media_links) && a.external_media_links.length > 0) {
                const l = a.external_media_links.filter(x => x.startsWith('http'));
                if (l.length) mainImage = l[l.length > 1 ? 1 : 0].trim();
            }

            // ✅ תיקון: שימוש ב-href אם קיים
            const correctSlug = a.href || a.slug;

            return {
              id: a.id,
              title: a.title,
              slug: correctSlug,
              href: `/articles/${correctSlug}`,
              headline: a.headline || a.title,
              description: a.description || '',
              date: a.date || new Date().toISOString(), 
              displayDate: new Date(a.date).toLocaleDateString('he-IL'), 
              image: mainImage,
            };
          });

          normalized.sort((a, b) => new Date(b.date) - new Date(a.date));

          setArticles(normalized);
        }
      } catch (err) {
        console.error('Error fetching articles by tag:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [decodedTag]);

  const displayTag = decodedTag.replace(/-/g, ' ');
  
  const showMoreArticles = () => {
    setVisibleCount(prev => prev + 10);
  };

  const visibleArticles = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;

  const breadcrumbs = [
    { label: 'דף הבית', href: '/' },
    { label: `תגית: ${displayTag}` },
  ];

  return (
    <PageContainer title={`כתבות עם תגית: ${displayTag}`} breadcrumbs={breadcrumbs}>
      <div className="space-y-6 min-h-[50vh]">
        {loading && (
          <div className="text-center py-10 text-gray-500">טוען כתבות...</div>
        )}

        {!loading && articles.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p className="text-xl font-bold">לא נמצאו כתבות</p>
          </div>
        )}

        {/* 📱 מובייל */}
        <div className="block md:hidden space-y-0.5">
          {visibleArticles.map(article => (
            <Link 
              key={article.id} 
              href={article.href} 
              prefetch={false}
              className="flex flex-row gap-0.5 border-b border-red-100 pb-1 last:border-0"
            >
              <div className="w-1/3 relative aspect-[4/3] flex-shrink-0">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover rounded-md"
                  sizes="(max-width: 768px) 33vw, 100vw"
                />
              </div>

              <div className="w-2/3 flex flex-col justify-start gap-1">
                <h3 className="text-sm font-bold leading-tight text-gray-900 line-clamp-2">
                  {article.headline}
                </h3>
                <span className="text-xs text-gray-400">
                  {article.displayDate}
                </span>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mt-1">
                  {article.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* 💻 דסקטופ */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-0">
          {visibleArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* כפתור טען עוד */}
        {!loading && hasMore && (
          <div className="flex justify-center pt-6">
            <button
              onClick={showMoreArticles}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm font-medium transition-colors border border-gray-300 shadow-sm"
            >
              הצג עוד כתבות
            </button>
          </div>
        )}

      </div>
    </PageContainer>
  );
}