'use client';
import React from 'react';
import ArticleShare from './ArticleShare';

export default function ArticleHeader({
  author = "מערכת OnMotor",
  date = "22.06.2025",
  time = "10:00",
  image, // ⭐️ זה ה-prop החשוב
  // imageSrc, // 🛑 הוסר, לא נחוץ יותר
  imageAlt = "תמונה ראשית",
  title = "כותרת כתבה",
  subdescription = "",
}) {
  
  // --- ⭐️ לוגיקה חדשה ופשוטה ⭐️ ---
  // אנו מקבלים URL מוכן מהקומפוננטה-האב (ArticlePage.jsx)
  const finalImage = image || "/images/default-article.jpg";
  // --- ⭐️ סוף לוגיקה ⭐️ ---

  return (
    <div className="flex flex-col gap-4 mb-6 text-gray-800 text-right">
      {/* 🖼️ תמונה ראשית */}
      <div className="w-full max-h-[500px] overflow-hidden   ">
        <img
          src={finalImage}
          alt={imageAlt}
          className="w-full object-cover"
        />
      </div>

      {/* 🟣 כותרת ראשית בתוך הכתבה */}
      <h1 className="text-3xl font-bold leading-snug">{title}</h1>

      {/* 🟡 subdescription */}
      {subdescription && (
        <p className="text-xl font-semibold text-gray-700">{subdescription}</p>
      )}

      {/* 🟤 מחבר, זמן, קו אפור */}
      <div className="flex flex-wrap gap-3 text-sm text-gray-500 items-center border-b border-gray-300 pb-2">
        <span>🖊️ מחבר: <span className="text-gray-800 font-semibold">{author}</span></span>
        <span className="text-xs font-medium text-gray-700">
          🕒 {date} | {time}
        </span>
        <span>🎥 צילום: <span className="text-gray-800 font-semibold">{author}</span></span>
        <span className="ml-auto text-xs text-blue-600 underline cursor-pointer hover:text-blue-800">
          עבור לגריד 🔁
        </span>
        {/* כפתור שיתוף נוסף לצד המידע */}
        <div className="ml-auto">
          <ArticleShare />
        </div>
      </div>
    </div>
  );
}