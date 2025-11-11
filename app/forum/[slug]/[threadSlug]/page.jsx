// app/forum/[slug]/[threadSlug]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import { fetchThreadBySlug, fetchCommentsByThreadSlug } from '@/lib/forumApi';
import { getForumLabel } from '@/utils/labelMap'; // ✅ שים לב לשינוי כאן
import CommentsSection from './CommentsSection';
import { linkifyText } from '@/utils/linkifyText';

export default function ForumThreadPage() {
  const { slug, threadSlug } = useParams();
  const decodedThreadSlug = decodeURIComponent(threadSlug || '');
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const t = await fetchThreadBySlug(decodedThreadSlug);
        const comments = await fetchCommentsByThreadSlug(decodedThreadSlug);

        const lastCommentDate = comments.length
          ? new Date(
              Math.max(...comments.map((c) => new Date(c.createdAt || c.date)))
            )
          : null;

        const lastActivity = lastCommentDate
          ? lastCommentDate
          : new Date(t.updatedAt || t.date || t.createdAt);

        setThread({ ...t, comments, lastActivity });
      } catch (err) {
        console.error('❌ שגיאה בטעינת דיון:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [decodedThreadSlug]);

  // ✅ משתמש בפונקציה שמחזירה תווית קריאה בעברית
  const categoryLabel = getForumLabel(slug);

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
      {loading ? (
        <div className="text-center py-10 text-gray-700">טוען דיון...</div>
      ) : !thread ? (
        <div className="text-center py-10 text-[#e60000] font-semibold">
          ❌ דיון לא נמצא
        </div>
      ) : (
        <>
          <section className="w-full bg-[#ffeaea] text-black py-2 px-6 sm:px-10">
            <h2 className="text-3xl font-bold text-[#e60000] mb-3">
              {thread.title}
            </h2>

            <p className="text-sm mb-4">
              נכתב על ידי{' '}
              <span className="font-semibold text-[#e60000]">
                {thread.author}
              </span>{' '}
              •{' '}
              {thread.date
                ? new Date(thread.date).toLocaleString('he-IL')
                : '—'}
            </p>

            <div
              className="whitespace-pre-line leading-relaxed text-black text-lg mb-6 break-words break-all overflow-hidden"
              dangerouslySetInnerHTML={{ __html: linkifyText(thread.content) }}
            />

            <div className="text-xs text-gray-700 flex justify-between border-t-2 border-[#e60000]/30 pt-1">
              <span>
                נוצר:{' '}
                {thread.date
                  ? new Date(thread.date).toLocaleString('he-IL')
                  : '—'}
              </span>
              <span>
                עודכן:{' '}
                {thread.lastActivity
                  ? new Date(thread.lastActivity).toLocaleString('he-IL')
                  : '—'}
              </span>
            </div>
          </section>

          <div className="border-t-4 border-[#e60000] my-0 w-full"></div>

          <section className="w-full bg-[#fff] py-8 sm:px-10">
            <CommentsSection
              threadSlug={decodedThreadSlug}
              threadLocked={thread.locked}
            />
          </section>
        </>
      )}
    </PageContainer>
  );
}
