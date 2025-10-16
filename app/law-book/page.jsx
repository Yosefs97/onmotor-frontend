// /app/law-book/page.jsx
'use client';
import React from 'react';
import PageContainer from '@/components/PageContainer';

export default function LawBookPage() {
  return (
    <PageContainer title="ספר החוקים">
      <div className="w-full h-[250vh] border border-gray-300 rounded-md overflow-hidden">
        <iframe
          src="https://ask.ralbad.org.il/224"
          title="ספר החוקים - רלב״ד"
          className="w-full h-full"
          style={{ border: 'none' }}
          allowFullScreen
        ></iframe>
      </div>
    </PageContainer>
  );
}
