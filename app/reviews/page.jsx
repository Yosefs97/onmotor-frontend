'use client';
import React from 'react';
import PageContainer from '@/components/PageContainer';
import CategoryPage from '@/components/CategoryPage';

export default function ReviewsPage() {
  return (
    <PageContainer
      title="סקירות"
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'סקירות', href: '/reviews' }
      ]}
    >
      <CategoryPage categoryKey="reviews" />
    </PageContainer>
  );
}
