// components/NewsletterBox.jsx
'use client';
import React, { useState, useEffect } from 'react';
import useIsMobile from '@/hooks/useIsMobile';
import { FaChevronDown, FaChevronUp, FaWhatsapp } from 'react-icons/fa'; // הוספתי אייקון וואטסאפ
import PrivacyPolicy from '@/components/PrivacyPolicy';

export default function NewsletterBox({ mode = 'inline' }) {
  const isMobile = useIsMobile();
  const [hydrated, setHydrated] = useState(false);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [showTerms, setShowTerms] = useState(false);

  // ✅ הקישור לערוץ שלך
  const CHANNEL_LINK = "https://whatsapp.com/channel/0029Vb6Oh5xL2ATxMU7Xbz2M";

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated || (isMobile && mode === 'side' && !isOpen)) {
    return (
      <div dir="rtl" className="text-center py-0">
        <button
          onClick={() => setIsOpen(true)}
          className="text-sm bg-white text-black rounded shadow hover:bg-gray-300 transition px-3 py-1 flex items-center justify-center gap-2 mx-auto"
        >
          הרשמה לניוזלטר <FaChevronDown />
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="text-center w-full max-w-xs mx-auto relative">
      {isMobile && mode === 'side' && (
        <button
          onClick={() => setIsOpen(false)}
          className="text-sm bg-white text-black px-3 py-3 shadow hover:bg-gray-200 transition mb-2 rounded"
        >
          סגור ניוזלטר <FaChevronUp className="inline" />
        </button>
      )}

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden mt-2 border border-red-400
          ${mode === 'inline' ? 'w-full max-w-full bg-white text-black' : ''}
          ${mode === 'modal' ? '' : mode === 'side' ? 'fixed top-0 left-0 bg-white z-50 w-full' : ''}
          border border-red-500 rounded-lg p-4 text-sm shadow-md h-full flex flex-col items-center justify-center`}
      >
        <form className="w-full mb-0">
          <label className="block mb-1 text-lg font-bold text-red-600">הרשמה לניוזלטר</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="onmotormedia@gmail.com"
            className="w-full px-2 py-1 border border-gray-300 rounded text-right text-sm"
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
                מדיניות פרטיות המידע
              </button>
            </label>
          </div>

          {/* מדיניות פרטיות נפתחת */}
          {showTerms && (
            <PrivacyPolicy
              onClose={() => setShowTerms(false)}
              onAgree={() => {
                setAgreed(true);
                setShowTerms(false);
              }}
            />
          )}

          {/* --- כפתור 1: הרשמה עם מייל --- */}
          <a
            href={`https://wa.me/972522304604?text=הרשמה לניוזלטר: ${encodeURIComponent(email)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!agreed || !email) {
                e.preventDefault();
                alert('יש להזין מייל ולאשר את מדיניות הפרטיות');
              } else {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
              }
            }}
            className="flex items-center justify-center gap-2 mt-3 bg-[#25D366] text-white px-3 py-2 rounded hover:bg-green-600 text-sm w-full font-bold shadow-sm"
          >
            <FaWhatsapp size={18} />
            הרשמה במייל (אישי)
          </a>
          
          {success && <p className="text-green-600 mt-1 text-xs font-bold">הבקשה נשלחה לחלון הצ'אט!</p>}

          {/* --- קו מפריד --- */}
          <div className="flex items-center my-3 w-full">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink-0 mx-2 text-gray-400 text-xs">או</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* --- כפתור 2: ערוץ העדכונים --- */}
          <a
            href={CHANNEL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-gray-800 text-white px-3 py-2 rounded hover:bg-gray-900 text-sm w-full font-bold shadow-sm"
          >
            <FaWhatsapp size={18} />
            הצטרפות לערוץ העדכונים
          </a>
          <p className="text-[11px] text-gray-500 mt-1">עדכונים שוטפים בוואטסאפ ללא הרשמה</p>

        </form>
      </div>
    </div>
  );
}