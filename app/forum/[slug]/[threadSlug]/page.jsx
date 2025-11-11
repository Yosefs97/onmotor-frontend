// app/forum/[slug]/[threadSlug]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import { fetchThreadBySlug } from '@/lib/forumApi';
import { labelMap } from '@/utils/labelMap';
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

        // ✅ נביא את התגובה האחרונה ישירות מ־Strapi כדי לחשב עדכון אמיתי
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/forum-comments?filters[thread][slug][$eq]=${decodedThreadSlug}&sort[0]=createdAt:desc&pagination[limit]=1`
        );
        const json = await res.json();
        const lastComment = json?.data?.[0];

        // 🕒 אם יש תגובה חדשה – השתמש בתאריך שלה, אחרת בתאריך עדכון או יצירה של הדיון
        const lastActivity = lastComment
          ? lastComment.attributes?.createdAt
          : t.lastActivity || t.updatedAt || t.date || t.createdAt;

        setThread({ ...t, lastActivity });
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
      {loading ? (
        <div className="text-center py-10 text-gray-700">טוען דיון...</div>
      ) : !thread ? (
        <div className="text-center py-10 text-[#e60000] font-semibold">
          ❌ דיון לא נמצא
        </div>
      ) : (
        <>
          {/* 🩷 אזור הדיון הראשי */}
          <section className="w-full bg-[#ffeaea] text-black py-2 px-6 sm:px-10">
            <h2 className="text-3xl font-bold text-[#e60000] mb-3">{thread.title}</h2>

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
              className="
                whitespace-pre-line 
                leading-relaxed 
                text-black 
                text-lg 
                mb-6 
                break-words 
                break-all 
                overflow-hidden
              "
              dangerouslySetInnerHTML={{ __html: linkifyText(thread.content) }}
            />

            {/* 🕒 תאריכים */}
            <div className="text-xs text-gray-700 flex justify-between border-t-2 border-[#e60000]/30 pt-1">
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
          </section>

          {/* 🔴 קו מפריד עבה */}
          <div className="border-t-4 border-[#e60000] my-0 w-full"></div>

          {/* 💬 תגובות */}
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
