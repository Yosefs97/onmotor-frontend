//components/AuthStatusButton.jsx
'use client';
import React from 'react';
import { useAuthModal } from '@/contexts/AuthModalProvider';

export default function AuthStatusButton() {
  const { user, openModal, hydrated } = useAuthModal();

  if (!hydrated) {
    // שלב טעינה - שמירת רווח במקום הכפתור
    return <div className="w-[80px] h-[32px]" />;
  }

  if (user?.email) {
    // כפתור ירוק במצב מחובר
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          openModal('inline', 'התנתקות');
        }}
        className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold whitespace-nowrap"
      >
        {user.email.charAt(0).toUpperCase()} מחובר
      </button>
    );
  }

  // כפתור אדום במצב לא מחובר
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        openModal('inline', 'התחברות / הרשמה');
      }}
      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-bold whitespace-nowrap"
    >
      התחבר
    </button>
  );
}
