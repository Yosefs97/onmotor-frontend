// app/laws/page.jsx
import React from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import AdCarousel from '@/components/AdCarousel';

// כתובת ה-API
// שימוש בכתובת ישירה כ-Fallback למקרה שהמשתנה לא מוגדר ברנדר
const API_URL = process.env.STRAPI_API_URL || 'https://onmotor-strapi.onrender.com';
const COLLECTION_NAME = 'service-ads';

async function getLawAds() {
  try {
    // שליפת הנתונים עם populate כדי לקבל גם את התמונות
    const res = await fetch(`${API_URL}/api/${COLLECTION_NAME}?populate=*`, {
      next: { revalidate: 600 }
    });

    if (!res.ok) {
      console.error("API Error:", res.status, res.statusText);
      return [];
    }

    const json = await res.json();
    
    // בדיקה שהתקבל מערך
    if (!json.data || !Array.isArray(json.data)) return [];

    return json.data.map(item => {
      // ✅ תיקון ל-Strapi v5: עבודה ישירה מול האובייקט (ללא attributes)
      
      // חילוץ ה-URL של התמונה
      let imageUrl = null;
      // ב-v5 התמונה יכולה להיות ישירות תחת item.image
      if (item.image) {
        // לפעמים זה מערך ולפעמים אובייקט בודד, תלוי בהגדרה בסטראפי
        const imgData = Array.isArray(item.image) ? item.image[0] : item.image;
        
        if (imgData && imgData.url) {
             const url = imgData.url;
             imageUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
        }
      }

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        link: item.link,
        category: item.category, // השדה שהגדרת (lawyer, insurance...)
        image: { url: imageUrl }
      };
    });
  } catch (error) {
    console.error("Failed to fetch ads:", error);
    return [];
  }
}

export const metadata = {
  title: 'חוקים ומשפט | OnMotor Media',
  description: 'ריכוז מידע בנושאי חוקי תעבורה, ספר החוקים של הרלב"ד וכתבות בנושא חוקיות.',
};

export default async function LawsPage() {
  const ads = await getLawAds();

  // סינון המודעות לקטגוריות השונות
  const lawyers = ads.filter(ad => ad.category === 'lawyer');
  const insurance = ads.filter(ad => ad.category === 'insurance');
  const proSchools = ads.filter(ad => ad.category === 'pro_riding');
  const drivingSchools = ads.filter(ad => ad.category === 'driving_school');

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
      {/* אזור הקטגוריות העליון */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mb-12">
        {categories.map((cat, index) => (
          <Link 
            key={index} 
            href={cat.href}
            className="block p-6 border border-gray-200 rounded-xl transition-all group hover:border-[#e60000] hover:shadow-lg bg-white"
          >
            <h2 className="text-xl font-bold mb-3 text-[#e60000] md:text-gray-900 group-hover:text-[#e60000]">
              {cat.title}
            </h2>
            <p className="text-[#e60000] md:text-gray-600 leading-relaxed">
              {cat.desc}
            </p>
          </Link>
        ))}
      </div>

      {/* אזור הפרסומות הדינמי */}
      {ads.length > 0 && (
        <div className="border-t border-gray-200 pt-8 pb-12">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
            נותני שירות מומלצים
          </h2>
          
          {lawyers.length > 0 && <AdCarousel title="עורכי דין מהתחום" items={lawyers} />}
          {insurance.length > 0 && <AdCarousel title="סוכני ביטוח מהקהילה" items={insurance} />}
          {proSchools.length > 0 && <AdCarousel title="בתי ספר לרכיבה מקצועית" items={proSchools} />}
          {drivingSchools.length > 0 && <AdCarousel title="בתי ספר לנהיגה" items={drivingSchools} />}
        </div>
      )}
    </PageContainer>
  );
}