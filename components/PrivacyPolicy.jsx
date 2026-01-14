// components/PrivacyPolicy.jsx
'use client';
import React, { useState } from 'react';

export default function PrivacyPolicy({ onClose, onAgree }) {
  // ניהול המצב של ה-Checkbox
  const [isChecked, setIsChecked] = useState(false);

  const handleAgree = () => {
    if (!isChecked) return;
    if (onAgree) onAgree();
    if (onClose) onClose();
  };

  return (
    <div className="mt-2 border border-gray-300 text-gray-900 rounded-lg p-4 bg-white text-sm text-right shadow-md relative max-h-[70vh] flex flex-col">
      
      {/* כפתור סגירה (רק אם מועבר onClose - כלומר במודל) */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-1 left-2 text-gray-500 hover:text-black text-lg z-10"
        >
          ✖
        </button>
      )}

      {/* אזור התוכן - עם גלילה */}
      <div className="overflow-y-auto pl-2 mb-4 custom-scrollbar">
        <h3 className="text-base font-bold mb-3 text-[#e60000]">מדיניות פרטיות המידע</h3>

        <p className="mb-3 leading-relaxed">
          אתר <strong>OnMotor Media</strong> מכבד את פרטיות הגולשים ופועל בהתאם להוראות חוק הגנת הפרטיות ולתקנות
          החלות בנושא. מטרת מסמך זה היא להבהיר כיצד אנו אוספים, שומרים ומשתמשים במידע שנמסר על ידי המשתמשים באתר.
        </p>

        <h4 className="font-bold mb-1 text-[#e60000]">1. איסוף מידע</h4>
        <p className="mb-3">
          בעת השימוש באתר, אנו עשויים לאסוף מידע שמוסר המשתמש באופן יזום (כגון כתובת אימייל לצורך הרשמה לניוזלטר)
          וכן מידע טכני הנאסף אוטומטית (כגון סוג דפדפן, כתובת IP, וזמני ביקור באתר).
        </p>

        <h4 className="font-bold mb-1 text-[#e60000]">2. שימוש במידע</h4>
        <div className="mb-3">
          המידע שנאסף ישמש למטרות הבאות בלבד:
          <ul className="list-disc pr-5 mt-1">
            <li>שיפור חוויית המשתמש באתר.</li>
            <li>שליחת עדכונים וחדשות (בכפוף להסכמת המשתמש).</li>
            <li>ניתוח סטטיסטי של שימוש באתר לצורכי תחזוקה ושיפור.</li>
          </ul>
        </div>

        <h4 className="font-bold mb-1 text-[#e60000]">3. שיתוף מידע עם צדדים שלישיים</h4>
        <p className="mb-3">
          האתר אינו משתף מידע אישי עם גורמים חיצוניים, למעט במקרים שבהם נדרש על פי דין או לשם מתן שירותים טכנולוגיים
          חיוניים (כגון אחסון נתונים או מערכות דיוור), וזאת תוך שמירה על סודיות המידע.
        </p>

        <h4 className="font-bold mb-1 text-[#e60000]">4. אבטחת מידע</h4>
        <p className="mb-3">
          אנו נוקטים באמצעי אבטחה סבירים ומתקדמים על מנת להגן על המידע שבמערכות האתר מפני גישה בלתי מורשית, שימוש לרעה או חשיפה.
        </p>

        <h4 className="font-bold mb-1 text-[#e60000]">5. עוגיות (Cookies)</h4>
        <p className="mb-3">
          האתר משתמש בקובצי Cookies לצורך תפעול תקין, התאמת האתר להעדפות המשתמש ושיפור השירות. ניתן לשנות את הגדרות הדפדפן
          כך שיחסום Cookies, אך ייתכן שחלק מהפונקציות באתר לא יפעלו כראוי.
        </p>

        <h4 className="font-bold mb-1 text-[#e60000]">6. פנייה בנושאי פרטיות</h4>
        <p className="mb-3">
          בכל שאלה או בקשה הנוגעת למדיניות פרטיות זו ניתן לפנות אלינו בכתובת המייל:
          <a
            href="mailto:onmotormedia@gmail.com"
            className="text-blue-600 underline ml-1"
          >
            onmotormedia@gmail.com
          </a>
        </p>

        <h4 className="font-bold mb-1 text-[#e60000]">7. עדכונים למדיניות</h4>
        <p className="mb-3">
          הנהלת האתר רשאית לעדכן את מדיניות הפרטיות מעת לעת. גרסה מעודכנת תפורסם באתר ותיכנס לתוקף מיד עם פרסומה.
        </p>
      </div>

      {/* אזור האישור התחתון - קבוע בתחתית */}
      <div className="pt-4 border-t border-gray-200 mt-auto bg-gray-50 -mx-4 -mb-4 p-4 rounded-b-lg">
        <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
          <input 
            type="checkbox" 
            className="w-4 h-4 text-[#e60000] rounded border-gray-300 focus:ring-[#e60000]"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          <span className="text-sm font-medium text-gray-700">
            קראתי והבנתי את מדיניות הפרטיות
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
          אני מאשר את מדיניות הפרטיות
        </button>
      </div>

    </div>
  );
}