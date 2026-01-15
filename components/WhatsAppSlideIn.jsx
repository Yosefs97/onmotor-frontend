'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';

export default function WhatsAppSlideIn() {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const isHidden = localStorage.getItem('hideWhatsAppSlide');
    
    if (!isHidden) {
      // טיימר של 35 שניות
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 15000); 

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideWhatsAppSlide', 'true');
    }
    setIsVisible(false);
  };

  const handleJoin = () => {
    localStorage.setItem('hideWhatsAppSlide', 'true');
    setIsVisible(false);
    window.open('https://whatsapp.com/channel/0029Vb6Oh5xL2ATxMU7Xbz2M', '_blank');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          // מתחיל מחוץ למסך (מימין) ומחליק ל-0 (קצה המסך)
          initial={{ x: '100%', opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          
          // עיצוב ומיקום:
          // top-[35%] -> ממוקם בחליש העליון של המסך
          // right-0 -> דבוק לימין
          // rounded-l-xl -> פינות עגולות רק בצד שמאל
          className="fixed top-[35%] right-0 z-[90] w-[300px] max-w-[90vw] bg-white border-l-4 border-[#25D366] rounded-l-xl rounded-r-none shadow-[0_5px_20px_rgba(0,0,0,0.15)] p-5 flex flex-col gap-3"
          dir="rtl"
        >
          {/* כפתור סגירה - ממוקם בצד שמאל למעלה עם רווח */}
          <button 
            onClick={handleClose}
            className="absolute top-2 left-2 text-gray-400 hover:text-red-500 transition p-1"
          >
            <FaTimes size={16} />
          </button>

          <div className="flex items-start gap-3 mt-1">
            {/* אייקון וואטסאפ */}
            <div className="bg-[#25D366] text-white p-2 rounded-full shadow-sm shrink-0">
              <FaWhatsapp size={28} />
            </div>
            
            <div className="pl-4"> {/* ריווח כדי שהטקסט לא יעלה על ה-X */}
              <h4 className="font-bold text-gray-900 text-base leading-tight">
                הצטרפו לערוץ ה-וואטסאפ!
              </h4>
              <p className="text-sm text-gray-600 mt-1 leading-snug">
                לקבלת עדכונים שוטפים ישירות לנייד.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <button
              onClick={handleJoin}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-2 px-4 rounded shadow-md transition-transform transform active:scale-95 text-center w-full"
            >
              הצטרפות לערוץ
            </button>

            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none justify-center">
              <input 
                type="checkbox" 
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="rounded border-gray-300 text-gray-500 focus:ring-0 w-3 h-3"
              />
              אל תציג לי את זה יותר
            </label>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}