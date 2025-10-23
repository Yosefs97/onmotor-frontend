// app/data-deletion-instructions/page.jsx
export const metadata = {
  title: 'בקשת מחיקת נתונים | OnMotor Media',
  description: 'הוראות למחיקת נתונים אישיים בהתאם למדיניות הפרטיות של OnMotor Media.',
  openGraph: {
    title: 'בקשת מחיקת נתונים | OnMotor Media',
    description: 'כיצד לבקש מחיקת מידע אישי מהמערכת של OnMotor Media בהתאם להנחיות פייסבוק ו-GDPR.',
    url: 'https://www.onmotormedia.com/data-deletion-instructions',
    siteName: 'OnMotor Media',
    locale: 'he_IL',
    type: 'article',
    images: [
      {
        url: 'https://www.onmotormedia.com/full_Logo.jpg',
        width: 1200,
        height: 630,
        alt: 'OnMotor Media - מחיקת נתונים',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'בקשת מחיקת נתונים | OnMotor Media',
    description: 'דף הנחיות למחיקת נתוני משתמשים בהתאם למדיניות פרטיות OnMotor Media.',
    images: ['https://www.onmotormedia.com/full_Logo.jpg'],
  },
};

import React from 'react';
import PageContainer from '@/components/PageContainer';

export default function DataDeletionInstructionsPage() {
  return (
    <PageContainer>
      <div dir="rtl" className="max-w-3xl mx-auto bg-white rounded-lg p-6 mt-6 shadow">
        <h1 className="text-2xl font-bold text-[#e60000] mb-4 text-center">
          בקשת מחיקת נתונים
        </h1>

        <p className="text-sm text-gray-900 leading-relaxed mb-3">
          אנו ב־<strong>OnMotor Media</strong> מכבדים את פרטיות המשתמשים ופועלים לפי הנחיות פייסבוק ו־GDPR.
          אם ברצונך למחוק את הנתונים שלך או את התגובות שפרסמת דרך פייסבוק באתר,
          ניתן לשלוח בקשה למחיקה לפי ההוראות שלהלן.
        </p>

        <h2 className="font-bold text-[#e60000] mb-2">כיצד לבקש מחיקת נתונים</h2>
        <ul className="list-disc text-gray-900 pr-5 mb-4 text-sm leading-relaxed">
          <li>שלח דוא"ל לכתובת: <a href="mailto:onmotormedia@gmail.com" className="text-blue-600 underline">onmotormedia@gmail.com</a></li>
          <li>בכותרת המייל כתוב: <strong>"בקשה למחיקת נתוני פייסבוק"</strong></li>
          <li>בגוף ההודעה ציין:
            <ul className="list-decimal text-gray-900 pr-5 mt-1">
              <li>שמך המלא כפי שמופיע בפייסבוק.</li>
              <li>קישור לתגובה או לפוסט שבו הופיעו הנתונים שברצונך למחוק.</li>
              <li>הצהרה שאתה מבקש למחוק את המידע בהתאם לחוקי הפרטיות.</li>
            </ul>
          </li>
        </ul>

        <p className="text-sm text-gray-900 mb-3">
          עם קבלת הבקשה, צוות OnMotor Media יבחן את הפנייה ויפעל למחיקת הנתונים הרלוונטיים בתוך 14 ימי עסקים.
        </p>

        <p className="text-sm text-gray-700 italic">
          דף זה נועד לעמוד בדרישות פייסבוק בנושא מחיקת נתוני משתמשים מאפליקציות צד שלישי,
          והוא אינו מיועד למחיקת חשבון או הרשמות אחרות באתר.
        </p>
      </div>
    </PageContainer>
  );
}
