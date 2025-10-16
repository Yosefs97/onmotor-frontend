// /components/ContactForAdBox.jsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactForAdBox() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setForm({ name: '', phone: '', email: '', notes: '' });

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
        רוצה לפרסם באתר?
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
                className="p-2 rounded bg-gray-700 text-white w-full placeholder-gray-400"
              />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="מספר נייד"
                required
                className="p-2 rounded bg-gray-700 text-white w-full placeholder-gray-400"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="אימייל"
                required
                className="p-2 rounded bg-gray-700 text-white w-full placeholder-gray-400"
              />

              {/* 🟢 שדה הערות אופציונלי בלבד */}
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="פירוט נוסף (לא חובה)"
                rows={3}
                className="p-2 rounded bg-gray-700 text-white w-full placeholder-gray-400 resize-none"
              />

              <button
                type="submit"
                className="bg-[#e60000] hover:bg-[#b50000] px-4 py-2 rounded-md mt-2 font-bold"
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
              <p className="text-red-400 mt-2 text-sm">
                ⚠️ אירעה שגיאה בשליחה: {errorMsg}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
