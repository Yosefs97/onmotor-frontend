//app\forum\[slug]\[threadSlug]\CommentsSection.jsx
'use client';

import { useEffect, useState } from 'react';
import {
  fetchCommentsByThreadSlug,
  addCommentByThreadSlug,
} from '@/lib/forumApi';
import CommentItem from './CommentItem';

export default function CommentsSection({ threadSlug, threadLocked }) {
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [newComment, setNewComment] = useState({ author: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [threadSlug]);

  async function loadComments() {
  try {
    const data = await fetchCommentsByThreadSlug(threadSlug);
    console.log("🧩 תגובות נטענו:", data);
    setComments(data.map(c => ({
      ...c,
      author: c.author?.trim() || "אנונימי",
      text: c.text?.trim() || "— אין תוכן —"
    })));
  } catch (err) {
    console.error('❌ שגיאה בטעינת תגובות:', err);
  }
}


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.text.trim()) return;
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
      await loadComments();
    } catch (err) {
      console.error('❌ שגיאה בשליחת תגובה:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-[#e60000] mb-6 text-right border-b-2 border-[#e60000] pb-2">
        תגובות ({comments.length})
      </h3>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-700">אין תגובות עדיין.</p>
        ) : (
          comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              comments={comments}
              setReplyTo={setReplyTo}
            />
          ))
        )}
      </div>

      {/* טופס תגובה */}
      {!threadLocked ? (
        <form
          onSubmit={handleSubmit}
          className="mt-10 border-2 border-[#e60000] rounded-xl bg-white shadow-md p-6 text-black"
        >
          {replyTo && (
            <div className="text-sm text-gray-600 mb-3">
              מגיב ל־תגובה #{replyTo}{' '}
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-[#e60000] hover:underline"
              >
                ביטול
              </button>
            </div>
          )}

          <label className="block mb-2 text-sm text-right font-semibold">שם</label>
          <input
            type="text"
            value={newComment.author}
            onChange={(e) =>
              setNewComment({ ...newComment, author: e.target.value })
            }
            className="w-full bg-[#fad2d2] border-2 border-[#e60000] rounded px-3 py-2 mb-4 text-black focus:outline-none focus:border-[#ff3333]"
            placeholder="לדוגמה:יאיר ADV1290"
          />

          <label className="block mb-2 text-sm text-right font-semibold">תגובה</label>
          <textarea
            value={newComment.text}
            onChange={(e) =>
              setNewComment({ ...newComment, text: e.target.value })
            }
            className="w-full bg-[#fad2d2] border-2 border-[#e60000] rounded px-3 py-2 h-32 mb-4 text-black resize-none focus:outline-none focus:border-[#ff3333]"
            placeholder="כתוב כאן את תגובתך..."
          />

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2 rounded font-semibold text-white transition ${
              submitting
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-[#e60000] hover:bg-[#ff3333]'
            }`}
          >
            {submitting ? 'שולח...' : 'פרסם תגובה'}
          </button>
        </form>
      ) : (
        <p className="text-center text-[#e60000] mt-6 font-semibold">
          🔒 הדיון נעול. לא ניתן להוסיף תגובות.
        </p>
      )}
    </div>
  );
}
