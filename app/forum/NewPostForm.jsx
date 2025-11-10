//app\forum\NewPostForm.jsx
'use client';

import { useState } from 'react';
import { addThread } from '@/lib/forumApi';

export default function NewPostForm({ categorySlug, onCreated, onClose }) {
  const [form, setForm] = useState({ title: '', content: '', author: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setStatus({ type: 'error', text: 'נא למלא כותרת ותוכן' });
      return;
    }

    setLoading(true);
    try {
      await addThread({
        title: form.title,
        content: form.content,
        author: form.author || 'אנונימי',
        categorySlug,
        lastActivity: new Date().toISOString(),
      });
      setForm({ title: '', content: '', author: '' });
      setStatus({ type: 'success', text: '✅ הדיון נוסף בהצלחה!' });
      if (onCreated) onCreated();
      setTimeout(() => {
        setStatus(null);
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', text: '❌ שגיאה ביצירת דיון' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-right">
      <label className="block mb-2 text-sm font-semibold">שם</label>
      <input
        type="text"
        value={form.author}
        onChange={(e) => setForm({ ...form, author: e.target.value })}
        className="w-full bg-[#fad2d2] border-2 border-[#e60000] rounded px-3 py-2 mb-4 text-black focus:outline-none focus:border-[#ff3333]"
        placeholder="לדוגמה:יאיר ADV1290"
      />

      <label className="block mb-2 text-sm font-semibold">כותרת</label>
      <input
        type="text"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="w-full bg-[#fad2d2] border-2 border-[#e60000] rounded px-3 py-2 mb-4 text-black focus:outline-none focus:border-[#ff3333]"
        placeholder="כותרת הדיון..."
      />

      <label className="block mb-2 text-sm font-semibold">תוכן</label>
      <textarea
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        className="w-full bg-[#fad2d2] border-2 border-[#e60000] rounded px-3 py-2 h-32 mb-4 text-black resize-none focus:outline-none focus:border-[#ff3333]"
        placeholder="כתוב כאן את תוכן הדיון..."
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded font-semibold text-white transition ${
          loading ? 'bg-gray-500' : 'bg-[#e60000] hover:bg-[#ff3333]'
        }`}
      >
        {loading ? 'שולח...' : 'פרסם דיון'}
      </button>

      {status && (
        <p
          className={`mt-3 text-center font-medium ${
            status.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {status.text}
        </p>
      )}
    </form>
  );
}
