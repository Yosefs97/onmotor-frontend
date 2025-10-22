// components/AuthBox.jsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FaChevronUp } from 'react-icons/fa';
import useIsMobile from '@/hooks/useIsMobile';
import { useRouter } from 'next/navigation';
import { useAuthModal } from '@/contexts/AuthModalProvider';
import { loginUser, logoutUser, getCurrentUser } from '@/utils/auth';
import PasswordField from '@/components/PasswordField';

export default function AuthBox({ mode = 'inline', boxRef }) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { user, setUser } = useAuthModal();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const [activeForm, setActiveForm] = useState(null); // "register" | "reset" | "change" | null
  const refs = { register: useRef(null), reset: useRef(null), change: useRef(null) };

  const [formData, setFormData] = useState({
    registerEmail: '',
    registerPassword: '',
    registerConfirm: '',
    resetEmail: '',
    currentPassword: '',
    newPassword: ''
  });

  // טעינת משתמש קיים
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    const lastEmail = localStorage.getItem('lastEmail');
    if (lastEmail) setEmail(lastEmail);
  }, [setUser]);

  // סגירת טפסים אם המשתמש התחבר
  useEffect(() => {
    if (user) setActiveForm(null);
  }, [user]);

  // גלילה במובייל
  useEffect(() => {
    if (isMobile && boxRef?.current) {
      boxRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isMobile, user, boxRef]);

  const handleLogin = async () => {
    setStatusMsg('');
    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loginUser({ email: data.user.email, jwt: data.jwt });
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (rememberMe) localStorage.setItem('lastEmail', email);
      setStatusMsg('התחברת בהצלחה!');
      setLoginError('');
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    localStorage.clear();
    setUser(null);
    setEmail('');
    setPassword('');
  };

  const handleAction = async (type) => {
    setStatusMsg('');
    const body = {};
    let url = '';
    if (type === 'register') {
      const { registerEmail, registerPassword, registerConfirm } = formData;
      if (registerPassword !== registerConfirm)
        return setStatusMsg('הסיסמאות אינן תואמות');
      body.email = registerEmail;
      body.password = registerPassword;
      url = '/api/user/register';
    } else if (type === 'reset') {
      body.email = formData.resetEmail;
      url = '/api/user/forgot-password';
    } else if (type === 'change') {
      body.currentPassword = formData.currentPassword;
      body.newPassword = formData.newPassword;
      url = '/api/user/change-password';
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatusMsg(
        type === 'register'
          ? 'נרשמת בהצלחה!'
          : type === 'reset'
          ? 'נשלחה סיסמה חדשה לאימייל שלך'
          : 'הסיסמה עודכנה בהצלחה'
      );
    } catch (err) {
      setStatusMsg(err.message);
    }
  };

  return (
    <div dir="rtl" className="text-center" ref={boxRef}>
      {isMobile && mode === 'side' && (
        <button
          onClick={() => router.back()}
          className="text-sm bg-white text-black px-2 py-2 rounded shadow hover:bg-gray-200 transition"
        >
          סגור <FaChevronUp className="inline" />
        </button>
      )}

      <div className="transition-all duration-500 ease-in-out mt-2 max-w-md bg-white text-black border border-gray-300 rounded p-3 text-sm shadow-md">
        <h3 className="font-semibold text-black mb-6">
          {user ? 'ניהול חשבון' : 'התחברות / הרשמה'}
        </h3>

        {/* === משתמש מחובר === */}
        {user ? (
          <>
            <p className="mb-4">שלום, {user.email}</p>
            <button
              onClick={handleLogout}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-2 w-full"
            >
              התנתק
            </button>
            <div className="flex justify-center gap-3 text-xs">
              <button onClick={() => setActiveForm('change')} className="text-blue-600 underline">
                שנה סיסמה
              </button>
              <button onClick={() => setActiveForm('reset')} className="text-blue-600 underline">
                שכחתי סיסמה
              </button>
            </div>
          </>
        ) : (
          <>
            <input
              type="email"
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-3 py-2 mb-2 border border-gray-300 rounded text-right text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            />

            <PasswordField
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onEnter={handleLogin} // ✅ Enter = התחברות
              className="w-full mb-2"
            />

            <div className="flex items-center justify-start mb-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="ml-2"
              />
              <label htmlFor="rememberMe" className="text-sm text-black">
                השאר מחובר
              </label>
            </div>

            <button
              onClick={handleLogin}
              className="bg-[#e60000] text-white px-3 py-2 rounded hover:bg-red-700 text-sm w-full"
            >
              התחבר
            </button>

            {loginError && <p className="text-red-600 mt-1 text-xs">{loginError}</p>}
            {statusMsg && <p className="text-green-600 mt-1 text-xs">{statusMsg}</p>}

            <div className="mt-3 flex justify-center gap-3 text-xs">
              <button onClick={() => setActiveForm('register')} className="text-blue-600 underline">
                צור חשבון
              </button>
              <button onClick={() => setActiveForm('reset')} className="text-blue-600 underline">
                שכחתי סיסמה
              </button>
            </div>
          </>
        )}

        {/* === טפסים פנימיים === */}
        {activeForm === 'register' && (
          <FormBox
            title="צור חשבון"
            onClose={() => setActiveForm(null)}
            onSubmit={() => handleAction('register')}
            refEl={refs.register}
          >
            <input
              type="email"
              placeholder="אימייל"
              value={formData.registerEmail}
              onChange={(e) =>
                setFormData((f) => ({ ...f, registerEmail: e.target.value }))
              }
              onKeyDown={(e) => e.key === 'Enter' && handleAction('register')}
              className="w-full px-3 py-2 mb-2 border border-gray-300 rounded text-right text-sm focus:ring-1 focus:ring-red-500"
            />
            <PasswordField
              placeholder="סיסמה"
              value={formData.registerPassword}
              onChange={(e) =>
                setFormData((f) => ({ ...f, registerPassword: e.target.value }))
              }
              onEnter={() => handleAction('register')}
              className="mb-2"
            />
            <PasswordField
              placeholder="אימות סיסמה"
              value={formData.registerConfirm}
              onChange={(e) =>
                setFormData((f) => ({ ...f, registerConfirm: e.target.value }))
              }
              onEnter={() => handleAction('register')}
              className="mb-2"
            />
            <SubmitButton text="הרשמה" color="green" />
          </FormBox>
        )}

        {activeForm === 'reset' && (
          <FormBox
            title="שכחתי סיסמה"
            onClose={() => setActiveForm(null)}
            onSubmit={() => handleAction('reset')}
            refEl={refs.reset}
          >
            <input
              type="email"
              placeholder="אימייל לאיפוס"
              value={formData.resetEmail}
              onChange={(e) =>
                setFormData((f) => ({ ...f, resetEmail: e.target.value }))
              }
              onKeyDown={(e) => e.key === 'Enter' && handleAction('reset')}
              className="w-full px-3 py-2 mb-2 border border-gray-300 rounded text-right text-sm focus:ring-1 focus:ring-red-500"
            />
            <SubmitButton text="שלח סיסמה חדשה" color="blue" />
          </FormBox>
        )}

        {activeForm === 'change' && (
          <FormBox
            title="שנה סיסמה"
            onClose={() => setActiveForm(null)}
            onSubmit={() => handleAction('change')}
            refEl={refs.change}
          >
            <PasswordField
              placeholder="סיסמה נוכחית"
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData((f) => ({ ...f, currentPassword: e.target.value }))
              }
              onEnter={() => handleAction('change')}
              className="mb-2"
            />
            <PasswordField
              placeholder="סיסמה חדשה"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData((f) => ({ ...f, newPassword: e.target.value }))
              }
              onEnter={() => handleAction('change')}
              className="mb-2"
            />
            <SubmitButton text="עדכן סיסמה" color="yellow" />
          </FormBox>
        )}
      </div>
    </div>
  );
}

/* === רכיבי משנה === */
function FormBox({ title, children, onClose, onSubmit, refEl }) {
  return (
    <div
      ref={refEl}
      className="mt-4 bg-gray-100 p-3 rounded text-right text-sm relative"
    >
      <button
        onClick={onClose}
        className="absolute top-2 left-2 text-gray-500 hover:text-black"
      >
        ✖
      </button>
      <h4 className="font-semibold mb-2 pr-6">{title}</h4>
      {children}
      <div className="mt-2 text-center">
        <button
          onClick={onSubmit}
          className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-900"
        >
          אישור
        </button>
      </div>
    </div>
  );
}

function SubmitButton({ text, color }) {
  const colors = {
    green: 'bg-green-600 hover:bg-green-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700'
  };
  return (
    <button
      type="button"
      className={`${colors[color]} text-white px-3 py-2 rounded text-sm w-full`}
    >
      {text}
    </button>
  );
}
