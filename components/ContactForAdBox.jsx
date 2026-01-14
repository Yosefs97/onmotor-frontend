// /components/ContactForAdBox.jsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link'; // <--- הוספתי את הקישור

export default function ContactForAdBox() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  
  // <--- סטייט חדש לאישור המדיניות
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // <--- בדיקה האם המשתמש אישר את המדיניות
    if (!agreedToPolicy) {
      setStatus('error'); // נציג את השגיאה באדום למטה
      setErrorMsg('חובה לאשר את מדיניות הפרסום כדי להמשיך.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact-for-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Server error');
      }

      setStatus('success');
      // איפוס הטופס
      setForm({ name: '', phone: '', email: '', notes: '' });
      setAgreedToPolicy(false); // <--- איפוס הצ'קבוקס

      setTimeout(() => setOpen(false), 2000);
    } catch (err) {
      console.error('❌ שגיאה בשליחה:', err);
      setStatus('error');
      setErrorMsg(err?.message || 'שגיאה לא ידועה');
    }
  };

  return (
    <div
      dir="rtl"
      className="mt-0.8 mb-2 border-[3px] border-[#e60000] rounded-xl bg-gray-900 text-white p-4 text-center shadow-md relative overflow-hidden transition-all duration-300"
    >
      <h3 className="text-xl font-bold mb-2 text-[#e60000]">
        רוצה לפרסם באתר? <span className="text-gray-300">(ללא עלות)</span>
      </h3>
      <p className="text-base text-gray-300 mb-3">
        השאירו פרטים ונציג יחזור אליכם בהקדם.
      </p>

      <button
        onClick={() => setOpen(!open)}
        className="bg-[#e60000] hover:bg-[#b50000] text-white font-bold px-4 py-2 rounded-md transition"
      >
        {open ? 'סגור' : 'השאירו פרטים'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-4 bg-gray-800 text-white p-4 rounded-md border-t-2 border-[#e60000] text-right"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="שם / שם העסק"
                required
                className="p-2 rounded bg-gray-700 text-white w-full placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#e60000]"
              />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="מספר נייד"
                required
                className="p-2 rounded bg-gray-700 text-white w-full placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#e60000]"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="אימייל"
                required
                className="p-2 rounded bg-gray-700 text-white w-full placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#e60000]"
              />

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="פירוט נוסף (לא חובה)"
                rows={3}
                className="p-2 rounded bg-gray-700 text-white w-full placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-[#e60000]"
              />

              {/* <--- הוספת הצ'קבוקס למדיניות ---> */}
              <div className="flex items-start gap-2 mt-1">
                <input
                  type="checkbox"
                  id="adPolicyAgree"
                  checked={agreedToPolicy}
                  onChange={(e) => setAgreedToPolicy(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#e60000] bg-gray-700 border-gray-600 rounded focus:ring-[#e60000] focus:ring-offset-gray-800 cursor-pointer"
                />
                <label htmlFor="adPolicyAgree" className="text-xs text-gray-300 leading-tight select-none cursor-pointer">
                  אני מאשר/ת שקראתי את <Link href="/AdvertisingPolicy" target="_blank" className="text-[#e60000] hover:underline font-bold">מדיניות הפרסום</Link> ומסכים/ה לתנאים.
                </label>
              </div>

              <button
                type="submit"
                className="bg-[#e60000] hover:bg-[#b50000] px-4 py-2 rounded-md mt-2 font-bold transition-colors"
              >
                הגש
              </button>
            </form>

            {status === 'loading' && (
              <p className="text-yellow-400 mt-2 text-sm">שולח...</p>
            )}
            {status === 'success' && (
              <p className="text-green-400 mt-2 text-sm">
                ✅ נשלח בהצלחה! נציג יחזור אליך בקרוב.
              </p>
            )}
            {status === 'error' && (
              <p className="text-red-400 mt-2 text-sm font-bold">
                ⚠️ {errorMsg}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}