//components\CommentsSection.jsx
'use client';
import React from 'react';
import FacebookComments from './FacebookComments';

export default function CommentsSection({ articleUrl }) {
  return (
    <div className="w-full mt-12" dir="rtl">
      <h3 className="text-xl font-bold border-red-600 border-t-2 pb-2">
        תגובות הגולשים
      </h3>

      {/* ✅ מציג רק תגובות מפייסבוק */}
     {/* <FacebookComments url={articleUrl} />*/}
    </div>
  );
}
