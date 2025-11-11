// app/forum/[slug]/[threadSlug]/CommentItem.jsx
'use client';
import { useEffect, useRef, useState } from 'react';

export default function CommentItem({
  comment,
  comments,
  setReplyTo,
  replyTo,
  onSubmit,
  depth = 0,
}) {
  const ref = useRef(null);
  const [replyText, setReplyText] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (ref.current) ref.current.id = `comment-${comment.id}`;
  }, [comment.id]);

  const childComments = comments.filter((c) => c.reply_to === comment.id);
  const repliedTo = comment.reply_to ? comments.find((c) => c.id === comment.reply_to) : null;
  const dateString = new Date(comment.date || comment.createdAt || Date.now()).toLocaleString('he-IL');

  // 💗 גוון מתחלף (לבן / ורוד בהיר)
  const bgColor = depth % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#fff3f3]';

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
      className={`${bgColor} border-b border-[#e60000]/25 w-full py-4 px-6 text-right`}
    >
      {/* כותרת */}
      <div className="flex justify-between items-center mb-1">
        <p className="font-semibold text-[#e60000]">{comment.author || 'אנונימי'}</p>
        <p className="text-xs text-gray-600">{dateString}</p>
      </div>

      {/* אם זו תגובה למישהו */}
      {repliedTo && (
        <p className="text-xs text-gray-600 mb-2">
          בתגובה ל־{' '}
          <span className="text-[#e60000] font-semibold">{repliedTo.author}</span>
        </p>
      )}

      {/* תוכן התגובה */}
      <p className="whitespace-pre-line leading-relaxed text-black mb-3">
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
        {childComments.length > 0 && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-sm text-gray-600 hover:text-[#e60000]"
          >
            {collapsed ? `הצג ${childComments.length} תגובות` : 'הסתר תגובות'}
          </button>
        )}
      </div>

      {/* טופס תגובה פנימי */}
      {replyTo === comment.id && (
        <form
          onSubmit={handleLocalSubmit}
          className="mt-3 bg-[#fff0f0] border border-[#e60000]/20 rounded-lg p-3 space-y-2"
        >
          <input
            type="text"
            placeholder="שם"
            value={replyAuthor}
            onChange={(e) => setReplyAuthor(e.target.value)}
            className="w-full border border-[#e60000]/20 rounded px-2 py-1 text-sm"
          />
          <textarea
            placeholder="תגובה..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full border border-[#e60000]/20 rounded px-2 py-1 text-sm h-20 resize-none"
          />
          <button
            type="submit"
            className="bg-[#e60000] hover:bg-[#ff3333] text-white px-3 py-1 rounded text-sm"
          >
            פרסם
          </button>
        </form>
      )}

      {/* תגובות משנה */}
      {!collapsed && childComments.length > 0 && (
        <div className="mt-0">
          {childComments.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              comments={comments}
              setReplyTo={setReplyTo}
              replyTo={replyTo}
              onSubmit={onSubmit}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
