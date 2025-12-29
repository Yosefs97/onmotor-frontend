// app/laws/page.jsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PageContainer from '@/components/PageContainer';

// פונקציה מדומה לשליפת פרסומות (בעתיד תחליף את זה בקריאה ל-Strapi)
async function getLawAds() {
  // כאן תהיה הקריאה ל-API: fetch(`${API_URL}/api/ads?filters[category]=law...`)
  return [
    {
      id: 1,
      title: "משרד עו״ד תעבורה כהן ושות׳",
      image: "/ads/lawyer1.jpg", // שים כאן תמונה זמנית לבדיקה
      link: "https://example.com",
      description: "מתמחים בדיני תעבורה, דוחות ומהירות מופרזת."
    },
    {
      id: 2,
      title: "ביטוח ישיר לאופנועים",
      image: "/ads/insurance.jpg",
      link: "https://example.com",
      description: "המחיר המשתלם ביותר לביטוח חובה ומקיף."
    },
    {
      id: 3,
      title: "המרכז לבטיחות בדרכים",
      image: "/ads/safety.jpg",
      link: "https://example.com",
      description: "קורסים והשתלמויות לנהיגה בטוחה."
    },
    {
      id: 4,
      title: "שמאי רכב מומחה",
      image: "/ads/assessor.jpg",
      link: "https://example.com",
      description: "הערכות נזק וחוות דעת משפטיות לאופנועים."
    },
  ];
}

export const metadata = {
  title: 'חוקים ומשפט | OnMotor Media',
  description: 'ריכוז מידע בנושאי חוקי תעבורה, ספר החוקים של הרלב"ד וכתבות בנושא חוקיות.',
};

export default async function LawsPage() {
  const ads = await getLawAds();

  const categories = [
    { title: 'כתבות בנושא חוקיות', href: '/laws/legal-articles', desc: 'מאמרים, עדכונים וחדשות בנושאי חוק ומשפט לרוכבים.' },
    { title: 'שאל את הרלב"ד', href: '/laws/ask-question', desc: 'יש לך שאלה? מומחי הרלב"ד עונים לשאלות הגולשים.' },
    { title: 'ספר החוקים - רלב״ד', href: '/laws/book', desc: 'עיון מלא בספר החוקים ותקנות התעבורה.' },
  ];

  return (
    <PageContainer
      title="חוקים ומשפט"
      breadcrumbs={[{ label: 'דף הבית', href: '/' }, { label: 'חוקים' }]}
    >
      {/* --- אזור הקטגוריות העליון --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-12">
        {categories.map((cat, index) => (
          <Link 
            key={index} 
            href={cat.href}
            className="
              block p-6 border border-gray-200 rounded-lg transition-all group
              hover:border-[#e60000] hover:shadow-md
              bg-white
            "
          >
            {/* שינוי צבעים למובייל:
                text-[#e60000] = אדום במובייל
                md:text-gray-900 = שחור/אפור במחשב
            */}
            <h2 className="text-xl font-bold mb-2 text-[#e60000] md:text-gray-900 group-hover:text-[#e60000]">
              {cat.title}
            </h2>
            <p className="text-[#e60000] md:text-gray-600">
              {cat.desc}
            </p>
          </Link>
        ))}
      </div>

      {/* --- אזור פרסומות / נותני שירות (רק במחשב או גם במובייל לפי בחירה) --- */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 border-r-4 border-[#e60000] pr-3">
          נותני שירות מומלצים
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {ads.map((ad) => (
            <a 
              key={ad.id} 
              href={ad.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block group bg-gray-50 rounded-lg overflow-hidden border border-transparent hover:border-gray-300 transition-all"
            >
              {/* מקום לתמונה (Placeholder) */}
              <div className="relative w-full h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
                 {/* אם יש תמונה אמיתית תשתמש ב-Image, אחרת טקסט */}
                 <span className="text-gray-400 font-bold">מקום לפרסומת</span>
                 {/* <Image 
                   src={ad.image} 
                   alt={ad.title} 
                   fill 
                   className="object-cover group-hover:scale-105 transition-transform duration-500" 
                 /> 
                 */}
              </div>

              <div className="p-4">
                <h4 className="font-bold text-lg text-gray-800 group-hover:text-[#e60000] mb-1">
                  {ad.title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {ad.description}
                </p>
                <div className="mt-3 text-sm font-semibold text-[#e60000] flex items-center gap-1">
                  לפרטים נוספים 
                  <span>←</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}