// app/forum/NewPostButton.jsx
'use client';

import { useState } from 'react';
import { addThread } from '@/lib/forumApi';

export default function NewPostButton({ categorySlug, onCreated }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', author: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      alert('נא למלא כותרת ותוכן');
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
      setOpen(false);
      if (onCreated) onCreated();
      setStatus({ type: 'success', text: '✅ הדיון נוסף בהצלחה!' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', text: '❌ שגיאה ביצירת דיון' });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(null), 2500);
    }
  };

  return (
    <div className="relative">
      {/* כפתור פתיחה */}
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2 bg-[#faafaf] text-[#1c1c1c] font-semibold rounded-md hover:bg-[#ffbaba] transition shadow-md"
      >
        פתח דיון חדש
      </button>

      {/* חלון מודאל */}
      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#222] text-[#ada6a6] rounded-xl shadow-xl w-[90%] max-w-lg p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 left-3 text-[#faafaf] hover:text-white text-xl"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold text-[#faafaf] mb-4 text-right border-b border-[#faafaf]/40 pb-2">
              פתח דיון חדש
            </h3>

            <form onSubmit={handleSubmit}>
              <label className="block mb-2 text-sm text-right">שם</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full bg-[#2a2a2a] border border-[#444] rounded px-3 py-2 mb-4 text-[#ada6a6] focus:outline-none focus:border-[#faafaf]"
                placeholder="לדוגמה: רוכב מהצפון..."
              />

              <label className="block mb-2 text-sm text-right">כותרת</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-[#2a2a2a] border border-[#444] rounded px-3 py-2 mb-4 text-[#ada6a6] focus:outline-none focus:border-[#faafaf]"
                placeholder="כותרת הדיון..."
              />

              <label className="block mb-2 text-sm text-right">תוכן</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full bg-[#2a2a2a] border border-[#444] rounded px-3 py-2 h-32 mb-4 text-[#ada6a6] resize-none focus:outline-none focus:border-[#faafaf]"
                placeholder="כתוב כאן את תוכן הדיון..."
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded font-semibold text-white transition ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-[#faafaf] text-[#1c1c1c] hover:bg-[#ffbaba]'
                }`}
              >
                {loading ? 'שולח...' : 'פרסם דיון'}
              </button>
            </form>

            {status && (
              <p
                className={`mt-4 text-center font-medium ${
                  status.type === 'success'
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {status.text}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
