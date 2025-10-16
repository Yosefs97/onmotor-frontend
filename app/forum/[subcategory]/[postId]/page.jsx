//app\forum\[subcategory]\[postId]\page.jsx
'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import { useAuthModal } from '@/contexts/AuthModalContext';
import {
  fetchThreadById,
  fetchComments,
  addComment,
} from '@/lib/forumApi';

export default function ForumPostPage({ params }) {
  const { subcategory, postId } = params;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const { openAuthModal } = useAuthModal();

  // טען פוסט + תגובות + משתמש
  useEffect(() => {
    const load = async () => {
      try {
        const thread = await fetchThreadById(postId);
        if (!thread || thread.category_id !== subcategory) return setPost(null);
        setPost(thread);

        const commentsList = await fetchComments(postId);
        setComments(commentsList);
      } catch (err) {
        console.error('שגיאה בטעינת הפוסט או התגובות:', err.message);
        setPost(null);
      }
    };

    load();

    const user = JSON.parse(localStorage.getItem('onmotor-user'));
    if (user?.email) setUserEmail(user.email);
  }, [postId, subcategory]);

  if (post === null) return notFound();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const newEntry = await addComment({
        threadId: postId,
        text: newComment,
        author: userEmail || 'אנונימי',
      });
      setComments((prev) => [...prev, newEntry]);
      setNewComment('');
    } catch (err) {
      alert('אירעה שגיאה בשליחת התגובה: ' + err.message);
    }
  };

  return (
    <PageContainer
      title={post.title}
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'פורום', href: '/forum' },
        { label: getHebrewSubcategory(post.category_id), href: `/forum/${post.category_id}` },
        { label: post.title },
      ]}
    >
      <div className="prose max-w-none text-right" dir="rtl">
        <p className="text-sm text-gray-500 mb-2">
          נכתב על ידי <strong>{post.author}</strong> בתאריך {new Date(post.date).toLocaleDateString('he-IL')}
        </p>

        <p className="text-lg leading-relaxed">{post.content}</p>

        <hr className="my-8" />

        <h3 className="text-xl font-bold mb-2">תגובות ({comments.length})</h3>

        {comments.length > 0 ? (
          <ul className="mt-4 space-y-4">
            {comments.map((comment, index) => (
              <li key={comment.id || index} className="border rounded p-4 bg-gray-50">
                <p className="text-sm text-gray-600 mb-1">
                  <strong>{comment.author}</strong> ({new Date(comment.date).toLocaleDateString('he-IL')})
                </p>
                <p>{comment.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">אין עדיין תגובות לדיון הזה.</p>
        )}

        <hr className="my-8" />

        {userEmail ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <textarea
              className="w-full p-3 border rounded resize-none"
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="כתוב תגובה כאן..."
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
            >
              שלח תגובה
            </button>
          </form>
        ) : (
          <div className="text-center mt-8 p-6 bg-red-50 border border-red-300 rounded">
            <p className="text-red-700 mb-4">כדי לכתוב תגובה יש להתחבר</p>
            <button
              onClick={openAuthModal}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
            >
              התחבר עכשיו
            </button>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function getHebrewSubcategory(key) {
  const map = {
    tech: 'פורום טכני',
    rides: 'טיולים ורכיבות',
    sale: 'קנייה ומכירה',
  };
  return map[key] || key;
}
