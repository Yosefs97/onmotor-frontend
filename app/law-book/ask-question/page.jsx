// app/law-book/ask-question/page.jsx
export const revalidate = 180; // ✅ ISR

import React from 'react';
import PageContainer from '@/components/PageContainer';

export const metadata = {
  title: 'שאל את הרלב״ד | OnMotor Media',
  description: 'יש לך שאלה בנושאי תעבורה? שאל את מומחי הרלב"ד ישירות דרך האתר.',
};

export default function AskQuestionPage() {
  return (
    <PageContainer
      title="שאל את הרלב״ד"
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'רלב״ד', href: '/law-book' },
        { label: 'שאל שאלה' },
      ]}
    >
      <div className="w-full h-[85vh] border border-gray-300 rounded-md overflow-hidden">
        <iframe
          src="https://ask.ralbad.org.il/"
          title="שאל את הרלב״ד"
          className="w-full h-full"
          style={{ border: 'none' }}
          allowFullScreen
          loading="lazy" // ✅ שיפור ביצועים
        ></iframe>
      </div>
    </PageContainer>
  );
}