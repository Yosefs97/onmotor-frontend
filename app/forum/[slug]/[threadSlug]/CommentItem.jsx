// app/forum/[slug]/[threadSlug]/CommentItem.jsx
'use client';
import { useEffect, useRef, useState } from 'react';

export default function CommentItem({ comment, comments, setReplyTo, replyTo, onSubmit }) {
  const ref = useRef(null);
  const [replyText, setReplyText] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');

  useEffect(() => {
    if (ref.current) ref.current.id = `comment-${comment.id}`;
  }, [comment.id]);

  const childComments = comments.filter((c) => c.reply_to === comment.id);
  const repliedTo = comment.reply_to ? comments.find((c) => c.id === comment.reply_to) : null;

  const dateString = new Date(comment.date || comment.createdAt || Date.now()).toLocaleString('he-IL');

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
    <div ref={ref} className="pl-4 border-r-2 border-[#e60000]/30 mt-4 text-right">
      <div className="pb-4 border-b border-[#e60000]/40">
        <div className="flex justify-between items-center mb-1">
          <p className="font-semibold text-[#e60000]">{comment.author || 'אנונימי'}</p>
          <p className="text-xs text-gray-600">{dateString}</p>
        </div>

        {repliedTo && (
          <p className="text-xs text-gray-600 mb-2">
            בתגובה ל־ <span className="text-[#e60000] font-semibold">{repliedTo.author}</span>
          </p>
        )}

        <p className="whitespace-pre-line leading-relaxed text-black mb-2">
          {comment.text?.trim() || '— אין תוכן —'}
        </p>

        {/* 🔘 כפתור השב פותח טופס מקומי */}
        <button
          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
          className="text-sm text-[#e60000] hover:underline"
        >
          השב
        </button>

        {/* ✏️ טופס תגובה פנימי */}
        {replyTo === comment.id && (
          <form onSubmit={handleLocalSubmit} className="mt-3 bg-[#fff5f5] border border-[#e60000]/30 rounded-lg p-3 space-y-2">
            <input
              type="text"
              placeholder="שם"
              value={replyAuthor}
              onChange={(e) => setReplyAuthor(e.target.value)}
              className="w-full border border-[#e60000]/30 rounded px-2 py-1 text-sm"
            />
            <textarea
              placeholder="תגובה..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full border border-[#e60000]/30 rounded px-2 py-1 text-sm h-20 resize-none"
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

      {/* תגובות משנה */}
      {childComments.length > 0 && (
        <div className="pl-4 mt-3 border-r-2 border-[#e60000]/20">
          {childComments.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              comments={comments}
              setReplyTo={setReplyTo}
              replyTo={replyTo}
              onSubmit={onSubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
