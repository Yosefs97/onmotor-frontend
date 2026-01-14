//components\WhatsAppSlideIn.jsx
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';

export default function WhatsAppSlideIn() {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // בדיקה האם המשתמש כבר הסתיר את החלון בעבר
    const isHidden = localStorage.getItem('hideWhatsAppSlide');
    
    if (!isHidden) {
      // אם לא הוסתר - נפעיל טיימר של 35 שניות
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 35000); // 35000 מילישניות = 35 שניות

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    // אם סומן הצ'קבוקס - נשמור בזיכרון
    if (dontShowAgain) {
      localStorage.setItem('hideWhatsAppSlide', 'true');
    }
    setIsVisible(false);
  };

  const handleJoin = () => {
    // אם המשתמש בחר להצטרף, נניח שהוא לא צריך לראות את ההודעה שוב
    localStorage.setItem('hideWhatsAppSlide', 'true');
    setIsVisible(false);
    
    // פתיחת הקישור בלשונית חדשה
    window.open('https://whatsapp.com/channel/0029Vb6Oh5xL2ATxMU7Xbz2M', '_blank');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          // אנימציית כניסה מצד ימין
          initial={{ x: 300, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          
          // מיקום: צד ימין למטה, מעל הכל
          className="fixed bottom-20 right-4 z-[90] max-w-sm w-full bg-white border-r-4 border-[#25D366] rounded-lg shadow-2xl p-4 flex flex-col gap-3"
          dir="rtl"
        >
          {/* כפתור סגירה */}
          <button 
            onClick={handleClose}
            className="absolute top-2 left-2 text-gray-400 hover:text-gray-600 transition"
          >
            <FaTimes />
          </button>

          <div className="flex items-center gap-3 pr-2">
            {/* אייקון וואטסאפ ירוק וגדול */}
            <div className="bg-[#25D366] text-white p-2 rounded-full shadow-md">
              <FaWhatsapp size={24} />
            </div>
            
            <div>
              <h4 className="font-bold text-gray-800 text-sm">עדכונים שוטפים ב-WhatsApp</h4>
              <p className="text-xs text-gray-600 mt-1 leading-snug">
                הצטרפו לערוץ הווטאצאפ לקבלת עדכונים שוטפים
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            {/* כפתור הצטרפות */}
            <button
              onClick={handleJoin}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-bold py-2 px-4 rounded transition-colors shadow-sm w-full"
            >
              הצטרפות לערוץ
            </button>

            {/* צ'קבוקס הסתרה */}
            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
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