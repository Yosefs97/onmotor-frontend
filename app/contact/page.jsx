'use client';
import React from 'react';
import PageContainer from '@/components/PageContainer';

export default function ContactPage() {
  return (
    <PageContainer
      title="צור קשר"
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'צור קשר', href: '/contact' }
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right max-w-2xl mx-auto mt-6">
        <a
          href="https://wa.me/972522304604"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded shadow text-center"
        >
          פנה אלינו בוואטסאפ
        </a>

        <a
          href="mailto:onmotormedia@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded shadow text-center"
        >
          שלח לנו מייל
        </a>
      </div>
    </PageContainer>
  );
}
