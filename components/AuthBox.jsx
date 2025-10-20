// components/AuthBox.jsx
// components/AuthBox.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import useIsMobile from '@/hooks/useIsMobile';
import { FaChevronUp } from 'react-icons/fa';
import { loginUser, logoutUser, getCurrentUser } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import { useAuthModal } from '@/contexts/AuthModalProvider';

export default function AuthBox({ mode = 'inline', boxRef }) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { user, setUser } = useAuthModal();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState('');
  const [isLoadingReset, setIsLoadingReset] = useState(false);

  const [showRegister, setShowRegister] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [registerStatus, setRegisterStatus] = useState('');
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changeStatus, setChangeStatus] = useState('');
  const [isLoadingChangePassword, setIsLoadingChangePassword] = useState(false);

  const resetRef = useRef(null);
  const registerRef = useRef(null);
  const changePassRef = useRef(null);

  useEffect(() => {
    (async () => {
      const stored = await getCurrentUser();
      setUser(stored);
    })();
    const lastEmail = localStorage.getItem('lastEmail');
    if (lastEmail) setEmail(lastEmail);
  }, [setUser]);

  useEffect(() => {
    if (isMobile && isOpen && boxRef?.current) {
      boxRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isOpen, isMobile, boxRef, user]);

  useEffect(() => {
    if (showReset && resetRef.current) {
      resetRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else if (showRegister && registerRef.current) {
      registerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else if (showChangePassword && changePassRef.current) {
      changePassRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [showReset, showRegister, showChangePassword]);

  const handleLogin = async () => {
    setIsLoadingLogin(true);
    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'

      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      loginUser(data.user);
      setUser(data.user);
      if (rememberMe) localStorage.setItem('lastEmail', email);
      setLoginSuccess(true);
      setLoginError('');
    } catch (err) {
      setLoginError(err.message);
      setLoginSuccess(false);
    } finally {
      setIsLoadingLogin(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem('lastEmail');
    setUser(null);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את החשבון?')) return;
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' });
      if (!res.ok) throw new Error('Error deleting account');
      await logoutUser();
      setUser(null);
      alert('החשבון נמחק בהצלחה');
    } catch {
      alert('אירעה שגיאה במחיקת החשבון');
    }
  };

  const handleForgotPassword = async () => {
    setIsLoadingReset(true);
    setResetStatus('');
    const res = await fetch('/api/user/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail }),
      credentials: 'include'
    });
    setResetStatus(res.ok ? 'נשלחה סיסמה חדשה לאימייל שלך' : 'אירעה שגיאה');
    setIsLoadingReset(false);
  };

  const handleRegister = async () => {
    if (registerPassword !== registerConfirm) {
      setRegisterStatus('הסיסמאות לא תואמות');
      return;
    }
    setIsLoadingRegister(true);
    const res = await fetch('/api/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: registerEmail, password: registerPassword }),
      credentials: 'include'
    });
    const data = await res.json();
    setRegisterStatus(res.ok ? 'נרשמת בהצלחה!' : data.error || 'שגיאה בהרשמה');
    setIsLoadingRegister(false);
  };

  const handleChangePassword = async () => {
    setIsLoadingChangePassword(true);
    const res = await fetch('/api/user/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
      credentials: 'include'
    });
    setChangeStatus(res.ok ? 'הסיסמה עודכנה בהצלחה' : 'שגיאה בעדכון הסיסמה');
    setIsLoadingChangePassword(false);
  };



  return (
    <div dir="rtl" className="text-center" ref={boxRef}>
      {isMobile && mode === 'side' && (
        <button
          onClick={() => setIsOpen(false)}
          className="text-sm bg-white text-black px-2 py-2 rounded shadow hover:bg-gray-200 transition"
        >
          סגור <FaChevronUp className="inline" />
        </button>
      )}

      <div className="transition-all duration-500 ease-in-out overflow-hidden mt-2 max-w-md px-0 bg-white text-black border border-gray-300 rounded p-1 text-sm shadow-md">
        <h3 className="font-semibold text-black mb-6">
          {user ? 'ניהול חשבון' : 'התחברות'}
        </h3>

        {user ? (
          <>
            <p className="mb-4">שלום, {user.email}</p>
            <div className="flex flex-col gap-2 mb-4 items-center">
              <button
                onClick={handleLogout}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                התנתק
              </button>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                מחיקת חשבון
              </button>
            </div>
            <div className="text-xs text-center space-x-2 flex justify-center">
              <button
                onClick={() => {
                  setShowChangePassword(true);
                  setShowReset(false);
                  setShowRegister(false);
                }}
                className="text-blue-600 underline"
              >
                שנה סיסמא
              </button>
              <span>|</span>
              <button
                onClick={() => {
                  setShowReset(true);
                  setShowChangePassword(false);
                  setShowRegister(false);
                }}
                className="text-blue-600 underline"
              >
                שכחתי סיסמא
              </button>
            </div>
          </>
        ) : (
          <>
            <input
              type="email"
              placeholder="אימייל"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-[90%] px-2 py-1 mb-2 border border-gray-300 rounded text-right text-sm"
            />
            <input
              type="password"
              placeholder="סיסמא"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-[90%] px-2 py-1 mb-2 border border-gray-300 rounded text-right text-sm"
            />
            <div className="flex items-center justify-start mb-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="ml-2"
              />
              <label htmlFor="rememberMe" className="text-sm text-black">השאר מחובר</label>
            </div>
            <button
              onClick={handleLogin}
              className="bg-[#e60000] text-white px-3 py-1 rounded hover:bg-red-700 text-sm w-full flex items-center justify-center"
            >
              {isLoadingLogin
                ? <span className="loader mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                : 'התחבר'}
            </button>
            {loginError && <p className="text-red-600 mt-1 text-xs">{loginError}</p>}
            {loginSuccess && <p className="text-green-600 mt-1 text-xs">התחברת בהצלחה!</p>}

            <div className="mt-3 text-xs text-center space-x-1 flex flex-wrap justify-center">
              <button
                onClick={() => { setShowRegister(true); setShowReset(false); setShowChangePassword(false); }}
                className="text-blue-600 underline"
              >צור חשבון</button>
              <span>|</span>
              <button
                onClick={() => { setShowReset(true); setShowRegister(false); setShowChangePassword(false); }}
                className="text-blue-600 underline"
              >שכחתי סיסמה</button>
              <span>|</span>
              <button
                onClick={() => { setShowChangePassword(true); setShowReset(false); setShowRegister(false); }}
                className="text-blue-600 underline"
              >שנה סיסמה</button>
            </div>
          </>
        )}

        


        {showReset && (
          <div ref={resetRef} className="mt-4 bg-gray-100 p-3 rounded text-right text-sm relative">
            <button onClick={() => setShowReset(false)} className="absolute top-2 left-2 text-gray-500 hover:text-black">✖</button>
            <h4 className="font-semibold mb-2 pr-6">שכחתי סיסמה</h4>
            <input
              type="email"
              placeholder="אימייל לאיפוס"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              className="w-full px-2 py-1 mb-2 border border-gray-300 rounded"
            />
            <button onClick={handleForgotPassword} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
              {isLoadingReset ? 'שולח...' : 'שלח סיסמה חדשה'}
            </button>
            {resetStatus && <p className="text-green-600 mt-2 text-xs">{resetStatus}</p>}
          </div>
        )}

        {showRegister && (
          <div ref={registerRef} className="mt-4 bg-gray-100 p-3 rounded text-right text-sm relative">
            <button onClick={() => setShowRegister(false)} className="absolute top-2 left-2 text-gray-500 hover:text-black">✖</button>
            <h4 className="font-semibold mb-2 pr-6">צור חשבון</h4>
            <input
              type="email"
              placeholder="אימייל"
              value={registerEmail}
              onChange={e => setRegisterEmail(e.target.value)}
              className="w-full px-2 py-1 mb-2 border border-gray-300 rounded"
            />
            <input
              type="password"
              placeholder="סיסמה"
              value={registerPassword}
              onChange={e => setRegisterPassword(e.target.value)}
              className="w-full px-2 py-1 mb-2 border border-gray-300 rounded"
            />
            <input
              type="password"
              placeholder="אימות סיסמה"
              value={registerConfirm}
              onChange={e => setRegisterConfirm(e.target.value)}
              className="w-full px-2 py-1 mb-2 border border-gray-300 rounded"
            />
            <button onClick={handleRegister} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
              {isLoadingRegister ? 'נרשם...' : 'הרשמה'}
            </button>
            {registerStatus && <p className="text-green-600 mt-2 text-xs">{registerStatus}</p>}
          </div>
        )}

        {showChangePassword && (
          <div ref={changePassRef} className="mt-4 bg-gray-100 p-3 rounded text-right text-sm relative">
            <button onClick={() => setShowChangePassword(false)} className="absolute top-2 left-2 text-gray-500 hover:text-black">✖</button>
            <h4 className="font-semibold mb-2 pr-6">שנה סיסמה</h4>
            <input
              type="password"
              placeholder="סיסמה נוכחית"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-2 py-1 mb-2 border border-gray-300 rounded"
            />
            <input
              type="password"
              placeholder="סיסמה חדשה"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-2 py-1 mb-2 border border-gray-300 rounded"
            />
            <button onClick={handleChangePassword} className="bg-yellow-600 text-white px-3 py-1 rounded text-sm">
              {isLoadingChangePassword ? 'מעדכן...' : 'עדכן סיסמה'}
            </button>
            {changeStatus && <p className="text-green-600 mt-2 text-xs">{changeStatus}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
