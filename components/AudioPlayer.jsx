'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

export default function AudioPlayer({ 
  text, 
  authorName = "OnMotor Media", 
  authorImage = "/logo.png" 
}) {
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 עד 100
  const [rate, setRate] = useState(1); // מהירות: 1, 1.5, 2
  const synthesisRef = useRef(null);
  const utteranceRef = useRef(null);

  useEffect(() => {
    // אתחול ה-API כשהקומפוננטה עולה
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis;
    }

    // ניקוי ביציאה מהעמוד (מפסיק דיבור)
    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if (!synthesisRef.current) return;

    if (synthesisRef.current.paused && synthesisRef.current.speaking) {
      synthesisRef.current.resume();
      setIsPlaying(true);
      return;
    }

    if (synthesisRef.current.speaking) {
      handlePause();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    utterance.rate = rate;

    // אירוע שקורה בכל מילה - מעדכן את הפרוגרס בר
    utterance.onboundary = (event) => {
      const charIndex = event.charIndex;
      const textLength = text.length;
      const percent = (charIndex / textLength) * 100;
      setProgress(percent);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
    };

    utteranceRef.current = utterance;
    synthesisRef.current.speak(utterance);
    setIsPlaying(true);
  };

  const handlePause = () => {
    if (synthesisRef.current) {
      synthesisRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleSpeed = () => {
    const nextRate = rate === 1 ? 1.5 : rate === 1.5 ? 2 : 1;
    setRate(nextRate);
    
    if (isPlaying && synthesisRef.current) {
      synthesisRef.current.cancel();
      setTimeout(handlePlay, 100);
    }
  };

  return (
    // הוספתי dir="ltr" כדי לשמור על המבנה של נגן, אבל אפשר להסיר אם תרצה שזה יהיה מימין לשמאל
    <div className="flex items-center gap-3 bg-[#f0f2f5] p-3 rounded-xl max-w-md w-full shadow-sm border border-gray-200" dir="ltr">
      
      {/* תמונת פרופיל */}
      <div className="relative w-12 h-12 flex-shrink-0">
        <img 
          src={authorImage} 
          alt="Avatar" 
          className="w-full h-full rounded-full object-cover"
        />
        <div className="absolute bottom-0 right-0 bg-[#00a884] p-0.5 rounded-full border-2 border-white flex items-center justify-center w-4 h-4">
           {/* אייקון מיקרופון מינימליסטי */}
           <div className="w-2 h-2 bg-white rounded-full"></div> 
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-1">
        {/* כפתור ניגון וסליידר */}
        <div className="flex items-center gap-3">
          <button 
            onClick={isPlaying ? handlePause : handlePlay}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            {isPlaying ? (
              <Pause size={28} fill="currentColor" className="text-gray-600" />
            ) : (
              <Play size={28} fill="currentColor" className="text-gray-600 ml-1" />
            )}
          </button>

          {/* סליידר ויזואלי */}
          <div className="relative w-full h-1.5 bg-gray-300 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-[#00a884] transition-all duration-300 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* טקסט תחתון */}
        <div className="flex justify-between text-xs text-gray-500 px-1">
          <span>{isPlaying ? 'מקריא...' : 'האזנה לכתבה'}</span>
          <span>{authorName}</span>
        </div>
      </div>

      {/* כפתור מהירות */}
      <button 
        onClick={toggleSpeed}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold px-2 py-1.5 rounded-full min-w-[3rem] transition"
      >
        {rate}x
      </button>
    </div>
  );
}