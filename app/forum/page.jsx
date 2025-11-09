// app/forum/page.jsx
'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/PageContainer';
import ForumCategoryList from '@/components/ForumCategoryList';
import { fetchForumCategories } from '@/lib/forumApi';

export default function ForumPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchForumCategories();
        setCategories(data);
      } catch (error) {
        console.error('שגיאה בטעינת קטגוריות:', error.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <PageContainer
      title="פורום OnMotor"
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'פורום', href: '/forum' },
      ]}
    >
      <div className="bg-[#111111] text-gray-200 min-h-screen py-8 px-2 sm:px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-semibold text-white mb-8 text-center border-b border-gray-700 pb-3">
            פורום הרוכבים של OnMotor
          </h1>

          {loading ? (
            <p className="text-center text-gray-400">טוען קטגוריות...</p>
          ) : categories.length === 0 ? (
            <p className="text-center text-gray-500">לא נמצאו קטגוריות פורום.</p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-md hover:shadow-lg hover:border-[#e60000] transition cursor-pointer"
                >
                  <a href={`/forum/${cat.slug}`} className="block p-6 h-full">
                    <h2 className="text-xl font-semibold text-white mb-2 hover:text-[#e60000] transition">
                      {cat.name}
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {cat.description || 'דיונים וידע בתחום זה'}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
