'use client';
import React from 'react';

export default function TermsModal({ onClose, onAgree }) {
  return (
    <div className="fixed top-1/2 left-1/2 z-[9999] -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-md bg-white border border-gray-300 rounded-xl shadow-lg text-sm">
      {/* כותרת ראשית */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 border-b border-gray-200">
        <h2 className="text-base font-semibold text-right">תנאי השימוש</h2>
        <button onClick={onClose} className="text-gray-600 hover:text-black text-xl">✖</button>
      </div>

      {/* תוכן */}
      <div className="p-4 text-right leading-relaxed">
        <p className="mb-4">
          שימוש באתר OnMotor Media כפוף להסכמה לתנאי השימוש. נא לא לפרסם תכנים פוגעניים, לא חוקיים או כאלו הפוגעים בזכויות יוצרים.
          המשתמש אחראי לתוכן שהוא מפרסם.
        </p>
        <button
          onClick={() => {
            onAgree();
            onClose();
          }}
          className="bg-[#e60000] text-white w-full py-2 rounded hover:bg-red-700"
        >
          אישור
        </button>
      </div>
    </div>
  );
}
