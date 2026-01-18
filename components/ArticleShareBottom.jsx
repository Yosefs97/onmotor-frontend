'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FiShare2, FiCopy, FiX } from 'react-icons/fi';
import { FaWhatsapp, FaTwitter, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import { MdMoreHoriz } from 'react-icons/md';
import { gsap } from 'gsap';

export default function ArticleShareBottom() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // מצב חדש: האם הכפתור מכווץ?
  const [menuDirection, setMenuDirection] = useState('up');
  const buttonRef = useRef(null);
  const dropRef = useRef(null);
  
  const url = typeof window !== 'undefined' ? window.location.href : '';

  // פונקציה שמטפלת בלחיצה על הכפתור הראשי
  const handleMainClick = () => {
    // אם הכפתור מכווץ - קודם כל נרחיב אותו ונפתח את התפריט
    if (collapsed) {
      setCollapsed(false);
      calculateDirectionAndOpen();
      return;
    }

    // אם הוא כבר פתוח - נסגור
    if (open) {
      setOpen(false);
    } else {
      // אם הוא סגור (אך לא מכווץ) - נפתח
      calculateDirectionAndOpen();
    }
  };

  // פונקציה לחישוב כיוון ופתיחה
  const calculateDirectionAndOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const menuHeightEstimate = 320;

      if (spaceBelow < menuHeightEstimate || rect.top > windowHeight * 0.66) {
        setMenuDirection('up');
      } else {
        setMenuDirection('down');
      }
    }
    setOpen(true);
  };

  // פונקציה שמטפלת בלחיצה על ה-X
  const handleCloseAndCollapse = (e) => {
    e.stopPropagation(); // מונע מהלחיצה לעבור לכפתור הראשי ולפתוח שוב
    setOpen(false);
    
    // דיליי קטן כדי שהתפריט ייסגר לפני שהכפתור מתכווץ (אנימציה חלקה יותר)
    setTimeout(() => {
      setCollapsed(true);
    }, 100);
  };

  /* 🎬 אנימציה לתפריט */
  useEffect(() => {
    if (open && dropRef.current) {
      const startY = menuDirection === 'up' ? 10 : -10;
      gsap.fromTo(
        dropRef.current,
        { y: startY, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.25, ease: 'power1.out' }
      );
    }
  }, [open, menuDirection]);

  /* סגירה בלחיצה בחוץ */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target) && 
          dropRef.current && !dropRef.current.contains(event.target)) {
        setOpen(false);
        // הערה: כאן בחרתי לא לכווץ אוטומטית, אלא רק אם המשתמש לחץ על ה-X במפורש
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
      if (typeof navigator !== 'undefined') {
          navigator.clipboard.writeText(url);
          setOpen(false);
      }
  };

  const handleShareAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch (err) {
        console.error(err);
      }
    } else handleCopy();
  };

  return (
    <div className="relative inline-block z-10" ref={buttonRef}>
      
      {/* תפריט השיתוף */}
      {open && (
        <div
          ref={dropRef}
          className={`absolute left-0 w-52 bg-white text-black rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden
            ${menuDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'}
          `}
        >
          <div className="flex justify-between items-center p-2 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">שתף באמצעות</span>
            
            {/* כפתור ה-X שגורם לכיווץ */}
            <button
              onClick={handleCloseAndCollapse}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="סגור וכווץ"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col">
            <button onClick={handleCopy} className="share-item">
              <FiCopy className="icon" /> <span>העתק קישור</span>
            </button>
            <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="share-item">
              <FaWhatsapp className="icon text-green-500" /> <span>וואטסאפ</span>
            </a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="share-item">
              <FaTwitter className="icon text-blue-400" /> <span>טוויטר</span>
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="share-item">
              <FaFacebook className="icon text-blue-600" /> <span>פייסבוק</span>
            </a>
             <a href={`https://www.tiktok.com/share?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="share-item">
              <FaTiktok className="icon text-black" /> <span>טיקטוק</span>
            </a>
            <button onClick={handleShareAPI} className="share-item border-t">
              <MdMoreHoriz className="icon" /> <span>עוד...</span>
            </button>
          </div>
        </div>
      )}

      {/* הכפתור הראשי */}
      <button
        onClick={handleMainClick}
        className={`flex items-center shadow-md transition-all duration-300 ease-in-out
          bg-red-600 hover:bg-red-700 text-white hover:shadow-lg transform active:scale-95
          ${open ? 'ring-2 ring-offset-2 ring-red-500' : ''}
          ${collapsed 
              ? 'w-12 h-12 justify-center rounded-full p-0' // עיצוב למצב מכווץ (עגול)
              : 'w-auto px-6 py-2 rounded-full gap-1'      // עיצוב למצב פתוח (אליפסה)
           }
        `}
      >
        <FiShare2 className="w-5 h-5 flex-shrink-0" />
        
        {/* הטקסט מוסתר כשהכפתור מכווץ */}
        <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300
            ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[100px] opacity-100'}
        `}>
          {!collapsed && "שתף כתבה"}
        </span>
      </button>

      <style jsx>{`
        .share-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 10px 16px;
          transition: background-color 0.2s;
          font-size: 14px;
          color: #374151;
          text-decoration: none;
        }
        .share-item:hover {
          background-color: #f3f4f6;
        }
        .icon {
          width: 18px;
          height: 18px;
          margin-left: 10px;
        }
      `}</style>
    </div>
  );
}