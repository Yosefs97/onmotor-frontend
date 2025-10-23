// app/TermsOfService/page.jsx
export const metadata = {
  title: 'תנאי שימוש | OnMotor Media',
  description: 'תנאי השימוש באתר OnMotor Media – כללי שימוש, זכויות יוצרים ואחריות.',
  openGraph: {
    title: 'תנאי שימוש | OnMotor Media',
    description: 'הכללים לשימוש באתר OnMotor Media והגנה על זכויות המשתמשים.',
    url: 'https://www.onmotormedia.com/TermsOfService',
    siteName: 'OnMotor Media',
    locale: 'he_IL',
    type: 'article',
    images: [
      {
        url: 'https://www.onmotormedia.com/full_Logo.jpg',
        width: 1200,
        height: 630,
        alt: 'OnMotor Media - תנאי שימוש',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'תנאי שימוש | OnMotor Media',
    description: 'מסמך תנאי השימוש באתר OnMotor Media – מידע למשתמשים וגולשים.',
    images: ['https://www.onmotormedia.com/full_Logo.jpg'],
  },
};

import React from 'react';
import PageContainer from '@/components/PageContainer';
import TermsOfService from '@/components/TermsOfService';

export default function TermsOfServicePage() {
  return (
    <PageContainer>
      <div dir="rtl" className="max-w-3xl mx-auto bg-white rounded-lg p-6 mt-6 shadow">
        <h1 className="text-2xl font-bold text-[#e60000] mb-4 text-center">
          תנאי השימוש
        </h1>
        <TermsOfService />
      </div>
    </PageContainer>
  );
}
