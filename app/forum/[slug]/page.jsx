// app/forum/[slug]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import { fetchThreadsByCategorySlug, addThread } from '@/lib/forumApi';

export default function ForumCategoryPage() {
  const { slug } = useParams();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newThread, setNewThread] = useState({ title: '', content: '' });
  const [author, setAuthor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchThreadsByCategorySlug(slug);
        setThreads(data);
      } catch (err) {
        console.error('שגיאה בטעינת דיונים:', err);
      } finally {
        setLoading(false);
      }
    };
    load();

    const user = JSON.parse(localStorage.getItem('onmotor-user'));
    if (user?.email) setAuthor(user.email.split('@')[0]);
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newThread.title.trim() || !newThread.content.trim()) {
      alert('נא למלא כותרת ותוכן');
      return;
    }
    setSubmitting(true);
    try {
      const added = await addThread({
        title: newThread.title,
        content: newThread.content,
        author: author || 'אנונימי',
        categorySlug: slug,
      });
      alert('✅ הדיון נוסף בהצלחה!');
      setThreads((prev) => [
        ...prev,
        {
          id: added.id,
          title: newThread.title,
          author,
          content: newThread.content,
          comments: [],
        },
      ]);
      setNewThread({ title: '', content: '' });
    } catch (err) {
      alert('❌ שגיאה ביצירת הדיון: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer
      title={`פורום - ${slug}`}
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'פורום', href: '/forum' },
      ]}
    >
      {loading ? (
        <p>טוען דיונים...</p>
      ) : threads.length === 0 ? (
        <p>אין דיונים בקטגוריה זו.</p>
      ) : (
        <ul className="space-y-6 mb-8">
          {threads.map((t) => (
            <li key={t.id} className="border p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t.title}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                נכתב על ידי <strong>{t.author}</strong>
              </p>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                {t.content}
              </p>
              {t.comments?.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <p className="text-sm text-gray-700 font-semibold mb-1">
                    תגובות ({t.comments.length})
                  </p>
                  <ul className="space-y-2">
                    {t.comments.map((c, i) => (
                      <li key={i} className="text-sm text-gray-700 border rounded p-2 bg-gray-50">
                        <strong>{c.author}:</strong> {c.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 🟢 טופס פתיחת דיון חדש */}
      <form
        onSubmit={handleSubmit}
        className="border p-6 rounded-xl bg-gray-50 shadow-inner"
      >
        <h3 className="text-xl font-semibold mb-4">פתח דיון חדש</h3>

        <label className="block mb-2 text-sm font-medium text-gray-700">
          כותרת
        </label>
        <input
          type="text"
          value={newThread.title}
          onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="לדוגמה: בעיה במערכת בלימה של GSX..."
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">
          תוכן
        </label>
        <textarea
          value={newThread.content}
          onChange={(e) =>
            setNewThread({ ...newThread, content: e.target.value })
          }
          className="w-full border rounded px-3 py-2 h-32 mb-4 resize-none"
          placeholder="כתוב כאן את תוכן הדיון..."
        />

        <button
          type="submit"
          disabled={submitting}
          className={`px-6 py-2 rounded text-white font-semibold ${
            submitting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {submitting ? 'שולח...' : 'פרסם דיון'}
        </button>
      </form>
    </PageContainer>
  );
}
