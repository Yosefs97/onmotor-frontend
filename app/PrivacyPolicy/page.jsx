// app/PrivacyPolicy/page.jsx
'use client';
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
