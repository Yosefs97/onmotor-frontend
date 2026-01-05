// app/about/page.jsx
import React from 'react';
import PageContainer from '@/components/PageContainer';
import AboutTeam from '@/components/AboutTeam';

export const metadata = {
  title: 'אודות | OnMotor Media',
  description: 'הכירו את הצוות שמאחורי מגזין האופנועים OnMotor Media.',
  openGraph: {
    title: 'אודות | OnMotor Media',
    description: 'הכירו את הצוות שמאחורי מגזין האופנועים המוביל בישראל.',
    url: 'https://www.onmotormedia.com/about',
    siteName: 'OnMotor Media',
    images: [
      {
        url: 'https://www.onmotormedia.com/full_Logo_v2.jpg',
        width: 1200,
        height: 630,
        alt: 'OnMotor Media Team',
      },
    ],
  },
};

export default function AboutPage() {
  return (
    <PageContainer>
      <div dir="rtl" className="max-w-5xl mx-auto py-8 px-4">
        
        {/* כותרת ראשית */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[#e60000] mb-4">
            מי אנחנו?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            מגזין אופנועים ישראלי שנולד מאהבה לכביש, לשטח ולמכונה.
          </p>
        </div>

        {/* טקסט אודות המגזין - חשוב לאישור כ"דף חדשות" בפייסבוק */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-[#e60000] mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">על המגזין</h2>
          <div className="text-gray-700 leading-relaxed space-y-4 text-lg">
            <p>
              מגזין <strong>OnMotor Media</strong> הוקם במטרה להוות בית מקצועי, עדכני ואובייקטיבי לקהילת הרוכבים בישראל. 
              אנו מסקרים את עולם הדו-גלגלי על כל גווניו – החל מאופנועי ספורט וכביש, דרך קטנועים עירוניים ועד לכלים המיועדים לשטח ולפנאי.
            </p>
            <p>
              הצוות שלנו מורכב מרוכבים מנוסים, מכונאים ואנשי תוכן שחיים את התחום 24/7. 
              המטרה שלנו היא להביא לקורא הישראלי מבחני דרכים מעמיקים, חדשות מהארץ ומהעולם, סיקור טכנולוגי ומידע חיוני על בטיחות, ציוד ורכיבה נכונה.
            </p>
            
            {/* כתובת פיזית/יצירת קשר - קריטי לאימות בפייסבוק */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500">
              <strong>כתובת המערכת:</strong> [הוסף כאן כתובת או תא דואר אם יש]<br />
              <strong>דוא"ל ליצירת קשר:</strong> onmotormedia@gmail.com
            </div>
          </div>
        </div>

        {/* הצגת הצוות */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 border-r-4 border-[#e60000] pr-3">
            הצוות שלנו
          </h2>
          <AboutTeam />
        </div>

      </div>
    </PageContainer>
  );
}