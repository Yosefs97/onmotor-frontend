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
    <>
      {/* כפתור קבוע בצד ימין למעלה */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-24 right-8 z-40 px-6 py-2 bg-[#e60000] text-white font-semibold rounded-lg shadow-lg hover:bg-[#ff3333] transition"
      >
        פתח דיון חדש
      </button>

      {/* חלון מודאל */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-xl shadow-2xl w-[90%] max-w-lg p-6 relative border-2 border-[#e60000]">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 left-3 text-[#e60000] hover:text-black text-xl"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold text-[#e60000] mb-4 text-right border-b-2 border-[#e60000] pb-2">
              פתח דיון חדש
            </h3>

            <form onSubmit={handleSubmit}>
              <label className="block mb-2 text-sm text-right font-medium">שם</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full bg-[#fad2d2] border-2 border-[#e60000] rounded px-3 py-2 mb-4 text-black focus:outline-none focus:border-[#ff3333]"
                placeholder="לדוגמה: רוכב מהצפון..."
              />

              <label className="block mb-2 text-sm text-right font-medium">כותרת</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-[#fad2d2] border-2 border-[#e60000] rounded px-3 py-2 mb-4 text-black focus:outline-none focus:border-[#ff3333]"
                placeholder="כותרת הדיון..."
              />

              <label className="block mb-2 text-sm text-right font-medium">תוכן</label>
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
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-[#e60000] hover:bg-[#ff3333]'
                }`}
              >
                {loading ? 'שולח...' : 'פרסם דיון'}
              </button>
            </form>

            {status && (
              <p
                className={`mt-4 text-center font-medium ${
                  status.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {status.text}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
