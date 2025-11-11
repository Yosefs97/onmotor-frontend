// components/CommentForm.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { linkifyText } from '@/utils/linkifyText'; // 👈 הוסף בתחילת הקובץ


function generateAvatar(name) {
  return name?.charAt(0).toUpperCase() || '?';
}

function timeAgo(date) {
  const d = new Date(date);
  const seconds = Math.floor((new Date() - d) / 1000);
  if (seconds < 60) return 'הרגע';
  const intervals = [
    { label: 'שנה', sec: 31536000 },
    { label: 'חודש', sec: 2592000 },
    { label: 'יום', sec: 86400 },
    { label: 'שעה', sec: 3600 },
    { label: 'דקה', sec: 60 },
  ];
  for (let i of intervals) {
    const count = Math.floor(seconds / i.sec);
    if (count > 0) return `לפני ${count} ${i.label}${count > 1 ? 'ים' : ''}`;
  }
}

export default function CommentForm({ articleId }) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [sortBy, setSortBy] = useState('new');
  const [loading, setLoading] = useState(false);

  // שליפת תגובות
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments/list?articleId=${articleId}`);
        const data = await res.json();
        if (res.ok) setComments(data.data || []);
      } catch (err) {
        console.error('שגיאה בטעינת תגובות:', err);
      }
    };
    if (articleId) fetchComments();
  }, [articleId]);

  // יצירת תגובה
  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment) return;

    setLoading(true);
    const res = await fetch('/api/comments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: comment, articleId }),
    });
    const data = await res.json();
    if (res.ok) {
      setComments([data.data, ...comments]);
      setComment('');
    } else {
      alert(data.error || 'נכשל לשלוח תגובה');
    }
    setLoading(false);
  };

  // לייק
  const likeComment = async (id) => {
    const res = await fetch('/api/comments/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (res.ok) {
      setComments((prev) => prev.map((c) => (c.id === id ? data : c)));
    }
  };

  // מחיקה
  const deleteComment = async (id) => {
    const res = await fetch('/api/comments/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // מיון
  const sorted = [...comments].sort((a, b) => {
    const aLikes = a.attributes?.likes || 0;
    const bLikes = b.attributes?.likes || 0;
    if (sortBy === 'likes') return bLikes - aLikes;
    return new Date(b.attributes?.createdAt) - new Date(a.attributes?.createdAt);
  });

  return (
    <div className="w-full text-right space-y-4 border-t-2 border-red-600 pt-1">
      <h3 className="text-xl font-semibold text-gray-700 mt-0">השאר תגובה</h3>

      <form onSubmit={submitComment} className="space-y-2">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-1/2 bg-white px-4 py-2 border rounded"
          rows={4}
          required
        />
        <button type="submit" disabled={loading} className="bg-red-600 text-white px-6 py-2 rounded">
          {loading ? 'שולח...' : 'שלח תגובה'}
        </button>
      </form>

      <div className="text-sm flex gap-4 items-center">
        <span>מיון:</span>
        <button
          onClick={() => setSortBy('new')}
          className={sortBy === 'new' ? 'text-red-600 font-bold' : 'text-gray-600'}
        >
          הכי חדשים
        </button>
        <button
          onClick={() => setSortBy('likes')}
          className={sortBy === 'likes' ? 'text-red-600 font-bold' : 'text-gray-600'}
        >
          הכי אהובים
        </button>
        <span className="ml-auto">סה"כ תגובות: {comments.length}</span>
      </div>

      <div className="space-y-6">
        {sorted.map((c) => {
          const authorName =
            c.attributes?.author?.data?.attributes?.username ||
            c.attributes?.author?.data?.attributes?.email ||
            'משתמש';

          return (
            <div key={c.id} className="border rounded bg-white p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex justify-center items-center font-bold ">
                    {generateAvatar(authorName)}
                  </div>
                  <div className="text-sm font-semibold text-gray-800 ">
                    {authorName}
                  </div>
                </div>
                <div className="text-xs text-gray-500">{timeAgo(c.attributes?.createdAt)}</div>
              </div>
              <p
                className="
                  mt-2
                  text-gray-700
                  text-sm
                  whitespace-pre-line
                  break-words
                  break-all
                  overflow-hidden
                "
                dangerouslySetInnerHTML={{
                  __html: linkifyText(c.attributes?.content),
                }}
              />
              <div className="mt-2 flex gap-4 text-sm text-gray-600">
                <button onClick={() => likeComment(c.id)}>❤️ {c.attributes?.likes || 0}</button>
                <button onClick={() => deleteComment(c.id)}>🗑️ מחק</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
