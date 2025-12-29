// app/laws/ask-question/page.jsx
export const revalidate = 180;

import React from 'react';
import PageContainer from '@/components/PageContainer';

export const metadata = {
  title: 'שאל את הרלב״ד | OnMotor Media',
  description: 'שאל את מומחי הרלב"ד ישירות דרך האתר.',
};

export default function AskQuestionPage() {
  return (
    <PageContainer
      title="שאל את הרלב״ד"
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'חוקים', href: '/laws' },
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
          loading="lazy"
        ></iframe>
      </div>
    </PageContainer>
  );
}