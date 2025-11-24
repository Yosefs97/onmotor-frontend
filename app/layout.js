// app/layout.js

import './globals.css';
import { AuthModalProvider } from '@/contexts/AuthModalProvider';
import ClientLayout from '@/components/ClientLayout';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import Script from 'next/script';
import { Heebo } from 'next/font/google';

// 👇 ייבוא הלוגיקה שלך לבחירת תמונה
import { getMainImage } from '@/utils/resolveMainImage';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL("https://www.onmotormedia.com"),
  title: {
    default: "OnMotor Media – מגזין אופנועים ישראלי | חדשות, סקירות וקהילה",
    template: "%s | OnMotor Media",
  },
  description: "מגזין אופנועים ישראלי מוביל...",
  openGraph: {
    title: "OnMotor Media – מגזין אופנועים ישראלי",
    description: "חדשות אופנועים, סקירות, ציוד וניסיון מהשטח...",
    url: "https://www.onmotormedia.com",
    siteName: "OnMotor Media",
    images: [{ url: "https://www.onmotormedia.com/full_Logo.jpg", width: 1200, height: 630 }],
    locale: "he_IL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OnMotor Media – מגזין אופנועים ישראלי",
    images: ["https://www.onmotormedia.com/full_Logo.jpg"],
  },
};

// --- פונקציה לשליפת כותרות לניוז-טיקר ---
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

// ✅ פונקציה לשליפת נתוני הסיידבר (עם שימוש ב-getMainImage)
async function getSidebarData() {
  const API_URL = process.env.STRAPI_API_URL;

  // פונקציית עזר לשליפה
  const fetchStrapi = async (query) => {
    try {
      // populate=* חובה כדי לקבל את הגלריות והתמונות
      const url = `${API_URL}/api/articles?${query}`;
      const res = await fetch(url, { next: { revalidate: 3600 } }); // קאש לשעה
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.error("Error in fetchStrapi:", query, e);
      return [];
    }
  };

  // ✅ פונקציה למיפוי הנתונים באמצעות הלוגיקה שלך
  const mapData = (items) => items.map(item => {
    const attrs = item.attributes || item;
    
    // 🔥 כאן אנחנו משתמשים בפונקציה שלך כדי לבחור את התמונה הטובה ביותר
    const { mainImage } = getMainImage(attrs);

    // וידוא אחרון שהכתובת היא אבסולוטית (למקרה ש-resolveImageUrl החזיר נתיב יחסי)
    let finalImageUrl = mainImage;
    if (mainImage && mainImage.startsWith('/')) {
       finalImageUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL}${mainImage}`;
    }

    return {
      id: item.id,
      title: attrs.title,
      description: attrs.headline || attrs.description || '',
      date: attrs.date,
      image: finalImageUrl, // הכתובת המוכנה לשימוש
      slug: attrs.slug,
      views: attrs.views || 0,
      url: attrs.original_url || null 
    };
  });

  // שליפות במקביל
  const [latest, onRoad, popular] = await Promise.all([
    // 1. אחרונים
    fetchStrapi('sort=publishedAt:desc&pagination[limit]=10&populate=*'),
    
    // 2. בדרכים
    fetchStrapi('filters[tags_txt][$contains]=iroads&sort=publishedAt:desc&pagination[limit]=10&populate=*'),
    
    // 3. פופולרי
    fetchStrapi('sort=views:desc&pagination[limit]=10&populate=*')
  ]);

  return {
    latest: mapData(latest),
    onRoad: mapData(onRoad),
    popular: mapData(popular)
  };
}

export default async function RootLayout({ children }) {
  // שליפת הנתונים במקביל
  const tickerDataPromise = getTickerHeadlines();
  const sidebarDataPromise = getSidebarData();

  const [tickerHeadlines, sidebarData] = await Promise.all([tickerDataPromise, sidebarDataPromise]);

  return (
    <html lang="he" dir="rtl" className={heebo.className}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "OnMotor Media",
              "url": "https://www.onmotormedia.com",
              "logo": "https://www.onmotormedia.com/OnMotorLogonoback.png",
            }),
          }}
        />
      </head>

      <body className="flex flex-col min-h-screen">
        <AuthModalProvider>
          <ScrollToTopButton />
          
          {/* ✅ העברת הנתונים המוכנים (כולל התמונות הנכונות) למטה */}
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