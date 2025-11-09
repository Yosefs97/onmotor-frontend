'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import { fetchThreadBySlug, fetchCommentsByThreadSlug, addCommentByThreadSlug } from '@/lib/forumApi';
import { labelMap } from '@/utils/labelMap';

export default function ForumThreadPage() {
  const { slug, threadSlug } = useParams();
  const [thread, setThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState({ author: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // 🟢 הודעה למשתמש

  useEffect(() => {
    async function load() {
      try {
        const t = await fetchThreadBySlug(threadSlug);
        setThread(t);
        const c = await fetchCommentsByThreadSlug(threadSlug);
        setComments(c);
      } catch (err) {
        console.error('❌ שגיאה בטעינת דיון:', err);
        setStatusMessage({ text: 'שגיאה בטעינת הדיון', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [threadSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.text.trim()) {
      setStatusMessage({ text: 'נא למלא תוכן תגובה', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      console.log("📨 שליחת תגובה חדשה...");
      await addCommentByThreadSlug({
        threadSlug,
        text: newComment.text,
        author: newComment.author || 'אנונימי',
      });

      // 🧩 נקה שדות
      setNewComment({ author: '', text: '' });

      // 🔁 טען תגובות מעודכנות
      console.log("🔁 טוען תגובות מעודכנות...");
      const updatedComments = await fetchCommentsByThreadSlug(threadSlug);
      setComments(updatedComments);

      // 🟢 הודעת הצלחה
      setStatusMessage({ text: 'התגובה פורסמה בהצלחה 🎉', type: 'success' });

      // העלם את ההודעה אחרי 3 שניות
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('❌ שגיאה בשליחת תגובה:', err);
      setStatusMessage({ text: 'שגיאה בשליחת תגובה', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

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
        <p>טוען דיון...</p>
      ) : !thread ? (
        <p>❌ דיון לא נמצא</p>
      ) : (
        <>
          <div className="border p-6 rounded-xl bg-white shadow mb-8">
            <h2 className="text-2xl font-semibold mb-2 text-right">{thread.title}</h2>
            <p className="text-sm text-gray-500 mb-4 text-right">נכתב על ידי {thread.author}</p>
            <p className="whitespace-pre-line text-gray-800 leading-relaxed text-right">
              {thread.content}
            </p>
          </div>

          <div className="border p-6 rounded-xl bg-gray-50 text-gray-800 shadow-inner mb-8">
            <h3 className="text-lg text-gray-800 font-semibold mb-4 text-right">תגובות</h3>
            {comments.length === 0 ? (
              <p>אין תגובות עדיין.</p>
            ) : (
              <ul className="space-y-4">
                {comments.map((c) => (
                  <li key={c.id} className="border-b pb-3 text-right">
                    <p className="font-medium">{c.author}</p>
                    <p className="text-gray-700 whitespace-pre-line">{c.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 🟢 טופס השארת תגובה */}
          <form
            onSubmit={handleSubmit}
            className="border p-6 rounded-xl text-gray-800 bg-gray-50 shadow-inner"
          >
            <h3 className="text-xl text-gray-800 font-semibold mb-4 text-right">השאר תגובה</h3>

            <label className="block mb-2 text-sm font-medium text-gray-700 text-right">
              שם
            </label>
            <input
              type="text"
              value={newComment.author}
              onChange={(e) =>
                setNewComment({ ...newComment, author: e.target.value })
              }
              className="w-full border text-gray-800 rounded px-3 py-2 mb-4"
              placeholder="לדוגמה: רוכב מ-TMAX..."
            />

            <label className="block mb-2 text-sm font-medium text-gray-700 text-right">
              תגובה
            </label>
            <textarea
              value={newComment.text}
              onChange={(e) =>
                setNewComment({ ...newComment, text: e.target.value })
              }
              className="w-full border text-gray-800 rounded px-3 py-2 h-32 mb-4 resize-none"
              placeholder="כתוב כאן את תגובתך..."
            />

            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2 rounded text-white font-semibold w-full transition ${
                submitting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {submitting ? 'שולח...' : 'פרסם תגובה'}
            </button>

            {/* 🔔 הודעת הצלחה/שגיאה מתחת לכפתור */}
            {statusMessage && (
              <p
                className={`mt-4 text-center font-medium ${
                  statusMessage.type === 'success'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {statusMessage.text}
              </p>
            )}
          </form>
        </>
      )}
    </PageContainer>
  );
}
