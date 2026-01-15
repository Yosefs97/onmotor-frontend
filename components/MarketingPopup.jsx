// components/MarketingPopup.jsx
'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
const PLACEHOLDER_IMG = '/default-image.jpg';

export default function MarketingPopup() {
  const [data, setData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchPopupData = async () => {
    if (!API_URL) return;

    try {
      const res = await fetch(
        `${API_URL}/api/popups?filters[IsActive][$eq]=true&pagination[limit]=1&sort[0]=createdAt:desc`,
        { method: 'GET' }
      );
      
      if (!res.ok) return;

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
    const storageKey = CampaignID ? `popup_blocked_${CampaignID}` : 'popup_blocked_general';

    // 1. בדיקה האם המשתמש חסם לתמיד (Checkbox)
    if (localStorage.getItem(storageKey)) return;

    // 2. בדיקה האם המשתמש סגר את הפופ-אפ בביקור הנוכחי (X)
    // אנו משתמשים באותו מפתח (Key) אבל ב-sessionStorage
    if (sessionStorage.getItem(storageKey)) return;

    const delayTime = (DelaySeconds || 25) * 1000;
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayTime);

    return () => clearTimeout(timer);
  }, [data, isLoaded]);

  const handleClose = () => {
    setIsVisible(false);
    const attrs = data?.attributes || data;
    const campaignID = attrs?.CampaignID;
    const storageKey = campaignID ? `popup_blocked_${campaignID}` : 'popup_blocked_general';

    // שמירה ב-localStorage אם המשתמש סימן את התיבה (חסימה קבועה)
    if (dontShowAgain) {
      localStorage.setItem(storageKey, 'true');
    } else {
      // שמירה ב-sessionStorage אם המשתמש רק סגר ב-X (חסימה עד סגירת הדפדפן)
      sessionStorage.setItem(storageKey, 'true');
    }
  };

  if (!data) return null;

  const attrs = data.attributes || data;
  const { Title, Link: targetLink, ButtonText, external_media_links } = attrs;

  const getPopupImage = () => {
    if (Array.isArray(external_media_links) && external_media_links.length > 0) {
      const validLinks = external_media_links.filter(l => typeof l === 'string' && l.startsWith('http'));
      if (validLinks.length > 1) return validLinks[1].trim();
      if (validLinks.length > 0) return validLinks[0].trim();
    }
    return PLACEHOLDER_IMG;
  };

  const imageUrl = getPopupImage();

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* רקע כהה (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm"
          />

          {/* החלון עצמו */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[90%] max-w-sm bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
            style={{ direction: 'rtl' }}
          >
            <button 
              onClick={handleClose} 
              className="absolute top-2 left-2 z-10 p-1 bg-white/80 rounded-full hover:bg-gray-200 transition shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative h-48 w-full bg-gray-100">
               <Image 
                 src={imageUrl} 
                 alt={Title || ''} 
                 fill 
                 className="object-cover" 
                 unoptimized 
               />
            </div>

            <div className="p-5">
              {Title && <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{Title}</h3>}
              
              {targetLink && (
                <Link href={targetLink} passHref>
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded transition-colors shadow-md">
                      {ButtonText || 'לפרטים נוספים'}
                    </button>
                </Link>
              )}

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
        </>
      )}
    </AnimatePresence>
  );
}