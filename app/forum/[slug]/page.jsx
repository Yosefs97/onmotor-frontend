// app/forum/[slug]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import { fetchThreadsByCategorySlug } from '@/lib/forumApi';
import { getForumLabel } from '@/utils/labelMap';
import NewPostForm from '../NewPostForm';

export default function ForumCategoryPage() {
  const params = useParams();
  const slug = params?.slug ? decodeURIComponent(params.slug) : '';
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

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
  }, [slug, refresh]);

  return (
    <PageContainer
      title={`${categoryLabel}`}
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'פורום', href: '/forum' },
        { label: categoryLabel, href: `/forum/${slug}` },
      ]}
    >
      <div className="bg-[#faafaf] text-black min-h-screen py-8 px-2 sm:px-4 transition-colors duration-500">
        {/* 🔴 קופסת פתיחת דיון חדש */}
        <div className="border-2 border-[#e60000] rounded-xl bg-white shadow-md mb-8 p-4">
          <NewPostForm categorySlug={slug} onCreated={() => setRefresh(!refresh)} />
        </div>

        {loading ? (
          <p className="text-center text-gray-700">טוען דיונים...</p>
        ) : threads.length === 0 ? (
          <p className="text-center text-gray-700">אין דיונים בקטגוריה זו.</p>
        ) : (
          <ul className="space-y-6">
            {threads.map((t) => (
              <li
                key={t.id}
                className="border-2 border-[#e60000] rounded-xl bg-white shadow-md transition hover:shadow-lg hover:-translate-y-1 duration-200"
              >
                <Link href={`/forum/${slug}/${t.slug}`} className="block p-5">
                  {/* 🟥 כותרת ופרטי יוצר */}
                  <div className="flex justify-between items-start border-b-2 border-[#e60000] pb-3 mb-3">
                    <div>
                      <p className="text-sm">
                        נכתב על ידי{' '}
                        <span className="font-semibold text-[#e60000]">
                          {t.author || 'אנונימי'}
                        </span>
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        צפיות: {t.views || 0}
                      </p>
                    </div>

                    <h3 className="text-xl font-bold text-[#e60000]">
                      {t.title}
                    </h3>
                  </div>

                  {/* 💬 תוכן ראשוני */}
                  <p className="text-sm leading-relaxed whitespace-pre-line mb-4 text-[#181818]">
                    {t.content?.length > 250
                      ? t.content.slice(0, 250) + '...'
                      : t.content}
                  </p>

                  {/* 🕓 תאריכים */}
                  <div className="text-xs text-gray-700 border-t-2 border-[#e60000] pt-2 flex justify-between">
                    <span>
                      נוצר בתאריך:{' '}
                      {t.date
                        ? new Date(t.date).toLocaleString('he-IL')
                        : '—'}
                    </span>
                    <span>
                      עודכן לאחרונה:{' '}
                      {t.lastActivity
                        ? new Date(t.lastActivity).toLocaleString('he-IL')
                        : '—'}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageContainer>
  );
}
