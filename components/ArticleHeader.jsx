// components/ArticleHeader.jsx
'use client';
import React from 'react';
import Link from 'next/link';
import ArticleShare from './ArticleShare';

export default function ArticleHeader({
  author = "מערכת OnMotor",
  date = "22.06.2025",
  time = "10:00",
  image,
  imageAlt = "תמונה ראשית",
  title = "כותרת כתבה",
  subdescription = "",
  tags = [],
  photoCredit = "", // 1️⃣ השדה החדש
}) {
  const finalImage = image || "/images/default-article.jpg";

  // 2️⃣ הלוגיקה המעודכנת:
  // שלב א: שולפים את התג הראשון, אבל רק אם הוא לא סתם רווחים
  const validTag = (tags.length > 0 && tags[0].trim() !== "") ? tags[0] : null;

  // שלב ב: הסדר הקובע -> שדה חדש, ואם אין -> תגית תקינה, ואם אין -> מחבר
  const photographer = photoCredit || validTag || author;

  return (
    <div className="flex flex-col gap-4 mb-6 text-gray-800 text-right">
      {/* 🖼️ תמונה ראשית */}
      <div className="w-full max-h-[500px] overflow-hidden">
        <img
          src={finalImage}
          alt={imageAlt}
          className="w-full object-cover"
        />
      </div>

      {/* 🟣 כותרת ראשית */}
      <h1 className="text-3xl font-bold leading-snug">{title}</h1>

      {/* 🟡 תת-כותרת */}
      {subdescription && (
        <p className="text-xl font-semibold text-gray-700">{subdescription}</p>
      )}

      {/* 🟤 שורת פרטים (מחבר, זמן, צלם, תגיות) */}
      <div className="flex flex-wrap gap-3 text-sm text-gray-500 items-center border-b border-gray-300 pb-2">
        
        <span>
            🖊️ מחבר:{" "}
            <Link 
              href="/about" 
              className="text-blue-600 underline font-semibold hover:text-blue-800 transition-colors cursor-pointer"
              title="קרא עוד עלינו בדף האודות"
            >
              {author}
            </Link>
        </span>

        <span className="text-xs font-medium text-gray-700">
          🕒 {date} | {time}
        </span>
        
        {/* הצגת הצלם הסופי */}
        <span>🎥 צילום: <span className="text-gray-800 font-semibold">{photographer}</span></span>
        
        <Link 
          href="/tags" 
          prefetch={false}
          className="ml-auto text-xs text-blue-600 underline cursor-pointer hover:text-blue-800"
        >
          אינדקס תגיות
        </Link>

        <div className="ml-2">
          <ArticleShare />
        </div>
      </div>
    </div>
  );
}