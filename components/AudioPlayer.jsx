'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

export default function AudioPlayer({ 
  text, 
  authorName = "OnMotor Media", 
  authorImage = "/OnMotorLogonoback.png" 
}) {
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rate, setRate] = useState(1);
  const [offset, setOffset] = useState(0);
  const [voices, setVoices] = useState([]); // שמירת רשימת הקולות
  const [isReady, setIsReady] = useState(false); // האם המנוע מוכן
  
  const synthesisRef = useRef(null);
  const utteranceRef = useRef(null);

  // 1. טעינת קולות חכמה (קריטי למובייל)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const availableVoices = synthesisRef.current.getVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0) setIsReady(true);
      };

      // ניסיון ראשון לטעון קולות
      loadVoices();

      // האזנה לאירוע טעינת קולות (קורה בעיקר בכרום/אנדרואיד)
      if (synthesisRef.current.onvoiceschanged !== undefined) {
        synthesisRef.current.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  // פונקציית עזר למציאת קול עברי
  const getHebrewVoice = () => {
    // עדיפות ראשונה: קולות של גוגל בעברית (נשמעים הכי טוב)
    const googleVoice = voices.find(v => v.name.includes("Google") && v.lang.includes("he"));
    if (googleVoice) return googleVoice;

    // עדיפות שניה: כל קול שמוגדר כ-he-IL
    const hebrewVoice = voices.find(v => v.lang === 'he-IL' || v.lang === 'he');
    if (hebrewVoice) return hebrewVoice;

    return null; // אם אין, הדפדפן יבחר ברירת מחדל
  };

  const speak = (startIndex = offset) => {
    if (!synthesisRef.current) return;

    // ביטול דיבור קודם
    synthesisRef.current.cancel();

    // חיתוך הטקסט
    const textToSpeak = text.substring(startIndex);
    if (!textToSpeak.trim()) return;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // 2. הגדרת הקול הספציפי (קריטי לאייפון)
    const selectedVoice = getHebrewVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.lang = 'he-IL';
    utterance.rate = rate;

    // תיקון באג באנדרואיד: לפעמים ה-End לא נורה אם הטקסט ארוך מדי
    // אז אנחנו מוודאים שהאירועים נשמרים בזיכרון
    utterance.onboundary = (event) => {
      const currentGlobalIndex = startIndex + event.charIndex;
      const percent = (currentGlobalIndex / text.length) * 100;
      setProgress(percent);
      setOffset(currentGlobalIndex);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      setOffset(0);
    };

    utterance.onerror = (e) => {
      console.error("Speech Error:", e);
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    synthesisRef.current.speak(utterance);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      synthesisRef.current.cancel(); // במובייל עדיף cancel על פני pause
      setIsPlaying(false);
    } else {
      speak(offset);
    }
  };

  const toggleSpeed = () => {
    const nextRate = rate === 1 ? 1.5 : rate === 1.5 ? 2 : 1;
    setRate(nextRate);
    if (isPlaying) {
      speak(offset);
    }
  };

  const handleSeek = (e) => {
    const newPercent = parseFloat(e.target.value);
    setProgress(newPercent);
    const newIndex = Math.floor((newPercent / 100) * text.length);
    const safeIndex = text.indexOf(' ', newIndex);
    const finalIndex = safeIndex === -1 ? newIndex : safeIndex + 1;
    setOffset(finalIndex);

    if (isPlaying) {
      speak(finalIndex);
    }
  };

  // אם המנוע לא מוכן עדיין, נציג טעינה או פשוט לא נאפשר לחיצה
  // אבל לרוב במובייל זה קורה מהר מאוד ברקע
  
  return (
    <div className="flex items-center gap-3 bg-[#f0f2f5] p-3 rounded-xl max-w-md w-full shadow-sm border border-gray-200" dir="ltr">
      
      {/* תמונת פרופיל */}
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
            // השתקנו את הכפתור אם המנוע עוד לא נטען (נדיר)
            disabled={!isReady && typeof window !== 'undefined'} 
          >
            {isPlaying ? (
              <Pause size={28} fill="currentColor" className="text-gray-600" />
            ) : (
              <Play size={28} fill="currentColor" className={`text-gray-600 ml-1 ${!isReady ? 'opacity-50' : ''}`} />
            )}
          </button>

          {/* סליידר לחיץ */}
          <div className="relative w-full h-4 flex items-center group">
            <div className="absolute w-full h-1.5 bg-gray-300 rounded-full overflow-hidden pointer-events-none">
              <div 
                className="absolute top-0 left-0 h-full bg-[#00a884] transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="0.1"
              value={progress}
              onChange={handleSeek}
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

      <button 
        onClick={toggleSpeed}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold px-2 py-1.5 rounded-full min-w-[3rem] transition flex-shrink-0"
      >
        {rate}x
      </button>
    </div>
  );
}