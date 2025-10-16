//// app\blog\page.jsx
'use client';
import React from 'react';
import PageContainer from '@/components/PageContainer';
import CategoryPage from '@/components/CategoryPage';

export default function BlogPage() {
  return (
    <PageContainer
      title="בלוג"
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'בלוג', href: '/blog' }
      ]}
    >
      <CategoryPage categoryKey="blog" />
    </PageContainer>
  );
}
