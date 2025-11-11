// app/forum/[slug]/[threadSlug]/CommentItem.jsx
'use client';
import { useEffect, useRef, useState } from 'react';

export default function CommentItem({
  comment,
  comments,
  setReplyTo,
  replyTo,
  onSubmit,
  index = 0,
}) {
  const ref = useRef(null);
  const [replyText, setReplyText] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');

  useEffect(() => {
    if (ref.current) ref.current.id = `comment-${comment.id}`;
  }, [comment.id]);

  const repliedTo = comment.reply_to
    ? comments.find((c) => c.id === comment.reply_to)
    : null;

  const dateString = new Date(
    comment.date || comment.createdAt || Date.now()
  ).toLocaleString('he-IL');

  // 💗 צבע רקע מתחלף לפי אינדקס
  const bgColor = index % 2 === 0 ? 'bg-[#fff5f5]' : 'bg-[#ffffff]';

  // ✴️ גלילה אל המגיב
  const handleScrollToReplied = () => {
    if (!repliedTo) return;
    const el = document.getElementById(`comment-${repliedTo.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-[#e60000]');
      setTimeout(() => el.classList.remove('ring-2', 'ring-[#e60000]'), 1200);
    }
  };

  const handleLocalSubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await onSubmit({
      text: replyText,
      author: replyAuthor || 'אנונימי',
      reply_to: comment.id,
    });
    setReplyText('');
    setReplyAuthor('');
  };

  return (
    <div
      ref={ref}
      className={`${bgColor} border-b border-[#e60000]/20 w-full py-2 px- text-right transition-colors duration-200`}
    >
      {/* כותרת */}
      <div className="flex justify-between items-center mb-1">
        <p className="font-semibold text-[#e60000]">{comment.author || 'אנונימי'}</p>
        <p className="text-xs text-gray-700">{dateString}</p>
      </div>

      {/* אם זו תגובה למישהו */}
      {repliedTo && (
        <button
          onClick={handleScrollToReplied}
          className="text-xs text-gray-700 mb-2 hover:text-[#e60000] transition"
        >
          בתגובה ל־{' '}
          <span className="text-[#e60000] font-semibold hover:underline">
            {repliedTo.author}
          </span>
        </button>
      )}

      {/* תוכן התגובה */}
      <p className="whitespace-pre-line leading-relaxed text-black mb-3 break-words">
        {comment.text?.trim() || '— אין תוכן —'}
      </p>

      {/* פעולות */}
      <div className="flex gap-4 items-center mb-2">
        <button
          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
          className="text-sm text-[#e60000] hover:underline"
        >
          השב
        </button>
      </div>

      {/* טופס תגובה פנימי */}
      {replyTo === comment.id && (
        <form
          onSubmit={handleLocalSubmit}
          className="mt-3 bg-[#fffafa] border border-[#e60000]/20 rounded-lg p-3 space-y-2"
        >
          <input
            type="text"
            placeholder="שם"
            value={replyAuthor}
            onChange={(e) => setReplyAuthor(e.target.value)}
            className="w-full border border-[#e60000]/20 text-[#e60000] rounded px-2 py-1 text-sm"
          />
          <textarea
            placeholder="תגובה..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full border border-[#e60000]/20 rounded px-2 py-1 text-[#e60000] text-sm h-20 resize-none"
          />
          <button
            type="submit"
            className="bg-[#e60000] hover:bg-[#ff3333] text-white px-3 py-1 rounded text-sm"
          >
            פרסם
          </button>
        </form>
      )}
    </div>
  );
}
