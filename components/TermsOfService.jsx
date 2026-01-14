// components/TermsOfService.jsx
'use client';
import React, { useState, useEffect } from 'react';

export default function TermsOfService({ onClose, onAgree }) {
  // ניהול המצב של ה-Checkbox
  const [isChecked, setIsChecked] = useState(false);
  const [hasSavedConsent, setHasSavedConsent] = useState(false); // האם כבר נשמר בעבר?

  // בדיקה בטעינה אם המשתמש כבר אישר בעבר
  useEffect(() => {
    const saved = localStorage.getItem('termsAccepted');
    if (saved === 'true') {
      setIsChecked(true);
      setHasSavedConsent(true);
    }
  }, []);

  const handleAgree = () => {
    if (!isChecked) return;
    
    // שמירת האישור בזיכרון הדפדפן
    localStorage.setItem('termsAccepted', 'true');
    setHasSavedConsent(true);

    if (onAgree) onAgree();
    if (onClose) onClose();
  };

  return (
    <div className="mt-2 border border-gray-300 text-gray-900 rounded-lg p-4 bg-white text-sm text-right shadow-md relative max-h-[70vh] flex flex-col">
      
      {/* כפתור סגירה - מופיע רק אם הועברה פונקציית סגירה */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-1 left-2 text-gray-500 hover:text-black text-lg z-10"
        >
          ✖
        </button>
      )}

      {/* אזור התוכן הנגלל */}
      <div className="overflow-y-auto pl-2 mb-4 custom-scrollbar">
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
      </div>

      {/* אזור האישור התחתון (Footer) */}
      <div className="pt-4 border-t border-gray-200 mt-auto bg-gray-50 -mx-4 -mb-4 p-4 rounded-b-lg">
        
        {hasSavedConsent ? (
          <div className="text-center text-green-600 font-bold py-2 bg-green-50 rounded border border-green-200">
            ✓ אישרת את תנאי השימוש
          </div>
        ) : (
          <>
            <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-[#e60000] rounded border-gray-300 focus:ring-[#e60000]"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              <span className="text-sm font-medium text-gray-700">
                קראתי והסכמתי לתנאי השימוש
              </span>
            </label>

            <button
              onClick={handleAgree}
              disabled={!isChecked}
              className={`w-full py-2 rounded font-bold transition-all duration-200
                ${isChecked 
                  ? 'bg-[#e60000] text-white hover:bg-red-700 shadow-md' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              אני מאשר את תנאי השימוש
            </button>
          </>
        )}
      </div>
    </div>
  );
}