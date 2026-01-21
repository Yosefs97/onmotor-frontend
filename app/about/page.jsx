// app/about/page.jsx
import React from 'react';
import PageContainer from '@/components/PageContainer';
import AboutTeam from '@/components/AboutTeam';
import { FaWhatsapp } from 'react-icons/fa'; // ✅ הוספתי את האייקון

export const metadata = {
  title: 'אודות | OnMotor Media',
  description: 'הכירו את הצוות שמאחורי מגזין האופנועים OnMotor Media.',
  openGraph: {
    title: 'אודות | OnMotor Media',
    description: 'הכירו את הצוות שמאחורי המגזין .',
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

        {/* טקסט אודות המגזין */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-[#e60000] mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">על המגזין</h2>
          <div className="text-gray-700 leading-relaxed space-y-4 text-lg">
            <p>
              מגזין <strong>OnMotor Media</strong> הוקם במטרה להוות בית מקצועי, עדכני ואובייקטיבי לקהילת הרוכבים בישראל. 
              אנו מסקרים את עולם הדו-גלגלי על כל גווניו החל מאופנועי ספורט וכביש, אדוונצ'ר ותיור דרך קטנועים עירוניים ועד לכלים המיועדים לשטח ולפנאי.
            </p>
            
            
            {/* פרטי יצירת קשר + וואטסאפ */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-base text-gray-600 flex flex-col gap-2">
              <div>
                 <strong>דוא"ל ליצירת קשר:</strong>{' '}
                 <a href="mailto:onmotormedia@gmail.com" className="hover:text-[#e60000] transition-colors">
                   onmotormedia@gmail.com
                 </a>
              </div>
              
              {/* ✅ כאן השינוי: הפניה לוואטסאפ */}
              <div className="flex items-center gap-2">
                 <strong>וואטסאפ למערכת:</strong>
                 <a 
                   href="https://wa.me/972522304604" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-1 text-[#25D366] font-bold hover:underline"
                 >
                   <FaWhatsapp size={20} />
                   052-230-4604
                 </a>
              </div>
            </div>
          </div>
        </div>

        {/* הצגת הצוות */}
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-gray-900 border-r-4 border-[#e60000] pr-3">
           האנשים מאחורי המגזין
          </h2>
          <AboutTeam />
        </div>

      </div>
    </PageContainer>
  );
}