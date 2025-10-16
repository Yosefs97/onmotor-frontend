'use client';
import React, { useState, useEffect } from 'react';
import useIsMobile from '@/hooks/useIsMobile';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function NewsletterBox({ mode = 'inline' }) {
  const isMobile = useIsMobile();
  const [hydrated, setHydrated] = useState(false);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated || (isMobile && mode === 'side' && !isOpen)) {
    return (
      <div dir="rtl" className="text-center py-0">
        <button
          onClick={() => setIsOpen(true)}
          className="text-sm bg-white text-black rounded shadow hover:bg-gray-300 transition"
        >
          הרשמה לניוזלטר <FaChevronDown className="inline" />
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="text-center w-full max-w-xs mx-auto relative">
      {isMobile && mode === 'side' && (
        <button
          onClick={() => setIsOpen(false)}
          className="text-sm bg-white text-black px-3 py-3  shadow hover:bg-gray-200 transition"
        >
          סגור ניוזלטר <FaChevronUp className="inline" />
        </button>
      )}

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden mt-2 border border-red-400
          ${mode === 'inline' ? 'w-full max-w-full bg-white text-black' : ''}
          ${mode === 'modal' ? '' : mode === 'side' ? 'fixed top-0 left-0 bg-white z-50 w-full' : ''}
          border border-red-500 rounded-lg p-4 text-sm shadow-md h-full flex items-center justify-center`}
      >
        <form className="w-full mb-0">
          <label className="block mb-1 text-lg font-bold text-red-600">הרשמה לניוזלטר</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="onmotormedia@gmail.com"
            className="w-full px-1 py-1 border border-gray-300 rounded text-right text-sm"
          />

          <div className={`flex items-center mt-2 ${isMobile ? 'justify-end' : ''}`}>
            <input
              type="checkbox"
              id="agree"
              className="ml-2 accent-[#e60000]"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label htmlFor="agree" className="text-xs text-gray-700">
              אני מסכים ל{' '}
              <button
                type="button"
                className="text-blue-600 underline hover:text-blue-800"
                onClick={() => setShowTerms(true)}
              >
                תנאי השימוש של האתר
              </button>
            </label>
          </div>

          {/* תנאי השימוש נפתח מתחת */}
          {showTerms && (
            <div className="mt-2 border border-gray-300 rounded-lg p-3 bg-white text-sm text-right shadow-md relative">
              <button
                onClick={() => setShowTerms(false)}
                className="absolute top-1 left-2 text-gray-500 hover:text-black text-lg"
              >
                ✖
              </button>
              <h3 className="text-sm font-bold mb-2">תנאי השימוש</h3>
              <p className="text-sm leading-relaxed mb-4">
                שימוש באתר OnMotor Media כפוף להסכמה לתנאי השימוש. נא לא לפרסם תכנים פוגעניים, לא חוקיים או כאלו הפוגעים בזכויות יוצרים.
                המשתמש אחראי לתוכן שהוא מפרסם.
              </p>
              <button
                onClick={() => {
                  setAgreed(true);
                  setShowTerms(false);
                }}
                className="bg-[#e60000] text-white w-full py-1 rounded hover:bg-red-700"
              >
                אישור
              </button>
            </div>
          )}

          {/* כפתור וואטסאפ */}
          <a
            href={`https://wa.me/972522304604?text=הרשמה לניוזלטר: ${encodeURIComponent(email)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!agreed || !email) {
                e.preventDefault();
                alert('יש להזין מייל ולאשר תנאי שימוש');
              } else {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
              }
            }}
            className="block mt-2 bg-[#25D366] text-white px-3 py-1 rounded hover:bg-green-600 text-sm text-center"
          >
            הרשמה בוואטסאפ
          </a>

          {success && <p className="text-green-600 mt-1 text-xs">ההרשמה הצליחה!</p>}
        </form>
      </div>
    </div>
  );
}
