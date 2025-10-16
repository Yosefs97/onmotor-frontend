//components\MainGridContentMobile.jsx
'use client';
import React from 'react';

import articles from '@/data/articles';
export default function MainGridContentMobile() {
  const categories = [...new Set(articles.map(article => article.category))];

  return (
    <div className="w-full px-0 md:px-0 overflow-x-hidden" dir="rtl">
      
    </div>
  );
}