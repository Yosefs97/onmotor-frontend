// app/forum/[slug]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import { fetchThreadsByCategorySlug } from '@/lib/forumApi';
import { getForumLabel } from '@/utils/labelMap';
import NewPostButton from '../NewPostButton';

export default function ForumCategoryPage() {
  const params = useParams();
  const slug = params?.slug ? decodeURIComponent(params.slug) : '';
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryLabel = getForumLabel(slug);

  const loadThreads = async () => {
    try {
      const data = await fetchThreadsByCategorySlug(slug);
      setThreads(data);
    } catch (err) {
      console.error('שגיאה בטעינת דיונים:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, [slug]);

  return (
    <PageContainer
      title={`${categoryLabel}`}
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'פורום', href: '/forum' },
        { label: categoryLabel, href: `/forum/${slug}` },
      ]}
    >
      <div className="bg-[#1c1c1c] text-[#ada6a6] min-h-screen py-8 px-2 sm:px-4 transition-colors duration-500">
        {/* כפתור פתיחת דיון חדש */}
        <div className="flex justify-end mb-6">
          <NewPostButton categorySlug={slug} onCreated={loadThreads} />
        </div>

        {loading ? (
          <p className="text-center text-[#ada6a6]/80">טוען דיונים...</p>
        ) : threads.length === 0 ? (
          <p className="text-center text-[#ada6a6]/70">אין דיונים בקטגוריה זו.</p>
        ) : (
          <ul className="divide-y divide-[#2a2a2a] border border-[#333] rounded-xl overflow-hidden bg-[#222] shadow-md">
            {threads.map((t) => (
              <li
                key={t.id}
                className="hover:bg-[#2c1919] transition cursor-pointer group"
              >
                <Link href={`/forum/${slug}/${t.slug}`} className="block p-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex items-center gap-2 mb-2 sm:mb-0">
                      {t.pinned && (
                        <span className="text-[#faafaf] font-bold text-xs bg-[#3a1a1a] px-2 py-1 rounded">
                          📌 נעוץ
                        </span>
                      )}
                      {t.locked && (
                        <span className="text-[#faafaf] font-bold text-xs bg-[#4a1a1a] px-2 py-1 rounded">
                          🔒 נעול
                        </span>
                      )}
                      <h3 className="text-lg font-semibold text-[#ada6a6] group-hover:text-[#faafaf] transition">
                        {t.title}
                      </h3>
                    </div>
                    <div className="text-sm text-[#ada6a6]/80 text-left sm:text-right">
                      <p>
                        נכתב על ידי{' '}
                        <span className="text-[#faafaf]">{t.author}</span>
                      </p>
                      <p className="text-xs text-[#ada6a6]/60 mt-1">
                        צפיות: {t.views || 0} •{' '}
                        {t.lastActivity
                          ? `עדכון אחרון: ${new Date(
                              t.lastActivity
                            ).toLocaleDateString('he-IL')}`
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <p className="text-[#ada6a6]/70 text-sm mt-2 line-clamp-2 whitespace-pre-line">
                    {t.content.length > 300
                      ? t.content.slice(0, 300) + '...'
                      : t.content}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageContainer>
  );
}
