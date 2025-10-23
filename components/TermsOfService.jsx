// components/TermsOfService.jsx
'use client';
import React from 'react';

export default function TermsOfService({ onClose, onAgree }) {
  return (
    <div className="mt-2 border border-gray-300 rounded-lg p-4 bg-white text-sm text-right shadow-md relative max-h-[70vh] overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-1 left-2 text-gray-500 hover:text-black text-lg"
      >
        ✖
      </button>

      <h3 className="text-base font-bold mb-3 text-[#e60000]">תנאי השימוש באתר</h3>

      <p className="mb-3 leading-relaxed">
        אתר <strong>OnMotor Media</strong> מספק מידע, חדשות ותכנים הקשורים לעולם הרכיבה והתחבורה.  
        השימוש באתר ובתכניו כפוף לתנאים המפורטים במסמך זה, ומהווה הסכמה מצד המשתמש לתנאים אלו.
      </p>

      <h4 className="font-bold mb-1 text-[#e60000]">1. שימוש באתר</h4>
      <p className="mb-3">
        אין לפרסם באתר תכנים פוגעניים, מאיימים, בלתי חוקיים או כאלה הפוגעים בזכויות יוצרים.  
        המשתמש אחראי בלעדית לתוכן אותו הוא מפרסם, לרבות תגובות, פוסטים ותמונות.
      </p>

      <h4 className="font-bold mb-1 text-[#e60000]">2. אחריות האתר</h4>
      <p className="mb-3">
        הנהלת האתר אינה אחראית לתוכן שיפורסם על ידי גולשים, למידע חיצוני או לקישורים לאתרים צד שלישי.  
        כל הסתמכות על מידע המפורסם באתר נעשית באחריות המשתמש בלבד.
      </p>

      <h4 className="font-bold mb-1 text-[#e60000]">3. זכויות יוצרים</h4>
      <p className="mb-3">
        כל זכויות היוצרים בתוכן האתר, לרבות טקסטים, תמונות, עיצוב וסימנים מסחריים, שייכות ל־OnMotor Media  
        ואין לעשות בהם שימוש ללא אישור מראש ובכתב.
      </p>

      <h4 className="font-bold mb-1 text-[#e60000]">4. שינוי תנאים</h4>
      <p className="mb-3">
        הנהלת האתר שומרת לעצמה את הזכות לשנות או לעדכן את תנאי השימוש מעת לעת.  
        גרסה מעודכנת תפורסם באתר ותיכנס לתוקף עם פרסומה.
      </p>

      <h4 className="font-bold mb-1 text-[#e60000]">5. יצירת קשר</h4>
      <p className="mb-3">
        בכל שאלה, הערה או בקשה ניתן ליצור קשר באמצעות הדוא"ל:
        <a
          href="mailto:onmotormedia@gmail.com"
          className="text-blue-600 underline ml-1"
        >
          onmotormedia@gmail.com
        </a>
      </p>

      <button
        onClick={() => {
          if (onAgree) onAgree();
          if (onClose) onClose();
        }}
        className="bg-[#e60000] text-white w-full py-2 rounded mt-3 hover:bg-red-700 transition"
      >
        אני מאשר את תנאי השימוש
      </button>
    </div>
  );
}
