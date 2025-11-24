//components/NewsTicker.jsx
'use client';
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export default function NewsTicker() {
  const [headlines, setHeadlines] = useState([]);
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [shiftX, setShiftX] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const containerRef = useRef(null);
  const textRef = useRef(null);
  const animRef = useRef(null);

  // --- טעינת כותרות ---
  useEffect(() => {
    async function fetchHeadlines() {
      try {
        const url = `${API_URL}/api/articles?filters[$or][0][tags_txt][$contains]=חדשנות&filters[$or][1][tags_txt][$contains]=2025&filters[$or][2][tags_txt][$contains]=חוק וסדר&sort=publishedAt:desc`;
        const res = await fetch(url);
        const data = await res.json();

        if (data?.data?.length > 0) {
          const mapped = data.data.map((article) => {
            const attrs = article.attributes || article;
            return {
              text: attrs.headline || attrs.title || "כתבה ללא כותרת",
              link: `/articles/${attrs.slug}`,
            };
          });
          setHeadlines(mapped);
        }
      } catch (err) {
        console.error("❌ שגיאה בטעינת ניוזטיקר:", err);
      }
    }
    fetchHeadlines();
  }, []);

  // --- אפקט הקלדה ---
  useEffect(() => {
    if (!headlines.length) return;

    const fullText = headlines[currentHeadline].text || "";
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
      setShiftX(overflow); // ← הזזה ימינה בעברית
    } else {
      setShiftX(0);
    }
  }, [displayedText]);

  // --- אין תנועה אחרי סיום הקלדה ---
  useEffect(() => {
    if (!isTyping) {
      cancelAnimationFrame(animRef.current);
    }
  }, [isTyping]);

  if (!headlines.length) return null;

  return (
    <div
      dir="rtl"
      className="sticky top-0 z-40 bg-[#e60000] w-full fixed top-[80px] z-[40] overflow-hidden"
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
