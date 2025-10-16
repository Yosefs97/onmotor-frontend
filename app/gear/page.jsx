'use client';
import React from 'react';
import PageContainer from '@/components/PageContainer';
import CategoryPage from '@/components/CategoryPage';

export default function GearPage() {
  return (
    <PageContainer
      title="ציוד"
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'ציוד', href: '/gear' }
      ]}
    >
      <CategoryPage categoryKey="gear" />
    </PageContainer>
  );
}
