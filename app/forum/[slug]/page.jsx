// app/forum/[slug]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import { fetchThreadsByCategorySlug, addThread } from '@/lib/forumApi';
import { labelMap } from '@/utils/labelMap';

export default function ForumCategoryPage() {
  const params = useParams();
  const slug = params?.slug ? decodeURIComponent(params.slug) : '';
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newThread, setNewThread] = useState({ title: '', content: '', author: '' });
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const categoryLabel = labelMap?.[slug] || decodeURIComponent(slug) || 'פורום';


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
        categorySlug: decodeURIComponent(slug),
      });
      setNewThread({ title: '', content: '', author: '' });
      await loadThreads();
      setStatusMessage({ text: '✅ הדיון נוסף בהצלחה!', type: 'success' });
      setTimeout(() => setStatusMessage(null), 2500);
    } catch (err) {
      setStatusMessage({ text: '❌ שגיאה ביצירת דיון', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  

  return (
    <PageContainer
      title={`פורום ${categoryLabel}`}
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'פורום', href: '/forum' },
        { label: categoryLabel, href: `/forum/${slug}` },
      ]}
    >
      <div className="bg-[#111111] text-gray-200 min-h-screen py-8 px-2 sm:px-4">
        {loading ? (
          <p className="text-center text-gray-400">טוען דיונים...</p>
        ) : threads.length === 0 ? (
          <p className="text-center text-gray-400">אין דיונים בקטגוריה זו.</p>
        ) : (
          <ul className="divide-y divide-gray-800 border border-gray-700 rounded-lg overflow-hidden bg-[#1a1a1a] shadow-md">
            {threads.map((t) => (
              <li
                key={t.id}
                className="hover:bg-[#2a0a0a] transition cursor-pointer group"
              >
                <Link href={`/forum/${slug}/${t.slug}`} className="block p-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex items-center gap-2 mb-2 sm:mb-0">
                      {t.pinned && (
                        <span className="text-[#e60000] font-bold text-xs bg-[#300] px-2 py-1 rounded">
                          📌 נעוץ
                        </span>
                      )}
                      {t.locked && (
                        <span className="text-[#ff3333] font-bold text-xs bg-[#400] px-2 py-1 rounded">
                          🔒 נעול
                        </span>
                      )}
                      <h3 className="text-lg font-semibold text-white group-hover:text-[#e60000] transition">
                        {t.title}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-400 text-left sm:text-right">
                      <p>
                        נכתב על ידי{' '}
                        <span className="text-gray-300">{t.author}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        צפיות: {t.views || 0} •{' '}
                        {t.lastActivity
                          ? `עדכון אחרון: ${new Date(
                              t.lastActivity
                            ).toLocaleDateString('he-IL')}`
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mt-2 line-clamp-2 whitespace-pre-line">
                    {t.content.length > 300
                      ? t.content.slice(0, 300) + '...'
                      : t.content}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* 🔻 טופס פתיחת דיון חדש */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 border border-gray-700 rounded-lg bg-[#1a1a1a] shadow-md p-6 text-gray-200"
        >
          <h3 className="text-xl font-semibold text-white mb-4 text-right border-b border-gray-700 pb-2">
            פתח דיון חדש
          </h3>

          <label className="block mb-2 text-sm font-medium text-gray-400 text-right">
            שם
          </label>
          <input
            type="text"
            value={newThread.author}
            onChange={(e) =>
              setNewThread({ ...newThread, author: e.target.value })
            }
            className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 mb-4 text-gray-100 focus:outline-none focus:border-[#e60000]"
            placeholder="לדוגמה: רוכב מ-TMAX..."
          />

          <label className="block mb-2 text-sm font-medium text-gray-400 text-right">
            כותרת
          </label>
          <input
            type="text"
            value={newThread.title}
            onChange={(e) =>
              setNewThread({ ...newThread, title: e.target.value })
            }
            className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 mb-4 text-gray-100 focus:outline-none focus:border-[#e60000]"
            placeholder="לדוגמה: בעיה במערכת בלימה של GSX..."
          />

          <label className="block mb-2 text-sm font-medium text-gray-400 text-right">
            תוכן
          </label>
          <textarea
            value={newThread.content}
            onChange={(e) =>
              setNewThread({ ...newThread, content: e.target.value })
            }
            className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 h-32 mb-4 text-gray-100 resize-none focus:outline-none focus:border-[#e60000]"
            placeholder="כתוב כאן את תוכן הדיון..."
          />

          <button
            type="submit"
            disabled={submitting}
            className={`w-full px-6 py-2 rounded font-semibold text-white transition ${
              submitting
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-[#e60000] hover:bg-[#ff3333]'
            }`}
          >
            {submitting ? 'שולח...' : 'פרסם דיון'}
          </button>

          {statusMessage && (
            <p
              className={`mt-4 text-center font-medium ${
                statusMessage.type === 'success'
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}
            >
              {statusMessage.text}
            </p>
          )}
        </form>
      </div>
    </PageContainer>
  );
}
