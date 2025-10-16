// File: app/admin/articles/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/articles?populate=*`
        );
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        // Strapi wraps data in json.data[].attributes
        const data = json.data.map(item => ({
          id: item.id,
          ...item.attributes,
        }));
        setArticles(data);
      } catch (err) {
        console.error('Error fetching articles from Strapi:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  if (loading) return <p>טוען כתבות...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">ניהול כתבות</h1>
      <div className="mb-4">
        <Link href="/admin/articles/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          + הוסף כתבה חדשה
        </Link>
      </div>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Slug</th>
            <th className="border px-2 py-1">כותרת</th>
            <th className="border px-2 py-1">תאריך</th>
            <th className="border px-2 py-1">שעה</th>
            <th className="border px-2 py-1">קטגוריה</th>
            <th className="border px-2 py-1">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
            <tr key={a.id} className="hover:bg-gray-100">
              <td className="border px-2 py-1">{a.id}</td>
              <td className="border px-2 py-1">{a.slug}</td>
              <td className="border px-2 py-1">{a.title}</td>
              <td className="border px-2 py-1">{a.date ?? '-'}</td>
              <td className="border px-2 py-1">{a.time ?? '-'}</td>
              <td className="border px-2 py-1">{a.category}</td>
              <td className="border px-2 py-1">
                <Link href={`/admin/articles/edit/${a.id}`} className="text-blue-500 hover:underline">
                  ערוך
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
