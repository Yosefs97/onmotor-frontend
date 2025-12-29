// app/laws/legal-articles/page.jsx
export const revalidate = 180; // רענון כל 3 דקות (כמו בחדשות)

import React from 'react';
import PageContainer from '@/components/PageContainer';
import CategoryPage from '@/components/CategoryPage'; // ✅ שימוש ברכיב הקיים

export const metadata = {
  title: 'כתבות בנושא חוקיות | OnMotor Media',
  description: 'מאמרים, עדכונים וחדשות בנושאי חוק ומשפט לרוכבים.',
};

export default function LegalArticlesPage() {
  // אנחנו מגדירים ידנית את הקטגוריות כפי שהן ב-Strapi
  const categoryKey = 'laws';
  const subcategoryKey = 'legal-articles';

  return (
    <PageContainer
      title="כתבות בנושא חוקיות"
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'חוקים', href: '/laws' },
        { label: 'כתבות בנושא חוקיות' },
      ]}
    >
      {/* 👇 כאן הקסם: שימוש באותו רכיב בדיוק כמו בחדשות */}
      <CategoryPage 
        categoryKey={categoryKey} 
        subcategoryKey={subcategoryKey} 
      />
    </PageContainer>
  );
}