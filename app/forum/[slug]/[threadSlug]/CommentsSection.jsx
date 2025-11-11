'use client';

import { useEffect, useState } from 'react';
import {
  fetchCommentsByThreadSlug,
  addCommentByThreadSlug,
} from '@/lib/forumApi';
import CommentItem from './CommentItem';
import { motion, AnimatePresence } from 'framer-motion'; // ✅ נשתמש לאנימציה

export default function CommentsSection({ threadSlug, threadLocked }) {
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [newComment, setNewComment] = useState({ author: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false); // 👈 שליטה על פתיחת הטופס

  useEffect(() => {
    loadComments();
  }, [threadSlug]);

  async function loadComments() {
    try {
      const data = await fetchCommentsByThreadSlug(threadSlug);

      // 🧩 מיון היררכי – תגובה למישהו תמיד אחרי המגיב
      const sortHierarchical = (arr) => {
        const byId = Object.fromEntries(arr.map((c) => [c.id, c]));
        const sorted = [];
        const visit = (c) => {
          if (sorted.includes(c)) return;
          if (c.reply_to && byId[c.reply_to]) visit(byId[c.reply_to]);
          sorted.push(c);
        };
        arr.forEach(visit);
        return sorted;
      };

      setComments(sortHierarchical(data));
    } catch (err) {
      console.error('❌ שגיאה בטעינת תגובות:', err);
    }
  }

  const handleSubmit = async (e, replyId = null) => {
    e.preventDefault();
    if (!newComment.text.trim()) return;
    setSubmitting(true);
    try {
      await addCommentByThreadSlug({
        threadSlug,
        text: newComment.text,
        author: newComment.author?.trim() || 'אנונימי',
        reply_to: replyId,
      });
      setNewComment({ author: '', text: '' });
      setReplyTo(null);
      await loadComments();
    } catch (err) {
      console.error('❌ שגיאה בשליחת תגובה:', err);
    } finally {
      setSubmitting(false);
      setShowForm(false);
    }
  };

  return (
    <div>
      {/* 🔺 כותרת */}
      <div className="flex justify-between items-center mb-2 border-b-2 border-[#e60000] pb-2">
        <h3 className="text-2xl font-bold text-[#e60000] text-right">
          תגובות ({comments.length})
        </h3>

        {/* 🔘 כפתור פתיחת טופס ראשי */}
        {!threadLocked && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#e60000] hover:bg-[#ff3333] text-white px-4 py-2 rounded-md transition-all"
          >
            {showForm ? 'סגור טופס' : 'הוסף תגובה'}
          </button>
        )}
      </div>

      {/* 🧩 טופס ראשי נפתח בהחלקה */}
      <AnimatePresence>
        {showForm && !threadLocked && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            onSubmit={(e) => handleSubmit(e, null)}
            className="overflow-hidden mb-8 border-2 border-[#e60000] rounded-xl bg-[#fffafa] shadow-sm p-6 text-black"
          >
            <label className="block mb-2 text-sm text-right font-semibold">
              שם
            </label>
            <input
              type="text"
              value={newComment.author}
              onChange={(e) =>
                setNewComment({ ...newComment, author: e.target.value })
              }
              className="w-full bg-[#fad2d2] border-2 border-[#e60000] rounded px-3 py-2 mb-4 text-black focus:outline-none focus:border-[#ff3333]"
              placeholder="לדוגמה: יאיר ADV1290"
            />

            <label className="block mb-2 text-sm text-right font-semibold">
              תגובה
            </label>
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
          </motion.form>
        )}
      </AnimatePresence>

      {/* 💬 רשימת תגובות */}
      <div className="space-y-2">
        {comments.length === 0 ? (
          <p className="text-center text-gray-700">אין תגובות עדיין.</p>
        ) : (
          comments.map((c, i) => (
            <CommentItem
              key={c.id}
              comment={c}
              comments={comments}
              setReplyTo={setReplyTo}
              replyTo={replyTo}
              onSubmit={(payload) =>
                handleSubmit({ preventDefault: () => {} }, c.id, payload)
              }
              index={i}
            />
          ))
        )}
      </div>

      {/* 🔒 דיון נעול */}
      {threadLocked && (
        <p className="text-center text-[#e60000] mt-6 font-semibold">
          🔒 הדיון נעול. לא ניתן להוסיף תגובות.
        </p>
      )}
    </div>
  );
}
