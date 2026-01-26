//components\AudioPlayer.jsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, X, Volume2 } from 'lucide-react';

export default function AudioPlayer({ 
  segments = [], // מקבלים מערך של פסקאות טקסט
  authorName = "OnMotor Media", 
  authorImage = "/OnMotorLogonoback.png" 
}) {
  // בניית הטקסט המלא מהמערך
  const fullText = useMemo(() => segments.join('. '), [segments]);
  
  // מיפוי גבולות הפסקאות (כדי לדעת איזה אינדקס שייך לאיזו פסקה)
  const paragraphMap = useMemo(() => {
    let charCount = 0;
    return segments.map((seg, index) => {
      const start = charCount;
      const end = charCount + seg.length + 2; // +2 בגלל הנקודה והרווח
      charCount = end;
      return { index, start, end };
    });
  }, [segments]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rate, setRate] = useState(1);
  const [offset, setOffset] = useState(0);
  const [voices, setVoices] = useState([]); 
  const [isReady, setIsReady] = useState(false);
  const [activeParaIndex, setActiveParaIndex] = useState(-1); // הפסקה הנוכחית המודגשת
  const [showStickyPlayer, setShowStickyPlayer] = useState(false); // האם להציג נגן צף

  const synthesisRef = useRef(null);
  const utteranceRef = useRef(null);
  const containerRef = useRef(null); // רפרנס לנגן הראשי כדי לזהות גלילה

  // 1. טעינת קולות
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis;
      const loadVoices = () => {
        const availableVoices = synthesisRef.current.getVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0) setIsReady(true);
      };
      loadVoices();
      if (synthesisRef.current.onvoiceschanged !== undefined) {
        synthesisRef.current.onvoiceschanged = loadVoices;
      }
    }
    return () => {
      if (synthesisRef.current) synthesisRef.current.cancel();
      clearHighlight(); // ניקוי הדגשות ביציאה
    };
  }, []);

  // 2. זיהוי גלילה (Intersection Observer)
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // אם הנגן לא נראה במסך (isIntersecting false) והוא מנגן - הצג נגן צף
        // אם הוא לא מנגן, אין סיבה להציג נגן צף
        setShowStickyPlayer(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  // פונקציה לניקוי הדגשות קודמות
  const clearHighlight = () => {
    document.querySelectorAll('.highlight-active').forEach(el => {
      el.classList.remove('bg-blue-50', 'text-blue-900', 'highlight-active', 'transition-colors', 'duration-500', 'p-2', 'rounded-lg');
    });
  };

  // פונקציה להדגשת הפסקה הנוכחית וגלילה אליה
  const highlightParagraph = (globalCharIndex) => {
    // מציאת הפסקה הרלוונטית לפי האינדקס הנוכחי
    const currentPara = paragraphMap.find(p => globalCharIndex >= p.start && globalCharIndex < p.end);
    
    if (currentPara && currentPara.index !== activeParaIndex) {
      setActiveParaIndex(currentPara.index);
      clearHighlight();

      // חיפוש האלמנט ב-DOM (ה-IDs שיצרנו בשלב הקודם)
      const el = document.getElementById(`article-para-${currentPara.index}`);
      if (el) {
        // הוספת קלאסים להדגשה (Tailwind)
        el.classList.add('bg-blue-50', 'text-blue-900', 'highlight-active', 'transition-colors', 'duration-500', 'p-2', 'rounded-lg');
        
        // גלילה עדינה לאלמנט (רק אם הוא לא במרכז המסך)
        const rect = el.getBoundingClientRect();
        const isInViewport = rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
        
        if (!isInViewport) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  const getHebrewVoice = () => {
    const googleVoice = voices.find(v => v.name.includes("Google") && v.lang.includes("he"));
    if (googleVoice) return googleVoice;
    return voices.find(v => v.lang === 'he-IL' || v.lang === 'he');
  };

  const speak = (startIndex = offset) => {
    if (!synthesisRef.current) return;

    // ביטול הקראה קודמת
    synthesisRef.current.cancel();

    const textToSpeak = fullText.substring(startIndex);
    if (!textToSpeak.trim()) return;

    // 🛠️ תיקון לבאג המובייל (0%): שימוש ב-setTimeout
    // זה נותן לדפדפן "לנשום" ולוודא שה-Cancel בוצע לפני שמתחילים מחדש
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        const selectedVoice = getHebrewVoice();
        if (selectedVoice) utterance.voice = selectedVoice;
        
        utterance.lang = 'he-IL';
        utterance.rate = rate;

        utterance.onboundary = (event) => {
          const currentGlobalIndex = startIndex + event.charIndex;
          const percent = (currentGlobalIndex / fullText.length) * 100;
          
          setProgress(percent);
          setOffset(currentGlobalIndex);
          highlightParagraph(currentGlobalIndex); // קריאה לפונקציית ההדגשה
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setProgress(100);
          setOffset(0);
          clearHighlight();
        };

        utterance.onerror = (e) => {
          console.error("Speech Error:", e);
          setIsPlaying(false);
        };

        utteranceRef.current = utterance;
        synthesisRef.current.speak(utterance);
        setIsPlaying(true);
    }, 10); // דיליי קצרצר של 10ms
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      synthesisRef.current.cancel();
      setIsPlaying(false);
      clearHighlight();
    } else {
      speak(offset);
    }
  };

  const handleSeek = (e) => {
    const newPercent = parseFloat(e.target.value);
    setProgress(newPercent);
    const newIndex = Math.floor((newPercent / 100) * fullText.length);
    const safeIndex = fullText.indexOf(' ', newIndex);
    const finalIndex = safeIndex === -1 ? newIndex : safeIndex + 1;
    setOffset(finalIndex);

    if (isPlaying) {
      speak(finalIndex);
    }
  };

  const toggleSpeed = () => {
    const nextRate = rate === 1 ? 1.5 : rate === 1.5 ? 2 : 1;
    setRate(nextRate);
    if (isPlaying) {
      speak(offset);
    }
  };

  return (
    <>
      {/* הנגן הראשי שמוטמע בכתבה */}
      <div ref={containerRef} className="flex items-center gap-3 bg-[#f0f2f5] p-3 rounded-xl max-w-md w-full shadow-sm border border-gray-200 mb-4" dir="ltr">
        
        <div className="relative w-12 h-12 flex-shrink-0">
          <img 
            src={authorImage} 
            alt="Avatar" 
            className="w-full h-full rounded-full object-cover"
          />
          <div className="absolute bottom-0 right-0 bg-[#00a884] p-0.5 rounded-full border-2 border-white flex items-center justify-center w-4 h-4">
             <div className="w-2 h-2 bg-white rounded-full"></div> 
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePlayPause}
              className="text-gray-500 hover:text-gray-700 transition flex-shrink-0"
              disabled={!isReady && typeof window !== 'undefined'} 
            >
              {isPlaying ? (
                <Pause size={28} fill="currentColor" className="text-gray-600" />
              ) : (
                <Play size={28} fill="currentColor" className={`text-gray-600 ml-1 ${!isReady ? 'opacity-50' : ''}`} />
              )}
            </button>

            <div className="relative w-full h-4 flex items-center group">
              <div className="absolute w-full h-1.5 bg-gray-300 rounded-full overflow-hidden pointer-events-none">
                <div 
                  className="absolute top-0 left-0 h-full bg-[#00a884] transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <input 
                type="range" min="0" max="100" step="0.1"
                value={progress} onChange={handleSeek}
                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div 
                className="absolute w-3 h-3 bg-[#00a884] rounded-full border border-white shadow-sm pointer-events-none transition-all duration-100"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 px-1">
            <span>{Math.round(progress)}%</span>
            <span className="truncate max-w-[120px]">{authorName}</span>
          </div>
        </div>

        <button onClick={toggleSpeed} className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold px-2 py-1.5 rounded-full min-w-[3rem] transition flex-shrink-0">
          {rate}x
        </button>
      </div>

      {/* 🆕 נגן צף (Sticky Stop Button) */}
      {/* מופיע רק אם הנגן פועל + הנגן המקורי יצא מהמסך */}
      {isPlaying && showStickyPlayer && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 bg-white p-3 rounded-full shadow-xl border border-gray-200 animate-in slide-in-from-bottom-5 duration-300">
          <div className="relative">
             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 animate-pulse">
                <Volume2 size={20} />
             </div>
             <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          
          <div className="flex flex-col mr-2">
            <span className="text-xs font-bold text-gray-800">מקריא כעת...</span>
            <span className="text-[10px] text-gray-500">לחץ לעצירה</span>
          </div>

          <button 
            onClick={handlePlayPause}
            className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-full transition border border-red-100"
          >
            <Pause size={20} fill="currentColor" />
          </button>
        </div>
      )}
    </>
  );
}