// app/tags/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PageContainer from '@/components/PageContainer';
import ArticleCard from '@/components/ArticleCards/ArticleCard';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || process.env.STRAPI_API_URL;
const PLACEHOLDER_IMG = '/default-image.jpg';

// --- פונקציות עזר ---

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

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        // 1️⃣ שליפה: אנחנו כבר מבקשים מהשרת למיין לפי תאריך (sort=createdAt:desc)
        // זה מבטיח שהכתבות מגיעות בסדר הנכון
        const res = await fetch(
          `${API_URL}/api/articles?populate=*&pagination[limit]=100&sort=createdAt:desc`, 
          { next: { revalidate: 3600 } }
        );
        
        if (!res.ok) throw new Error('Failed to fetch articles');
        const json = await res.json();

        if (isMounted) {
          const groups = {};

          // 2️⃣ מיון וחלוקה לקבוצות
          (json.data || []).forEach(a => {
            let mainImage = PLACEHOLDER_IMG;
            const galleryItem = a.gallery?.[0];
            if (galleryItem?.url) mainImage = resolveImageUrl(galleryItem.url);
            else if (a.image?.url) mainImage = resolveImageUrl(a.image.url);
            else if (Array.isArray(a.external_media_links) && a.external_media_links.length > 0) {
                const l = a.external_media_links.filter(x => x.startsWith('http'));
                if (l.length) mainImage = l[l.length > 1 ? 1 : 0].trim();
            }

            const articleData = {
              id: a.id,
              title: a.title,
              slug: a.slug,
              href: `/articles/${a.slug}`,
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
                  // בדיקת כפילויות
                  if (!groups[tagName].find(x => x.id === articleData.id)) {
                    groups[tagName].push(articleData);
                  }
                }
              });
            }
          });

          // סינון תגיות ריקות
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

  // 3️⃣ מיון התגיות עצמן לפי התאריך של הכתבה הכי חדשה בהן
  const sortedTags = Object.keys(groupedArticles).sort((tagA, tagB) => {
    // לוקחים את הכתבה הראשונה בכל קבוצה (שהיא החדשה ביותר כי המידע הגיע ממויין)
    const dateA = new Date(groupedArticles[tagA][0].date);
    const dateB = new Date(groupedArticles[tagB][0].date);
    // מחזירים בסדר יורד (הכי חדש למעלה)
    return dateB - dateA;
  });

  return (
    <PageContainer title="אינדקס תגיות" breadcrumbs={breadcrumbs}>
      <div className="space-y-1 min-h-[50vh]">
        {loading && (
          <div className="text-center py-10 text-gray-500">טוען תגיות...</div>
        )}

        {!loading && sortedTags.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p className="text-xl font-bold">לא נמצאו תגיות פעילות</p>
          </div>
        )}

        {/* לולאה על כל התגיות (ממוינות לפי זמן) */}
        {sortedTags.map(tagName => {
          const articles = groupedArticles[tagName];
          const previewArticles = articles.slice(0, 4); 
          const tagSlug = slugify(tagName);

          return (
            <div key={tagName} className="border-b border-gray-200 pb-2 last:border-0">
              
              {/* כותרת הסקציה */}
              <div className="flex justify-between items-end mb-4 border-r-4 border-[#e60000] pr-3">
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

              {/* ======================================================== */}
              {/* 📱 תצוגת מובייל - העיצוב החדש והצפוף (רשימה)             */}
              {/* ======================================================== */}
              <div className="block md:hidden space-y-0.5">
                {previewArticles.map(article => (
                  <Link 
                    key={article.id} 
                    href={article.href} 
                    prefetch={false}
                    className="flex flex-row gap-0.5 border-b border-red-100 pb-1 last:border-0"
                  >
                    {/* תמונה מימין */}
                    <div className="w-1/3 relative aspect-[4/3] flex-shrink-0">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover rounded-md"
                        sizes="(max-width: 768px) 33vw"
                      />
                    </div>

                    {/* טקסט משמאל - צפוף ומסודר */}
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

              {/* ======================================================== */}
              {/* 💻 תצוגת דסקטופ - גריד כרטיסיות                          */}
              {/* ======================================================== */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-0">
                {previewArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}