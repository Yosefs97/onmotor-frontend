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
      {loading ? (
        <p>טוען קטגוריות...</p>
      ) : (
        <ForumCategoryList categories={categories} />
      )}
    </PageContainer>
  );
}
