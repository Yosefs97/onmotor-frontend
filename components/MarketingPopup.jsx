//components\MarketingPopup.jsx
'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

// משתמשים רק במשתנה הסביבה. אם הוא לא קיים - זה יהיה undefined.
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
const PLACEHOLDER_IMG = '/default-image.jpg';

export default function MarketingPopup() {
  const [data, setData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchPopupData = async () => {
    // הגנה: אם אין כתובת API מוגדרת, אל תנסה אפילו לגשת
    if (!API_URL) return;

    try {
      const res = await fetch(
        `${API_URL}/api/popups?filters[IsActive][$eq]=true&pagination[limit]=1&sort[0]=createdAt:desc`,
        { method: 'GET' }
      );
      
      if (!res.ok) return; // אם השרת מחזיר שגיאה (למשל 404 או 500)

      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setData(json.data[0]);
      }
    } catch (error) {
      console.error('Error fetching popup:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchPopupData();
  }, []);

  useEffect(() => {
    if (!data || !isLoaded) return;

    const attrs = data.attributes || data;
    const { CampaignID, DelaySeconds } = attrs;

    // בדיקת LocalStorage
    const storageKey = CampaignID ? `popup_blocked_${CampaignID}` : 'popup_blocked_general';
    if (localStorage.getItem(storageKey)) return;

    // הפעלת הטיימר - ברירת מחדל 25 שניות אם לא הוגדר אחרת
    const delayTime = (DelaySeconds || 25) * 1000;
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayTime);

    return () => clearTimeout(timer);
  }, [data, isLoaded]);

  const handleClose = () => {
    setIsVisible(false);
    const attrs = data?.attributes || data;
    
    // שמירה ב-LocalStorage רק אם המשתמש ביקש
    if (dontShowAgain && attrs?.CampaignID) {
      localStorage.setItem(`popup_blocked_${attrs.CampaignID}`, 'true');
    }
  };

  if (!data) return null;

  const attrs = data.attributes || data;
  const { Title, Link: targetLink, ButtonText, external_media_links } = attrs;

  // לוגיקת תמונה (לפי SimilarArticles)
  const getPopupImage = () => {
    if (Array.isArray(external_media_links) && external_media_links.length > 0) {
      const validLinks = external_media_links.filter(l => typeof l === 'string' && l.startsWith('http'));
      // לוקח את הלינק השני אם יש, אחרת את הראשון
      if (validLinks.length > 1) return validLinks[1].trim();
      if (validLinks.length > 0) return validLinks[0].trim();
    }
    return PLACEHOLDER_IMG;
  };

  const imageUrl = getPopupImage();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-[35%] right-0 z-[9999] w-[90%] max-w-sm bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
          style={{ direction: 'rtl' }}
        >
          {/* כפתור סגירה */}
          <button 
            onClick={handleClose} 
            className="absolute top-2 left-2 z-10 p-1 bg-white/80 rounded-full hover:bg-gray-200 transition shadow-sm"
            aria-label="סגור חלון"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* תמונה */}
          <div className="relative h-48 w-full bg-gray-100">
             <Image 
               src={imageUrl} 
               alt={Title || ''} 
               fill 
               className="object-cover" 
               unoptimized 
             />
          </div>

          {/* תוכן */}
          <div className="p-5">
            {Title && (
              <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                {Title}
              </h3>
            )}
            
            {targetLink && (
              <Link href={targetLink} passHref>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded transition-colors shadow-md">
                    {ButtonText || 'לפרטים נוספים'}
                  </button>
              </Link>
            )}

            {/* צ'ק בוקס - אל תציג שוב */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
              <input 
                id="dont-show-again" 
                type="checkbox" 
                checked={dontShowAgain} 
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
              />
              <label htmlFor="dont-show-again" className="text-sm text-gray-500 cursor-pointer select-none">
                אל תציג לי את זה שוב
              </label>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}