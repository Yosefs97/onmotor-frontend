// app/forum/[slug]/[threadSlug]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import {
  fetchThreadBySlug,
  fetchCommentsByThreadSlug,
  addCommentByThreadSlug,
  incrementThreadViews,
} from '@/lib/forumApi';
import { labelMap } from '@/utils/labelMap';

export default function ForumThreadPage() {
  const { slug, threadSlug } = useParams();
  const [thread, setThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState({ author: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const t = await fetchThreadBySlug(threadSlug);
        setThread(t);
        if (t?.id) await incrementThreadViews(t.id, t.views);
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
      await addCommentByThreadSlug({
        threadSlug,
        text: newComment.text,
        author: newComment.author || 'אנונימי',
        reply_to: replyTo,
      });

      setNewComment({ author: '', text: '' });
      setReplyTo(null);
      const updatedComments = await fetchCommentsByThreadSlug(threadSlug);
      setComments(updatedComments);

      setStatusMessage({ text: 'התגובה פורסמה בהצלחה 🎉', type: 'success' });
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
      <div className="bg-[#111111] text-gray-200 min-h-screen py-8 px-2 sm:px-4">
        {loading ? (
          <p className="text-center text-gray-400">טוען דיון...</p>
        ) : !thread ? (
          <p className="text-center text-red-500">❌ דיון לא נמצא</p>
        ) : (
          <>
            {/* 🟥 פוסט פתיחה */}
            <div className="border border-gray-700 rounded-lg bg-[#1a1a1a] shadow-md mb-8">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {thread.pinned && (
                    <span className="text-[#e60000] font-bold text-sm">📌 נעוץ</span>
                  )}
                  {thread.locked && (
                    <span className="text-[#ff3333] font-bold text-sm">🔒 נעול</span>
                  )}
                  <h2 className="text-xl sm:text-2xl font-semibold text-white">
                    {thread.title}
                  </h2>
                </div>
                <p className="text-sm text-gray-400 text-right">
                  נכתב על ידי {thread.author}
                  <br />
                  צפיות: {thread.views || 0}
                </p>
              </div>
              <div className="p-6 text-gray-100 whitespace-pre-line leading-relaxed">
                {thread.content}
              </div>
              <div className="px-6 pb-4 text-xs text-gray-500 border-t border-gray-700">
                עודכן לאחרונה:{" "}
                {thread.lastActivity
                  ? new Date(thread.lastActivity).toLocaleString("he-IL")
                  : "—"}
              </div>
            </div>

            {/* 🟦 רשימת תגובות */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className="text-gray-400 text-center">אין תגובות עדיין.</p>
              ) : (
                comments.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex flex-col md:flex-row border border-gray-700 bg-[#1a1a1a] rounded-lg shadow-md"
                  >
                    <div className="md:w-1/4 bg-[#151515] border-b md:border-b-0 md:border-l border-gray-700 text-center p-4">
                      <img
                        src="/default-avatar.png"
                        alt="avatar"
                        className="w-16 h-16 mx-auto rounded-full mb-2 border border-gray-700"
                      />
                      <p className="font-semibold text-gray-100">{c.author || "אנונימי"}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        תגובה #{i + 1}
                        <br />
                        {new Date(c.date).toLocaleString("he-IL")}
                      </p>
                      <button
                        onClick={() => setReplyTo(c.id)}
                        className="text-[#e60000] hover:text-[#ff3333] text-xs mt-3 underline"
                      >
                        השב
                      </button>
                    </div>

                    <div className="flex-1 p-4 text-gray-100">
                      {c.reply_to && (
                        <p className="text-xs text-gray-500 mb-1">
                          בתגובה להודעה #{c.reply_to}
                        </p>
                      )}
                      <p className="whitespace-pre-line leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 🟢 טופס תגובה */}
            {!thread.locked && (
              <form
                onSubmit={handleSubmit}
                className="mt-10 border border-gray-700 rounded-lg bg-[#1a1a1a] shadow-md p-6 text-gray-200"
              >
                {replyTo && (
                  <div className="text-sm text-gray-400 mb-3">
                    מגיב ל־תגובה #{replyTo}{" "}
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="text-[#e60000] hover:text-[#ff3333]"
                    >
                      ביטול
                    </button>
                  </div>
                )}

                <h3 className="text-lg font-semibold text-white mb-4 text-right">
                  השאר תגובה
                </h3>

                <label className="block mb-2 text-sm font-medium text-gray-400 text-right">
                  שם
                </label>
                <input
                  type="text"
                  value={newComment.author}
                  onChange={(e) =>
                    setNewComment({ ...newComment, author: e.target.value })
                  }
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 mb-4 text-gray-100 focus:outline-none focus:border-[#e60000]"
                  placeholder="לדוגמה: רוכב מ-TMAX..."
                />

                <label className="block mb-2 text-sm font-medium text-gray-400 text-right">
                  תגובה
                </label>
                <textarea
                  value={newComment.text}
                  onChange={(e) =>
                    setNewComment({ ...newComment, text: e.target.value })
                  }
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 h-32 mb-4 text-gray-100 resize-none focus:outline-none focus:border-[#e60000]"
                  placeholder="כתוב כאן את תגובתך..."
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full px-6 py-2 rounded font-semibold text-white transition ${
                    submitting
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-[#e60000] hover:bg-[#ff3333]"
                  }`}
                >
                  {submitting ? "שולח..." : "פרסם תגובה"}
                </button>

                {statusMessage && (
                  <p
                    className={`mt-4 text-center font-medium ${
                      statusMessage.type === "success"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {statusMessage.text}
                  </p>
                )}
              </form>
            )}

            {thread.locked && (
              <p className="text-center text-red-500 mt-6">
                🔒 הדיון נעול. לא ניתן להוסיף תגובות.
              </p>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
