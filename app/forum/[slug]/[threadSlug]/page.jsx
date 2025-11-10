'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import {
  fetchThreadBySlug,
  incrementThreadViews,
} from '@/lib/forumApi';
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
        if (t?.id) await incrementThreadViews(t.id, t.views);
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
      <div className="bg-[#fad2d2] text-black min-h-screen py-8 px-2 sm:px-4">
        {loading ? (
          <p className="text-center text-gray-700">טוען דיון...</p>
        ) : !thread ? (
          <p className="text-center text-[#e60000] font-semibold">
            ❌ דיון לא נמצא
          </p>
        ) : (
          <>
            {/* 🟥 פוסט פתיחה */}
            <div className="border-2 border-[#e60000] rounded-xl bg-white shadow-md mb-8">
              <div className="p-4 border-b-2 border-[#e60000] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {thread.pinned && (
                    <span className="text-[#e60000] font-bold text-sm">📌 נעוץ</span>
                  )}
                  {thread.locked && (
                    <span className="text-[#e60000] font-bold text-sm">🔒 נעול</span>
                  )}
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#e60000]">
                    {thread.title}
                  </h2>
                </div>
                <p className="text-sm text-right">
                  נכתב על ידי{' '}
                  <span className="font-semibold">{thread.author}</span>
                  <br />
                  צפיות: {thread.views || 0}
                </p>
              </div>
              <div className="p-6 whitespace-pre-line leading-relaxed text-black">
                {thread.content}
              </div>
              <div className="px-6 pb-4 text-xs border-t-2 border-[#e60000]">
                עודכן לאחרונה:{' '}
                {thread.lastActivity
                  ? new Date(thread.lastActivity).toLocaleString('he-IL')
                  : '—'}
              </div>
            </div>

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
