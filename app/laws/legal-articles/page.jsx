// app/laws/legal-articles/page.jsx
export const revalidate = 180; 

import React from 'react';
import PageContainer from '@/components/PageContainer';
import CategoryPage from '@/components/CategoryPage'; 
import ServiceProvidersSection from '@/components/ServiceProvidersSection'; // 👈 1. ייבוא הרכיב החדש

export const metadata = {
  title: 'כתבות בנושא חוקיות | OnMotor Media',
  description: 'מאמרים, עדכונים וחדשות בנושאי חוק ומשפט לרוכבים.',
};

export default function LegalArticlesPage() {
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
      {/* רשימת הכתבות */}
      <CategoryPage 
        categoryKey={categoryKey} 
        subcategoryKey={subcategoryKey} 
      />

      {/* 👈 2. הוספת אזור נותני השירות כאן למטה */}
      <ServiceProvidersSection />
      
    </PageContainer>
  );
}