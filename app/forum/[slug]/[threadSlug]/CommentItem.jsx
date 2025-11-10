'use client';
import { useEffect, useRef } from 'react';

export default function CommentItem({ comment, comments, setReplyTo }) {
  const ref = useRef(null);

  // מזהה ייחודי לכל תגובה (לגלילה)
  useEffect(() => {
    if (ref.current) {
      ref.current.id = `comment-${comment.id}`;
    }
  }, [comment.id]);

  // מציאת שם המגיב שאליו מגיבים
  const repliedTo = comment.reply_to
    ? comments.find((c) => c.id === comment.reply_to)
    : null;

  const handleScrollToReplied = () => {
    if (!repliedTo) return;
    const el = document.getElementById(`comment-${repliedTo.id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // תאריך תקין
  const dateString = comment.date
    ? new Date(comment.date).toLocaleString('he-IL')
    : comment.createdAt
    ? new Date(comment.createdAt).toLocaleString('he-IL')
    : '—';

  // תוכן התגובה – שדה text או content
  const commentText = comment.text || comment.content || '';

  return (
    <div
      ref={ref}
      className="border-2 border-[#e60000] bg-white rounded-xl shadow-md p-4 scroll-mt-24"
    >
      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold text-[#e60000]">{comment.author || 'אנונימי'}</p>
        <p className="text-xs text-gray-600">{dateString}</p>
      </div>

      {/* תגובה למישהו */}
      {repliedTo && (
        <p className="text-xs text-gray-600 mb-2">
          בתגובה ל־{' '}
          <button
            onClick={handleScrollToReplied}
            className="text-[#e60000] font-semibold hover:underline"
          >
            {repliedTo.author || 'אנונימי'}
          </button>
        </p>
      )}

      {/* תוכן אמיתי */}
      <p className="whitespace-pre-line leading-relaxed text-black mb-3">
        {commentText.trim() ? commentText : '— אין תוכן —'}
      </p>

      <button
        onClick={() => setReplyTo(comment.id)}
        className="text-sm text-[#e60000] hover:underline"
      >
        השב
      </button>
    </div>
  );
}
