// app/forum/[slug]/[threadSlug]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import { fetchThreadBySlug } from '@/lib/forumApi';
import { labelMap } from '@/utils/labelMap';
import CommentsSection from './CommentsSection';

export default function ForumThreadPage() {
  const { slug, threadSlug } = useParams();
  const decodedThreadSlug = decodeURIComponent(threadSlug || '');
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const t = await fetchThreadBySlug(decodedThreadSlug);
        setThread(t);
      } catch (err) {
        console.error('❌ שגיאה בטעינת דיון:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [decodedThreadSlug]);

  const categoryLabel = labelMap[slug] || slug;

  return (
    <PageContainer
      title={thread ? thread.title : 'טוען...'}
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'פורום', href: '/forum' },
        { label: categoryLabel, href: `/forum/${slug}` },
        { label: thread?.title || 'דיון', href: `/forum/${slug}/${threadSlug}` },
      ]}
    >
      <div className="bg-[#fff] text-black min-h-screen py-8 px-2 sm:px-4">
        {loading ? (
          <p className="text-center text-gray-700">טוען דיון...</p>
        ) : !thread ? (
          <p className="text-center text-[#e60000] font-semibold">
            ❌ דיון לא נמצא
          </p>
        ) : (
          <>
            {/* 🟩 דיון ראשי ללא קופסה */}
            <div className="pb-8">
              <h2 className="text-3xl font-bold text-[#e60000] mb-2">{thread.title}</h2>

              <div className="text-sm mb-4">
                נכתב על ידי{' '}
                <span className="font-semibold text-[#e60000]">
                  {thread.author}
                </span>
                <span className="mx-2 text-gray-500">•</span>
                {thread.date
                  ? new Date(thread.date).toLocaleString('he-IL')
                  : '—'}
              </div>

              <div className="whitespace-pre-line leading-relaxed text-black text-lg mb-6">
                {thread.content}
              </div>

              <div className="text-xs text-gray-600 flex justify-between">
                <span>
                  נוצר בתאריך:{' '}
                  {thread.date
                    ? new Date(thread.date).toLocaleString('he-IL')
                    : '—'}
                </span>
                <span>
                  עודכן לאחרונה:{' '}
                  {thread.lastActivity
                    ? new Date(thread.lastActivity).toLocaleString('he-IL')
                    : '—'}
                </span>
              </div>
            </div>

            {/* 🔴 קו מפריד עבה */}
            <div className="border-t-4 border-[#e60000] my-6"></div>

            {/* 💬 תגובות */}
            <CommentsSection
              threadSlug={decodedThreadSlug}
              threadLocked={thread.locked}
            />
          </>
        )}
      </div>
    </PageContainer>
  );
}
