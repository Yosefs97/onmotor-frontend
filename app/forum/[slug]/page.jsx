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
      <div className="bg-[#fad2d2] text-black min-h-screen py-8 px-2 sm:px-4 relative transition-colors duration-500">
        {/* כפתור פתיחת דיון חדש */}
        <NewPostButton categorySlug={slug} onCreated={loadThreads} />

        {loading ? (
          <p className="text-center text-gray-700">טוען דיונים...</p>
        ) : threads.length === 0 ? (
          <p className="text-center text-gray-700">אין דיונים בקטגוריה זו.</p>
        ) : (
          <ul className="divide-y divide-[#e60000]/50 border-2 border-[#e60000] rounded-xl overflow-hidden bg-white shadow-md">
            {threads.map((t) => (
              <li
                key={t.id}
                className="hover:bg-[#ffeaea] transition cursor-pointer group"
              >
                <Link href={`/forum/${slug}/${t.slug}`} className="block p-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex items-center gap-2 mb-2 sm:mb-0">
                      {t.pinned && (
                        <span className="text-[#e60000] font-bold text-xs bg-[#ffdede] px-2 py-1 rounded">
                          📌 נעוץ
                        </span>
                      )}
                      {t.locked && (
                        <span className="text-[#e60000] font-bold text-xs bg-[#ffdede] px-2 py-1 rounded">
                          🔒 נעול
                        </span>
                      )}
                      <h3 className="text-lg font-semibold group-hover:text-[#e60000] transition">
                        {t.title}
                      </h3>
                    </div>

                    <div className="text-sm text-right">
                      <p>
                        נכתב על ידי{' '}
                        <span className="text-[#e60000]">{t.author}</span>
                      </p>
                      <p className="text-xs mt-1">
                        צפיות: {t.views || 0} •{' '}
                        {t.lastActivity
                          ? new Date(t.lastActivity).toLocaleDateString('he-IL')
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm mt-2 line-clamp-2 whitespace-pre-line">
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
