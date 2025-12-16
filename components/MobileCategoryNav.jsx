'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function MobileCategoryNav({ menuItems }) {
  console.log('MobileCategoryNav Rendered. Items:', menuItems); // 👈 לוג לבדיקה

  // 👇👇👇 מבחן הצבע: קופסה אדומה שתופיע תמיד במובייל 👇👇👇
  return (
    <div className="w-full md:hidden mb-4 border-4 border-red-600 bg-yellow-100 p-4">
      <h3 className="text-red-600 font-bold text-lg text-center">
        בדיקת רכיב!
      </h3>
      <p className="text-center text-gray-800 font-bold">
        האם יש פריטים? {menuItems && menuItems.length > 0 ? '✅ כן' : '❌ לא'}
      </p>
      <p className="text-center text-sm">
        מספר פריטים: {menuItems?.length || 0}
      </p>

      {/* --- שאר הקוד המקורי --- */}
      {menuItems && menuItems.length > 0 && (
         <div className="mt-4 p-2 bg-white">
            כאן אמורים להיות הכפתורים...
         </div>
      )}
    </div>
  );
}