// app/laws/book/page.jsx
export const revalidate = 180; 

import React from 'react';
import PageContainer from '@/components/PageContainer';

export const metadata = {
  title: 'ספר החוקים - רלב״ד | OnMotor Media',
  description: 'ספר החוקים ותקנות התעבורה של הרלב"ד.',
};

export default function LawBookPage() {
  return (
    <PageContainer
      title="ספר החוקים - רלב״ד"
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'חוקים', href: '/laws' }, // נתיב מעודכן
        { label: 'ספר החוקים' },
      ]}
    >
      <div className="w-full h-[250vh] border border-gray-300 rounded-md overflow-hidden">
        <iframe
          src="https://ask.ralbad.org.il/224"
          title="ספר החוקים - רלב״ד"
          className="w-full h-full"
          style={{ border: 'none' }}
          allowFullScreen
          loading="lazy"
        ></iframe>
      </div>
    </PageContainer>
  );
}