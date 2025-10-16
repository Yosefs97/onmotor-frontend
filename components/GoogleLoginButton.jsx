//app\api\comments\GoogleLoginButton.jsx
'use client';

import { useEffect } from 'react';

export default function GoogleLoginButton() {
  useEffect(() => {
    /* ניתן לטעון כאן ספריית Google Identity אם נדרש */
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'; // ניתוב ל־API שלך שמטפל בהתחברות עם גוגל
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="bg-white border border-gray-300 hover:bg-gray-100 text-black px-4 py-2 rounded w-full mb-3 flex items-center justify-center text-sm"
    >
      <img src="/google-icon.svg" alt="Google" className="w-4 h-4 mr-2" />
      התחברות עם Google
    </button>
  );
}
