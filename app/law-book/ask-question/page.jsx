// /app/law-book/ask-question/page.jsx
'use client';
import React from 'react';
import PageContainer from '@/components/PageContainer';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function AskQuestionPage() {
  const breadcrumbs = [
    { label: 'דף הבית', href: '/' },
    { label: 'רלב״ד', href: '/law-book' },
    { label: 'שאל שאלה את הרלב"ד' },
  ];

  return (
    <PageContainer title="שאל רלב״ד" breadcrumbs={breadcrumbs}>
      <div className="w-full h-[85vh] border border-gray-300 rounded-md overflow-hidden">
        <iframe
          src="https://ask.ralbad.org.il/"
          title="שאל את הרלב״ד"
          className="w-full h-full"
          style={{ border: 'none' }}
          allowFullScreen
        ></iframe>
      </div>
    </PageContainer>
  );
}
