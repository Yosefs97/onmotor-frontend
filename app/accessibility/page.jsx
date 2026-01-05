// app/accessibility/page.jsx

import React from 'react';
import PageContainer from '@/components/PageContainer'; // הנחתי שזה קיים אצלך כמו ב-TermsOfService
import AccessibilityStatement from '@/components/AccessibilityStatement';

export const metadata = {
  title: 'הצהרת נגישות | OnMotor Media',
  description: 'הצהרת נגישות של אתר OnMotor Media והסדרי נגישות לבעלי מוגבלויות.',
  openGraph: {
    title: 'הצהרת נגישות | OnMotor Media',
    description: 'הסדרי הנגישות באתר OnMotor Media.',
    url: 'https://www.onmotormedia.com/accessibility',
    siteName: 'OnMotor Media',
    locale: 'he_IL',
    type: 'article',
    images: [
      {
        url: 'https://www.onmotormedia.com/full_Logo_v2.jpg',
        width: 1200,
        height: 630,
        alt: 'OnMotor Media - הצהרת נגישות',
      },
    ],
  },
};

export default function AccessibilityPage() {
  return (
    <PageContainer>
      <div dir="rtl" className="max-w-4xl mx-auto bg-white rounded-lg p-6 mt-6 shadow-md border-t-4 border-[#e60000]">
        <h1 className="text-3xl font-bold text-[#e60000] mb-6 text-center">
          הצהרת נגישות
        </h1>
        <AccessibilityStatement />
      </div>
    </PageContainer>
  );
}