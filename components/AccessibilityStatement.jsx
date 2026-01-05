// components/AccessibilityStatement.jsx
'use client';
import React from 'react';

export default function AccessibilityStatement() {
  return (
    <div className="text-gray-800 text-sm md:text-base leading-relaxed space-y-4 text-right">
      <section>
        <p>
          מגזין <strong>OnMotor Media</strong> הוא עסק המספק מידע עיתונאי ומגזיני בתחום הדו-גלגלי – אופנועים וקטנועים.
          אנו רואים חשיבות עליונה במתן שירות שוויוני לכלל הגולשים ובשיפור השירות לאנשים בעלי מוגבלויות. אנו משקיעים משאבים רבים בהנגשת האתר והתכנים בו, במטרה להקל על השימוש בו ולהפוך אותו לזמין ונוח לכולם.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-bold text-[#e60000] mb-2">רמת הנגישות</h3>
        <p>
          התאמת הנגישות באתר בוצעה בהתאם לתקנה 35 בתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות) התשע"ג 2013, לרמה AA, ובכפוף לשינויים והתאמות שבוצעו במסמך התקן הישראלי (ת"י 5568).
          האתר נבדק ומותאם לגלישה בדפדפנים הנפוצים: כרום, פיירפוקס, ספארי, אדג' ועוד.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-bold text-[#e60000] mb-2">אמצעי נגישות ושימוש ברכיב הנגישות</h3>
        <p className="mb-2">
          באתר מוטמע רכיב נגישות מתקדם (סרגל צד) המאפשר התאמה אישית של התצוגה. להלן רשימת הכלים וקיצורי המקלדת הזמינים:
        </p>
        
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 p-4 rounded border border-gray-200 text-sm">
          <li><strong>ESC:</strong> ניווט מקלדת / יציאה</li>
          <li><strong>Shift + A:</strong> ביטול הבהובים</li>
          <li><strong>Shift + B:</strong> מונוכרום (שחור לבן)</li>
          <li><strong>Shift + C:</strong> ספיה (גוון חום)</li>
          <li><strong>Shift + D:</strong> ניגודיות גבוהה</li>
          <li><strong>Shift + E:</strong> שחור צהוב</li>
          <li><strong>Shift + F:</strong> היפוך צבעים</li>
          <li><strong>Shift + G:</strong> הדגשת כותרות</li>
          <li><strong>Shift + H:</strong> הדגשת קישורים</li>
          <li><strong>Shift + I:</strong> הצגת תיאור (Tooltip)</li>
          <li><strong>Shift + K:</strong> גופן קריא</li>
          <li><strong>Shift + L/M:</strong> הגדלת/הקטנת גופן</li>
          <li><strong>Shift + R:</strong> מצב קריאה</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-[#e60000] mb-2">סייגים לנגישות</h3>
        <p>
          למרות מאמצנו להנגיש את כלל הדפים באתר, ייתכן ויתגלו חלקים ספציפיים שטרם הונגשו במלואם (כגון מסמכים ישנים או מודעות חיצוניות). אנו ממשיכים במאמצים לשפר את נגישות האתר באופן קבוע.
        </p>
      </section>

      <section className="bg-gray-100 p-5 rounded-lg border-r-4 border-[#e60000] mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">פרטי רכז נגישות</h3>
        <p className="mb-1">נתקלתם בבעיה? נשמח לעמוד לשירותכם:</p>
        <ul className="list-none space-y-1 font-medium">
          <li>שם: יוסף סבג</li>
          <li>
            דוא"ל: <a href="mailto:yosefsabag46@gmail.com" className="text-blue-600 hover:underline">yosefsabag46@gmail.com</a>
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          תאריך עדכון: 05/01/2026
        </p>
      </section>
    </div>
  );
}