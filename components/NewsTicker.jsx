// components/NewsTicker.jsx
'use client';
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

// 👇 מקבל נתונים כ-Prop
export default function NewsTicker({ headlines = [] }) {
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [shiftX, setShiftX] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const containerRef = useRef(null);
  const textRef = useRef(null);
  const animRef = useRef(null);

  // ❌ נמחק ה-useEffect של ה-Fetch

  // --- אפקט הקלדה ---
  useEffect(() => {
    if (!headlines || headlines.length === 0) return;

    const fullText = headlines[currentHeadline]?.text || "";
    setIsTyping(true);

    if (charIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }, 60);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
      const timeout = setTimeout(() => {
        setCharIndex(0);
        setDisplayedText('');
        setCurrentHeadline((prev) => (prev + 1) % headlines.length);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, currentHeadline, headlines]);

  // --- הזזה בזמן הקלדה (RTL → הזזה ימינה) ---
  useEffect(() => {
    if (!isTyping) return;
    if (!textRef.current || !containerRef.current) return;

    const textWidth = textRef.current.scrollWidth;
    const containerWidth = containerRef.current.clientWidth;

    if (textWidth > containerWidth) {
      const overflow = textWidth - containerWidth;
      setShiftX(overflow);
    } else {
      setShiftX(0);
    }
  }, [displayedText]);

  // --- אין תנועה אחרי סיום הקלדה ---
  useEffect(() => {
    if (!isTyping) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
  }, [isTyping]);

  if (!headlines || headlines.length === 0) return null;

  return (
    <div
      dir="rtl"
      // ✅ הסרנו את ה-fixed/sticky מכאן, כי ה-ClientLayout מטפל במיקום
      className="bg-[#e60000] w-full overflow-hidden relative"
      style={{ height: "20px" }}
    >
      <div className="relative flex items-center h-full px-2 text-white font-bold text-base md:text-lg whitespace-nowrap overflow-hidden">
        <span
          className="ml-2 text-sm shrink-0"
          style={{ height: "40px", lineHeight: "40px" }}
        >
          מה חדש:
        </span>

        <div
          ref={containerRef}
          className="relative flex-1 text-sm overflow-hidden"
          style={{ height: "40px", lineHeight: "40px", direction: "rtl" }}
        >
          <Link
            ref={textRef}
            href={headlines[currentHeadline].link}
            prefetch={false}
            className="absolute right-0 top-0 transition-transform duration-75 ease-linear"
            style={{
              transform: `translateX(${shiftX}px)`,
              whiteSpace: "nowrap",
            }}
          >
            {displayedText}
            <span className="animate-pulse">|</span>
          </Link>
        </div>
      </div>
    </div>
  );
}