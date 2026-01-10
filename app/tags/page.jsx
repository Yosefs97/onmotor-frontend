// app/tags/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PageContainer from '@/components/PageContainer';
import ArticleCard from '@/components/ArticleCards/ArticleCard';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || process.env.STRAPI_API_URL;
const PLACEHOLDER_IMG = '/default-image.jpg';

// הגדרת כמות תגיות להוספה בכל לחיצה
const TAGS_PER_PAGE = 4;

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

export default function TagsIndex() {
  const [groupedArticles, setGroupedArticles] = useState({});
  const [loading, setLoading] = useState(true);
  
  // 👇 תוספת: סטייט לניהול כמות התגיות המוצגות
  const [visibleCount, setVisibleCount] = useState(TAGS_PER_PAGE);

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
          const groups = {};

          (json.data || []).forEach(a => {
            let mainImage = PLACEHOLDER_IMG;
            const galleryItem = a.gallery?.[0];
            if (galleryItem?.url) mainImage = resolveImageUrl(galleryItem.url);
            else if (a.image?.url) mainImage = resolveImageUrl(a.image.url);
            else if (Array.isArray(a.external_media_links) && a.external_media_links.length > 0) {
                const l = a.external_media_links.filter(x => x.startsWith('http'));
                if (l.length) mainImage = l[l.length > 1 ? 1 : 0].trim();
            }

            const correctSlug = a.href || a.slug;

            const articleData = {
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

            const tags = a.tags || [];
            if (Array.isArray(tags)) {
              tags.forEach(tag => {
                const tagName = typeof tag === 'string' ? tag : tag.name;
                if (tagName) {
                  if (!groups[tagName]) groups[tagName] = [];
                  if (!groups[tagName].find(x => x.id === articleData.id)) {
                    groups[tagName].push(articleData);
                  }
                }
              });
            }
          });

          const filteredGroups = {};
          Object.keys(groups).forEach(key => {
            if (groups[key].length >= 1) {
              filteredGroups[key] = groups[key];
            }
          });

          setGroupedArticles(filteredGroups);
        }
      } catch (err) {
        console.error('Error fetching tags index:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  const breadcrumbs = [
    { label: 'דף הבית', href: '/' },
    { label: 'אינדקס תגיות' },
  ];

  const sortedTags = Object.keys(groupedArticles).sort((tagA, tagB) => {
    const dateA = new Date(groupedArticles[tagA][0].date);
    const dateB = new Date(groupedArticles[tagB][0].date);
    return dateB - dateA;
  });

  // 👇 תוספת: יצירת המערך החלקי להצגה לפי ה-state
  const visibleTags = sortedTags.slice(0, visibleCount);

  // פונקציה לטעינת עוד תגיות
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + TAGS_PER_PAGE);
  };

  return (
    <PageContainer title="אינדקס תגיות" breadcrumbs={breadcrumbs}>
      <div className="space-y-8 min-h-[50vh] pb-10">
        {loading && (
          <div className="text-center py-10 text-gray-500">טוען תגיות...</div>
        )}

        {!loading && sortedTags.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p className="text-xl font-bold">לא נמצאו תגיות פעילות</p>
          </div>
        )}

        {/* רשימת תגיות מהירה בראש הדף (מציג את כולם כרגיל, או שתרצה להגביל גם כאן?) */}
        {/* כרגע השארתי את זה שיציג את כולם לניווט מהיר */}
        {!loading && sortedTags.length > 0 && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-200 mb-8 shadow-sm">
                <h3 className="text-sm font-bold text-red-900 mb-3">ניווט מהיר לפי נושאים:</h3>
                <div className="flex flex-wrap items-center text-sm text-red-900 divide-x divide-x-reverse divide-red-300 leading-loose">
                    {sortedTags.map((tagName) => {
                        const tagSlug = slugify(tagName);
                        const count = groupedArticles[tagName]?.length || 0;
                        return (
                            <Link 
                                key={tagName}
                                href={`/tags/${tagSlug}`}
                                prefetch={false}
                                className="px-3 hover:text-[#e60000] hover:underline transition-all inline-block"
                            >
                                {tagName} 
                                <span className="mr-1 text-red-700/70 font-normal">({count})</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        )}

        {/* 👇 שינוי: רצים על visibleTags במקום sortedTags */}
        {visibleTags.map(tagName => {
          const articles = groupedArticles[tagName];
          const previewArticles = articles.slice(0, 4); 
          const tagSlug = slugify(tagName);

          return (
            <div key={tagName} className="border-b border-gray-200 pb-0 last:border-0 last:pb-0">
              
              <div className="flex justify-between items-end mb-1 border-r-4 border-[#e60000] pr-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  <Link href={`/tags/${tagSlug}`} prefetch={false} className="hover:text-[#e60000] transition-colors">
                    {tagName}
                  </Link>
                </h2>
                <Link 
                  href={`/tags/${tagSlug}`}
                  prefetch={false}
                  className="text-sm text-gray-500 hover:text-[#e60000] font-medium"
                >
                  לכל הכתבות ({articles.length}) &larr;
                </Link>
              </div>

              {/* 📱 מובייל */}
              <div className="block md:hidden space-y-0.5">
                {previewArticles.map(article => (
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
                        sizes="(max-width: 768px) 33vw"
                      />
                    </div>
                    <div className="w-2/3 flex flex-col justify-start gap-0">
                      <h3 className="text-sm font-bold leading-tight text-gray-900 line-clamp-2">
                        {article.headline}
                      </h3>
                      <span className="text-xs text-gray-400 mt-0.5">
                        {article.displayDate}
                      </span>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mt-0.5">
                        {article.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* 💻 דסקטופ */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-0">
                {previewArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

            </div>
          );
        })}

        {/* 👇 תוספת: כפתור טעינת עוד */}
        {!loading && visibleCount < sortedTags.length && (
          <div className="flex justify-center pt-8">
            <button
              onClick={handleLoadMore}
              className="px-8 py-3 bg-[#e60000] text-white font-bold rounded-full shadow-md hover:bg-red-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              הצג עוד נושאים ({sortedTags.length - visibleCount} נותרו)
            </button>
          </div>
        )}

      </div>
    </PageContainer>
  );
}