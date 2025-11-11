'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import { fetchThreadsByCategorySlug, fetchCommentsByThreadSlug } from '@/lib/forumApi';
import { getForumLabel } from '@/utils/labelMap';
import NewPostForm from '../NewPostForm';

export default function ForumCategoryPage() {
  const params = useParams();
  const slug = params?.slug ? decodeURIComponent(params.slug) : '';
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const categoryLabel = getForumLabel(slug);

  useEffect(() => {
    async function loadThreads() {
      try {
        const threadsData = await fetchThreadsByCategorySlug(slug);

        // חישוב מספר תגובות
        const withCounts = await Promise.all(
          threadsData.map(async (t) => {
            try {
              const comments = await fetchCommentsByThreadSlug(t.slug);
              return { ...t, commentsCount: comments.length };
            } catch {
              return { ...t, commentsCount: 0 };
            }
          })
        );

        // דיונים חדשים בראש
        setThreads(withCounts.reverse());
      } catch (err) {
        console.error('שגיאה בטעינת דיונים:', err);
      } finally {
        setLoading(false);
      }
    }

    loadThreads();
  }, [slug]);

  return (
    <PageContainer
      title={categoryLabel}
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'פורום', href: '/forum' },
        { label: categoryLabel, href: `/forum/${slug}` },
      ]}
    >
      <div className="bg-[#fffafa] text-black min-h-screen py-1 sm:px-6">
        {/* 🔺 כפתור פתיחת דיון חדש */}
        <div className="flex justify-end items-center mb-4 border-b-2 border-[#e60000] pb-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2 bg-[#e60000] text-white rounded-md hover:bg-[#ff3333] transition font-semibold"
          >
            {showForm ? 'סגור טופס' : 'פתח דיון חדש'}
          </button>
        </div>

        {/* 🧾 טופס פתיחת דיון חדש */}
        {showForm && (
          <div className="mb-6 border-2 border-[#e60000] bg-[#ffeaea] rounded-lg p-6">
            <NewPostForm
              categorySlug={slug}
              onCreated={() => {
                setShowForm(false);
                loadThreads();
              }}
            />
          </div>
        )}

        {/* 🗂️ רשימת דיונים */}
        {loading ? (
          <p className="text-center text-gray-700">טוען דיונים...</p>
        ) : threads.length === 0 ? (
          <p className="text-center text-gray-700">אין דיונים בקטגוריה זו.</p>
        ) : (
          <ul className="divide-y divide-[#e60000]/40 border-t border-b border-[#e60000]/40">
            {threads.map((t, i) => {
              const bgColor = i % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#fff0f0]';
              return (
                <li
                  key={t.id}
                  className={`${bgColor} w-full transition hover:bg-[#ffeaea]/70 duration-200`}
                >
                  <Link href={`/forum/${slug}/${t.slug}`} className="block px-6 py-1">
                    {/* כותרת ופרטים */}
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-bold text-[#e60000] truncate text-right">
                        {t.title}
                      </h3>
                      <div className="text-sm text-gray-700 text-left">
                        <p>
                          נכתב על ידי{' '}
                          <span className="text-[#e60000] font-semibold">
                            {t.author || 'אנונימי'}
                          </span>
                        </p>
                        <p>
                          צפיות: {t.views || 0} • תגובות: {t.commentsCount || 0}
                        </p>
                      </div>
                    </div>

                    {/* תוכן מקוצר */}
                    <p className="text-sm text-black leading-tight whitespace-pre-line">
                      {t.content?.length > 180
                        ? t.content.slice(0, 180) + '...'
                        : t.content}
                    </p>

                    {/* תאריכים */}
                    <div className="text-xs text-gray-700 border-t border-[#e60000]/30 mt-2 pt-1 flex justify-between">
                      <span>
                        נוצר:{' '}
                        {t.date
                          ? new Date(t.date).toLocaleString('he-IL')
                          : '—'}
                      </span>
                      <span>
                        עודכן:{' '}
                        {t.lastActivity
                          ? new Date(t.lastActivity).toLocaleString('he-IL')
                          : '—'}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PageContainer>
  );
}
