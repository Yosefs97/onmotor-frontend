// File: app/admin/articles/edit/[id]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/auth';
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL; // ✅

export default function EditArticlePage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    category: '',
  });
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !user.jwt) {
      router.push('/login'); // הפנה להתחברות אם לא מחובר
    } else {
      setAuthChecked(true); // רק אם יש הרשאות, המשך לטעינת הנתונים
    }
  }, []);

  useEffect(() => {
    if (!authChecked) return;

    async function fetchArticle() {
      try {
        const user = getCurrentUser();
        const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/articles/${id}`, {
          headers: {
            Authorization: `Bearer ${user.jwt}`,
          },
        });
        if (!res.ok) throw new Error(`שגיאה בטעינת כתבה (${res.status})`);
        const json = await res.json();
        const data = json.data.attributes;

        setForm({
          title: data.title || '',
          slug: data.slug || '',
          description: data.description || '',
          category: data.category || '',
        });
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [authChecked, id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = getCurrentUser();
    if (!user || !user.jwt) {
      alert('אין הרשאות');
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.jwt}`,
        },
        body: JSON.stringify({ data: form }),
      });

      if (res.ok) {
        alert('הכתבה עודכנה בהצלחה');
        router.push('/admin/articles');
      } else {
        throw new Error(`שגיאה בעת שמירה: ${res.status}`);
      }
    } catch (err) {
      console.error('Error updating article:', err);
      alert('שגיאה בעת שמירה');
    }
  };

  if (!authChecked || loading) return <p>טוען...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">עריכת כתבה</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" value={form.title} onChange={handleChange} placeholder="כותרת" className="border p-2 w-full" />
        <input name="slug" value={form.slug} onChange={handleChange} placeholder="slug" className="border p-2 w-full" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="תיאור" className="border p-2 w-full" />
        <input name="category" value={form.category} onChange={handleChange} placeholder="קטגוריה" className="border p-2 w-full" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">שמור</button>
      </form>
    </div>
  );
}
