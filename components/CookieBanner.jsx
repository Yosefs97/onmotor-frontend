// components/CookieBanner.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // בדיקה ב-LocalStorage אם כבר אושר בעבר
    const consent = localStorage.getItem('cookieConsent');
    
    // אם אין אישור, נציג את החלון אחרי שנייה
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConfirm = () => {
    if (!isChecked) return;
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  if (!isMounted) return null;
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-white border-t border-gray-200 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] animate-slide-up">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* טקסט */}
        <div className="text-right text-sm text-gray-800 flex-1">
          <p className="font-medium mb-1">אנחנו משתמשים בקוקיז 🍪</p>
          <p className="text-gray-600 leading-relaxed">
            באתר זה נעשה שימוש בקבצי Cookies כדי לשפר את החוויה שלך, לנתח סטטיסטיקות ולהתאים תכנים.
            לחיצה על אישור מהווה הסכמה לשימוש זה.
            {/* אופציונלי: קישור למדיניות פרטיות */}
            {/* <Link href="/privacy-policy" className="text-blue-600 hover:underline mr-1">למדיניות הפרטיות</Link> */}
          </p>
        </div>

        {/* אזור הפעולה */}
        <div className="flex flex-col items-center md:items-end gap-3 min-w-fit">
          
          {/* ה-Checkbox שביקשת */}
          <label className="flex items-center gap-2 cursor-pointer select-none bg-gray-50 px-3 py-2 rounded-md border border-gray-100 hover:bg-gray-100 transition-colors">
            <input 
              type="checkbox" 
              className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            <span className="text-sm font-medium text-gray-700">
              אני מאשר/ת את תנאי השימוש
            </span>
          </label>

          {/* כפתור האישור */}
          <button
            onClick={handleConfirm}
            disabled={!isChecked}
            className={`w-full md:w-auto px-6 py-2 rounded font-bold text-sm transition-all duration-200 
              ${isChecked 
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-md transform active:scale-95' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            אישור והמשך
          </button>
        </div>
      </div>
    </div>
  );
}