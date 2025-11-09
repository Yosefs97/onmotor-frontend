// app/forum/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import { fetchForumCategories } from '@/lib/forumApi';
import { FaMotorcycle } from 'react-icons/fa';

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
      <div className="bg-[#111111] text-gray-200 min-h-screen py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* 🏍️ כותרת עליונה */}
          <div className="flex items-center justify-center mb-10">
            <FaMotorcycle className="text-[#e60000] text-3xl mr-2" />
            <h1 className="text-3xl font-bold text-white border-b-2 border-[#e60000] pb-2">
              פורום הרוכבים של OnMotor
            </h1>
          </div>

          {/* 🌀 טעינה / תוכן */}
          {loading ? (
            <p className="text-center text-gray-400 animate-pulse">
              טוען קטגוריות...
            </p>
          ) : categories.length === 0 ? (
            <p className="text-center text-gray-500">לא נמצאו קטגוריות פורום.</p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="group bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-md hover:shadow-xl hover:border-[#e60000] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <Link href={`/forum/${cat.slug}`} className="block p-6 h-full">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xl font-semibold text-white group-hover:text-[#e60000] transition-colors">
                        {cat.name}
                      </h2>
                      <span className="text-[#e60000] opacity-0 group-hover:opacity-100 transition">
                        ➜
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm leading-relaxed min-h-[48px]">
                      {cat.description || 'דיונים, ידע וטיפים מהשטח'}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
