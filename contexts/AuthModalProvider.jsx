'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AuthBox from '@/components/AuthBox';
import { getCurrentUser } from '@/utils/auth'; // ✅ נוספה האזנה למצב התחברות

const AuthModalContext = createContext();

export function useAuthModal() {
  return useContext(AuthModalContext);
}

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('inline');
  const [title, setTitle] = useState('התחברות / הרשמה');
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState(null);
  const modalRef = useRef(null);
  const router = useRouter();

  // ✅ פתיחת מודאל
  const openModal = (newMode = 'inline', newTitle = 'התחברות / הרשמה') => {
    setIsOpen(false);
    setTimeout(() => {
      setMode(newMode);
      setTitle(newTitle);
      setIsOpen(true);
    }, 0);
  };

  // ✅ סגירת מודאל
  const closeModal = () => setIsOpen(false);

  // ✅ סגירת מודאל בעת קליק מחוץ או גלילה
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    const handleScroll = () => {
      closeModal();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, { once: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  // ✅ האזנה ל־Event מהמערכת (Login/Logout)
  useEffect(() => {
    const handleAuthChange = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setHydrated(true);
      console.log('🔄 Auth state updated:', currentUser ? 'מחובר' : 'מנותק');
    };

    // טוען את המשתמש מיד בהפעלה
    handleAuthChange();

    // מאזין לאירוע שינוי התחברות
    window.addEventListener('auth', handleAuthChange);

    return () => {
      window.removeEventListener('auth', handleAuthChange);
    };
  }, []);

  return (
    <AuthModalContext.Provider value={{ isOpen, openModal, closeModal, mode, title, user, setUser, hydrated }}>
      {children}

      {/* Inline mode */}
      {mode === 'inline' && isOpen && (
        <div className="fixed top-[80px] left-4 z-50 w-[360px] max-h-[1000px]">
          <div className="border rounded-lg shadow-md p-4 bg-white">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-black">✖</button>
            </div>
            <AuthBox mode="inline" boxRef={modalRef} />
          </div>
        </div>
      )}

      {/* Modal mode */}
      {mode === 'modal' && isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded shadow-lg max-w-sm w-full p-6 relative">
            <button onClick={closeModal} className="absolute top-2 left-2 text-gray-600 hover:text-black">✖</button>
            <h2 className="text-lg font-semibold mb-4">{title}</h2>
            <AuthBox mode="modal" boxRef={modalRef} />
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  );
}
