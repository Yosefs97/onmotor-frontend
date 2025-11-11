// app/forum/[slug]/[threadSlug]/CommentsSection.jsx
'use client';
import { useEffect, useState } from 'react';
import { fetchCommentsByThreadSlug, addCommentByThreadSlug } from '@/lib/forumApi';
import CommentItem from './CommentItem';

export default function CommentsSection({ threadSlug, threadLocked }) {
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    loadComments();
  }, [threadSlug]);

  async function loadComments() {
    try {
      const data = await fetchCommentsByThreadSlug(threadSlug);
      setComments(data);
    } catch (err) {
      console.error('❌ שגיאה בטעינת תגובות:', err);
    }
  }

  // 🟢 משותפת לכל CommentItem
  const handleSubmit = async ({ text, author, reply_to }) => {
    await addCommentByThreadSlug({
      threadSlug,
      text,
      author,
      reply_to,
    });
    await loadComments();
    setReplyTo(null);
  };

  const rootComments = comments.filter((c) => !c.reply_to);

  return (
    <div>
      <h3 className="text-2xl font-bold text-[#e60000] mb-6 text-right border-b-2 border-[#e60000] pb-2">
        תגובות ({comments.length})
      </h3>

      {threadLocked ? (
        <p className="text-center text-[#e60000] mt-6 font-semibold">
          🔒 הדיון נעול. לא ניתן להוסיף תגובות.
        </p>
      ) : (
        <div>
          {rootComments.length === 0 ? (
            <p className="text-center text-gray-700">אין תגובות עדיין.</p>
          ) : (
            rootComments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                comments={comments}
                setReplyTo={setReplyTo}
                replyTo={replyTo}
                onSubmit={handleSubmit}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
