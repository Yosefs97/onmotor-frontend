// app/forum/[slug]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import { fetchThreadsByCategorySlug, addThread } from '@/lib/forumApi';
import { labelMap } from '@/utils/labelMap';

export default function ForumCategoryPage() {
  const { slug } = useParams();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newThread, setNewThread] = useState({ title: '', content: '', author: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadThreads = async () => {
    try {
      const data = await fetchThreadsByCategorySlug(slug);
      setThreads(data);
    } catch (err) {
      console.error('שגיאה בטעינת דיונים:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newThread.title.trim() || !newThread.content.trim()) {
      alert('נא למלא כותרת ותוכן');
      return;
    }

    setSubmitting(true);
    try {
      await addThread({
        title: newThread.title,
        content: newThread.content,
        author: newThread.author || 'אנונימי',
        categorySlug: slug,
      });
      alert('✅ הדיון נוסף בהצלחה!');
      setNewThread({ title: '', content: '', author: '' });
      await loadThreads();
    } catch (err) {
      alert('❌ שגיאה ביצירת דיון: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const categoryLabel = labelMap[slug] || slug;

  return (
    <PageContainer
      title={`פורום ${categoryLabel}`}
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'פורום', href: '/forum' },
        { label: categoryLabel, href: `/forum/${slug}` },
      ]}
    >
      <div className="text-gray-900">
        {loading ? (
          <p className="text-gray-900">טוען דיונים...</p>
        ) : threads.length === 0 ? (
          <p className="text-gray-900">אין דיונים בקטגוריה זו.</p>
        ) : (
          <ul className="space-y-6 mb-8">
            {threads.map((t) => (
              <li
                key={t.id}
                className="border text-gray-900 p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition"
              >
                <Link href={`/forum/${slug}/${t.slug}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-600">
                    {t.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 mb-3">
                  נכתב על ידי <strong className="text-gray-900">{t.author}</strong>
                </p>
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {t.content.length > 300
                    ? t.content.slice(0, 300) + '...'
                    : t.content}
                </p>
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={handleSubmit}
          className="border p-6 rounded-xl bg-gray-50 shadow-inner text-gray-900"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-900 text-right">
            פתח דיון חדש
          </h3>

          <label className="block mb-2 text-sm font-medium text-gray-700 text-right">
            שם
          </label>
          <input
            type="text"
            value={newThread.author}
            onChange={(e) =>
              setNewThread({ ...newThread, author: e.target.value })
            }
            className="w-full border rounded px-3 py-2 mb-4 text-gray-900"
            placeholder="לדוגמה: יוסי מ-CRF..."
          />

          <label className="block mb-2 text-sm font-medium text-gray-700 text-right">
            כותרת
          </label>
          <input
            type="text"
            value={newThread.title}
            onChange={(e) =>
              setNewThread({ ...newThread, title: e.target.value })
            }
            className="w-full border rounded px-3 py-2 mb-4 text-gray-900"
            placeholder="לדוגמה: בעיה במערכת בלימה של GSX..."
          />

          <label className="block mb-2 text-sm font-medium text-gray-700 text-right">
            תוכן
          </label>
          <textarea
            value={newThread.content}
            onChange={(e) =>
              setNewThread({ ...newThread, content: e.target.value })
            }
            className="w-full border rounded px-3 py-2 h-32 mb-4 resize-none text-gray-900"
            placeholder="כתוב כאן את תוכן הדיון..."
          />

          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2 rounded text-white font-semibold w-full ${
              submitting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {submitting ? 'שולח...' : 'פרסם דיון'}
          </button>
        </form>
      </div>
    </PageContainer>
  );
}
