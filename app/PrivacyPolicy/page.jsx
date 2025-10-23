// app/PrivacyPolicy/page.jsx
'use client';

export const metadata = {
  title: 'מדיניות פרטיות | OnMotor Media',
  description: 'מדיניות פרטיות האתר OnMotor Media – הגנה על פרטיות המשתמשים בהתאם לחוק.',
  openGraph: {
    title: 'מדיניות פרטיות | OnMotor Media',
    description: 'כיצד אנו מגנים על פרטיות המשתמשים באתר OnMotor Media.',
    url: 'https://www.onmotormedia.com/PrivacyPolicy',
    siteName: 'OnMotor Media',
    locale: 'he_IL',
    type: 'article',
    images: [
      {
        url: 'https://www.onmotormedia.com/full_Logo.jpg',
        width: 1200,
        height: 630,
        alt: 'OnMotor Media - מדיניות פרטיות',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'מדיניות פרטיות | OnMotor Media',
    description: 'מדיניות הפרטיות של אתר OnMotor Media – איך אנו מגנים על פרטיותך.',
    images: ['https://www.onmotormedia.com/full_Logo.jpg'],
  },
};

import React from 'react';
import PageContainer from '@/components/PageContainer';
import PrivacyPolicy from '@/components/PrivacyPolicy';

export default function PrivacyPolicyPage() {
  return (
    <PageContainer>
      <div dir="rtl" className="max-w-3xl mx-auto bg-white rounded-lg p-6 mt-6 shadow">
        <h1 className="text-2xl font-bold text-[#e60000] mb-4 text-center">
          מדיניות פרטיות
        </h1>
        <PrivacyPolicy />
      </div>
    </PageContainer>
  );
}
