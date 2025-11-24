// app/layout.js

import './globals.css';
import { AuthModalProvider } from '@/contexts/AuthModalProvider';
import ClientLayout from '@/components/ClientLayout';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import Script from 'next/script';
import { Heebo } from 'next/font/google';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

// ... metadata code ... (נשאר אותו דבר)
export const metadata = {
  metadataBase: new URL("https://www.onmotormedia.com"),
  title: {
    default: "OnMotor Media – מגזין אופנועים ישראלי | חדשות, סקירות וקהילה",
    template: "%s | OnMotor Media",
  },
  description: "מגזין אופנועים ישראלי מוביל...",
  // ... שאר המטא דאטה ...
};

// --- פונקציה לשליפת טיקר ---
async function getTickerHeadlines() {
  const API_URL = process.env.STRAPI_API_URL;
  try {
    const url = `${API_URL}/api/articles?filters[$or][0][tags_txt][$contains]=חדשנות&filters[$or][1][tags_txt][$contains]=2025&filters[$or][2][tags_txt][$contains]=חוק וסדר&sort=publishedAt:desc`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    const data = await res.json();

    if (data?.data?.length > 0) {
      return data.data.map((article) => {
        const attrs = article.attributes || article;
        return {
          text: attrs.headline || attrs.title || "כתבה ללא כותרת",
          link: `/articles/${attrs.slug}`,
        };
      });
    }
    return [];
  } catch (err) {
    console.error("Server Error fetching ticker:", err);
    return [];
  }
}

// ✅ פונקציה מעודכנת לשליפת נתוני הסיידבר
async function getSidebarData() {
  const API_URL = process.env.STRAPI_API_URL;
  const PUBLIC_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL; // כתובת חיצונית לתמונות

  // פונקציית עזר גנרית
  const fetchStrapi = async (query) => {
    try {
      // populate=* מבטיח שנקבל גם תמונות
      const url = `${API_URL}/api/articles?${query}`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.error("Error in fetchStrapi:", query, e);
      return [];
    }
  };

  // ✅ פונקציה למיפוי ותיקון כתובות תמונה
  const mapData = (items) => items.map(item => {
    const a = item.attributes || item;
    
    // ניסיון לשלוף תמונה מכמה מקורות
    let rawImageUrl = 
        a.image?.data?.attributes?.url || 
        a.image?.url || 
        null;

    let finalImageUrl = '/default-image.jpg';

    if (rawImageUrl) {
      // אם זו כתובת מלאה (https://...) נשתמש בה
      if (rawImageUrl.startsWith('http')) {
        finalImageUrl = rawImageUrl;
      } else {
        // אם זו כתובת יחסית (/uploads/...) נוסיף את הדומיין של השרת
        finalImageUrl = `${PUBLIC_URL}${rawImageUrl}`;
      }
    }

    return {
      id: item.id,
      title: a.title,
      description: a.headline || a.description || '',
      date: a.date,
      image: finalImageUrl, // הכתובת המתוקנת
      slug: a.slug,
      views: a.views || 0,
      url: a.original_url || null 
    };
  });

  // שליפות במקביל
  const [latest, onRoad, popular] = await Promise.all([
    // 1. אחרונים (הכי חדשים)
    fetchStrapi('sort=publishedAt:desc&pagination[limit]=10&populate=*'),
    
    // 2. בדרכים (לפי תגית)
    // וודא ב-Strapi שיש לך כתבות עם התגית "בדרכים" בשדה tags_txt או tags
    fetchStrapi('filters[tags_txt][$contains]=בדרכים&sort=publishedAt:desc&pagination[limit]=10&populate=*'),
    
    // 3. פופולרי (לפי צפיות)
    fetchStrapi('sort=views:desc&pagination[limit]=10&populate=*')
  ]);

  return {
    latest: mapData(latest),
    onRoad: mapData(onRoad),
    popular: mapData(popular)
  };
}

export default async function RootLayout({ children }) {
  const tickerDataPromise = getTickerHeadlines();
  const sidebarDataPromise = getSidebarData();

  const [tickerHeadlines, sidebarData] = await Promise.all([tickerDataPromise, sidebarDataPromise]);

  return (
    <html lang="he" dir="rtl" className={heebo.className}>
      <head>
         {/* ... (סקריפט Schema.org) ... */}
      </head>

      <body className="flex flex-col min-h-screen">
        <AuthModalProvider>
          <ScrollToTopButton />
          
          <ClientLayout tickerHeadlines={tickerHeadlines} sidebarData={sidebarData}>
            {children}
          </ClientLayout>

        </AuthModalProvider>

        <Script src="https://cdn.enable.co.il/licenses/enable-L491236ornf8p4x2-1025-75004/init.js" />
        <Script
          src="https://connect.facebook.net/he_IL/sdk.js#xfbml=1&version=v23.0"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}