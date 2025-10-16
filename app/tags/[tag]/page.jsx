// /app/tags/[tag]/page.jsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageContainer from '@/components/PageContainer';
import ArticleCard from '@/components/ArticleCards/ArticleCard';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

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
        const res = await fetch(`${API_URL}/api/articles?populate=*`, { cache: 'no-store' });
        const json = await res.json();

        const filtered = (json.data || []).filter(a => {
          const tags = a.tags || [];
          return Array.isArray(tags) && tags.some(t => slugify(t) === slugify(decodedTag));
        });

        const normalized = filtered.map(a => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          href: `/articles/${a.slug}`,
          headline: a.headline || a.title,
          description: a.description || '',
          date: a.date || new Date().toISOString(),
          image: a.image || a.cover || null,
          imageAlt: a.imageAlt || a.title,
        }));

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
