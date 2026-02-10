// components/AudioPlayer.jsx

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

export default function AudioPlayer({ 
  segments = [], 
  authorName = "OnMotor Media", 
  authorImage = "/OnMotorLogonoback.png",
}) {
  
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth > 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const fullText = useMemo(() => segments.join('. '), [segments]);
  
  const paragraphMap = useMemo(() => {
    let charCount = 0;
    return segments.map((seg, index) => {
      const start = charCount;
      const end = charCount + seg.length + 2; 
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
  const [activeParaIndex, setActiveParaIndex] = useState(-1);
  const [showStickyPlayer, setShowStickyPlayer] = useState(false);

  const synthesisRef = useRef(null);
  const utteranceRef = useRef(null);
  const containerRef = useRef(null);

  // 1. טעינת קולות + הגנה מפני דפדפנים לא תומכים (כמו פייסבוק)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthesisRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        // בדיקת הגנה נוספת לפני קריאה ל-getVoices
        if (!synthesisRef.current) return;
        
        try {
          const availableVoices = synthesisRef.current.getVoices();
          setVoices(availableVoices || []);
          if (availableVoices && availableVoices.length > 0) {
            setIsReady(true);
          }
        } catch (err) {
          console.warn("Could not load voices:", err);
        }
      };

      loadVoices();
      
      if (synthesisRef.current.onvoiceschanged !== undefined) {
        synthesisRef.current.onvoiceschanged = loadVoices;
      }
    } else {
      console.warn("Speech Synthesis is not supported in this browser.");
      setIsReady(false);
    }

    return () => {
      // ביטול בטוח רק אם האובייקט קיים
      if (synthesisRef.current && typeof synthesisRef.current.cancel === 'function') {
        synthesisRef.current.cancel();
      }
      clearHighlight();
    };
  }, []);

  // 2. עצירה כשהדף מוסתר
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (synthesisRef.current && typeof synthesisRef.current.cancel === 'function') {
          synthesisRef.current.cancel();
        }
        setIsPlaying(false);
        clearHighlight();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyPlayer(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  const clearHighlight = () => {
    document.querySelectorAll('.highlight-active').forEach(el => {
      el.classList.remove('bg-blue-50', 'text-blue-900', 'highlight-active', 'transition-colors', 'duration-500', 'p-2', 'rounded-lg');
    });
  };

  const highlightParagraph = (globalCharIndex) => {
    const currentPara = paragraphMap.find(p => globalCharIndex >= p.start && globalCharIndex < p.end);
    
    if (currentPara && currentPara.index !== activeParaIndex) {
      setActiveParaIndex(currentPara.index);
      clearHighlight();

      const el = document.getElementById(`article-para-${currentPara.index}`);
      if (el) {
        el.classList.add('bg-blue-50', 'text-blue-900', 'highlight-active', 'transition-colors', 'duration-500', 'p-2', 'rounded-lg');
        
        const rect = el.getBoundingClientRect();
        const isInViewport = rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
        
        if (!isInViewport) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  const getHebrewVoice = () => {
    if (!voices || voices.length === 0) return null;
    const googleVoice = voices.find(v => v.name && v.name.includes("Google") && v.lang && v.lang.includes("he"));
    if (googleVoice) return googleVoice;
    return voices.find(v => v.lang === 'he-IL' || v.lang === 'he');
  };

  const speak = (startIndex = offset) => {
    // הגנה: אם אין תמיכה בדפדפן, לא עושים כלום
    if (!synthesisRef.current || typeof synthesisRef.current.speak !== 'function') {
      alert("הקראה קולית אינה נתמכת בדפדפן זה. מומלץ לפתוח בדפדפן כרום או ספארי.");
      return;
    }

    synthesisRef.current.cancel();

    setTimeout(() => {
        const textToSpeak = fullText.substring(startIndex);
        if (!textToSpeak.trim()) return;

        try {
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          const selectedVoice = getHebrewVoice();
          if (selectedVoice) utterance.voice = selectedVoice;
          
          utterance.lang = 'he-IL';
          utterance.rate = rate;

          utterance.onboundary = (event) => {
            const currentGlobalIndex = startIndex + event.charIndex;
            const percent = (currentGlobalIndex / fullText.length) * 100;
            
            if (Math.abs(percent - progress) > 0.1) {
                setProgress(percent);
            }
            setOffset(currentGlobalIndex);
            highlightParagraph(currentGlobalIndex);
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
          
          if (synthesisRef.current.paused) {
               synthesisRef.current.resume();
          }

          setIsPlaying(true);
        } catch (err) {
          console.error("Failed to start speaking:", err);
          setIsPlaying(false);
        }
    }, 50); 
  };

  const handlePlayPause = () => {
    if (!synthesisRef.current) return;
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

  // אם אין תמיכה בסיסי במנוע הקול, נחזיר דיב ריק או הודעה קטנה כדי לא להקריס
  if (typeof window !== 'undefined' && !window.speechSynthesis) {
    return null; 
  }

  return (
    <>
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

      {isPlaying && showStickyPlayer && (
        <button 
          onClick={handlePlayPause}
          className={`
            fixed z-[5000] flex items-center justify-center
            transition-all duration-500 ease-in-out shadow-lg
            ${isDesktop 
               ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-full px-4 py-2 gap-2'
               : 'bg-white/90 backdrop-blur-sm text-red-600 border border-gray-200 rounded-full p-3'
             }
          `}
          style={{
            bottom: isDesktop ? '90px' : 'auto', 
            top: isDesktop ? 'auto' : '50%',
            transform: isDesktop ? 'none' : 'translateY(-50%)', 
            right: isDesktop ? '4px' : 'auto', 
            left: isDesktop ? 'auto' : '16px', 
          }}
        >
          {isDesktop ? (
            <>
              <div className="relative">
                 <Volume2 size={18} className="animate-pulse" />
              </div>
              <span className="text-sm font-bold">עצור הקראה</span>
              <Pause size={18} fill="currentColor" />
            </>
          ) : (
            <div className="relative">
               <Pause size={24} fill="currentColor" />
               <div className="absolute -top-1 -right-0.2 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
          )}
        </button>
      )}
    </>
  );
}