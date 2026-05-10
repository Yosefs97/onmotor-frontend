'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FaTimes } from 'react-icons/fa';

export default function AdvertisingPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // פונקציית סגירה
  const handleClose = useCallback(() => {
    if (dontShowAgain) {
      localStorage.setItem('hideAdPopup', 'true');
    }
    setIsVisible(false);
  }, [dontShowAgain]);

  useEffect(() => {
    const isHidden = localStorage.getItem('hideAdPopup');
    if (isHidden) return;

    // 1. Exit Intent - זיהוי כוונה לצאת מהטאב
    const handleMouseOut = (e) => {
      if (e.clientY <= 0) {
        setIsVisible(true);
        window.removeEventListener('mouseleave', handleMouseOut);
      }
    };

    // 2. Scroll Trigger - זיהוי גלילה מעל 50%
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 50) {
        setIsVisible(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('mouseleave', handleMouseOut);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mouseleave', handleMouseOut);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToPolicy) {
      setErrorMsg('חובה לאשר את מדיניות הפרסום כדי להמשיך.');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/contact-for-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error || 'שגיאת שרת');
      setStatus('success');
      localStorage.setItem('hideAdPopup', 'true'); 
      setTimeout(() => setIsVisible(false), 3000);
    } catch (err) {
      setStatus('error');
      setErrorMsg('אירעה שגיאה בשליחה, אנא נסה שנית.');
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose} // סגירה בלחיצה על הרקע (Overlay Click)
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            onClick={(e) => e.stopPropagation()} // מניעת סגירה כשלוחצים בתוך המודעה
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 left-4 text-gray-400 hover:text-black z-10 p-1 transition-colors"
            >
              <FaTimes size={20} />
            </button>

            {!showForm ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="bg-red-50 text-[#e60000] p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 018.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.43.72 1.053.714 1.745a13.02 13.02 0 01-1.856 6.193" />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">בעל עסק בתחום הדו-גלגלי?</h2>
                <p className="text-lg text-gray-600 mb-8">
                  קבל פרסום באתר ללא עלות
                  <Link href="/AdvertisingPolicy" target="_blank" className="text-[#e60000] font-bold hover:underline">*</Link>
                </p>

                <button
                  onClick={() => setShowForm(true)}
                  className="bg-[#e60000] hover:bg-[#b50000] text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] w-full"
                >
                  לקבלת ההטבה לחץ כאן
                </button>

                <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                  <input 
                    type="checkbox" 
                    id="dontShow" 
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="rounded border-gray-300 text-[#e60000] focus:ring-[#e60000]"
                  />
                  <label htmlFor="dontShow" className="cursor-pointer">אל תציג לי את זה יותר</label>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-gray-50 h-full overflow-y-auto">
                 <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">השארת פרטים לפרסום</h3>
                    <p className="text-sm text-gray-500">מלא את הפרטים ונחזור אליך בהקדם</p>
                 </div>

                 <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
                    <input
                      type="text" name="name" value={form.name} onChange={handleChange}
                      placeholder="שם העסק / איש קשר" required
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e60000] bg-white text-black"
                    />
                    <input
                      type="tel" name="phone" value={form.phone} onChange={handleChange}
                      placeholder="טלפון נייד" required
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e60000] bg-white text-black"
                    />
                    <input
                      type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder="אימייל" required
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e60000] bg-white text-black"
                    />
                    <textarea
                      name="notes" value={form.notes} onChange={handleChange}
                      placeholder="הערות (לא חובה)" rows={2}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e60000] bg-white text-black resize-none"
                    />

                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox" id="policyAgree" checked={agreedToPolicy}
                        onChange={(e) => setAgreedToPolicy(e.target.checked)}
                        className="mt-1 w-4 h-4 text-[#e60000] border-gray-300 rounded focus:ring-[#e60000]"
                      />
                      <label htmlFor="policyAgree" className="text-xs text-gray-600 leading-tight cursor-pointer">
                        אני מאשר/ת שקראתי את <Link href="/AdvertisingPolicy" target="_blank" className="text-blue-600 underline">מדיניות הפרסום</Link> ומסכים/ה לתנאים.
                      </label>
                    </div>

                    {errorMsg && <p className="text-red-500 text-xs font-bold">{errorMsg}</p>}

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className={`py-3 rounded-lg font-bold text-white transition ${
                        status === 'loading' ? 'bg-gray-400' : 'bg-[#e60000] hover:bg-[#b50000]'
                      }`}
                    >
                      {status === 'loading' ? 'שולח...' : 'שלח פרטים'}
                    </button>

                    {status === 'success' && (
                      <div className="text-green-600 text-center text-sm font-bold mt-2 bg-green-100 p-2 rounded border border-green-200">
                        הפרטים נשלחו בהצלחה! החלון ייסגר מיד.
                      </div>
                    )}
                 </form>
                 <button onClick={() => setShowForm(false)} className="mt-4 text-sm text-gray-500 underline w-full text-center">חזרה</button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}