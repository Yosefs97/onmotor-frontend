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

// ✅ פונקציה מתוקנת לשליפת נתוני הסיידבר
async function getSidebarData() {
  const API_URL = process.env.STRAPI_API_URL;
  const PUBLIC_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL;

  // פונקציית עזר לשליפה
  const fetchStrapi = async (label, query) => {
    try {
      // populate=* חובה כדי לקבל את הגלריות והתמונות
      const url = `${API_URL}/api/articles?${query}`;
      const res = await fetch(url, { next: { revalidate: 300 } }); // הורדתי זמן רענון ל-5 דקות לצורך בדיקות
      
      if (!res.ok) {
        console.error(`❌ Error fetching ${label}: ${res.status}`);
        return [];
      }

      const json = await res.json();
      const items = json.data || [];
      console.log(`✅ ${label}: Found ${items.length} items`); // לוג לשרת
      return items;
    } catch (e) {
      console.error(`❌ Crash fetching ${label}:`, e);
      return [];
    }
  };

  // ✅ פונקציה למיפוי הנתונים + תיקון תמונות מוחלט
  const mapData = (items) => items.map(item => {
    const attrs = item.attributes || item;
    
    // 1. שימוש בלוגיקה שלך לבחירת התמונה הכי טובה
    const { mainImage } = getMainImage(attrs);

    // 2. תיקון נתיב התמונה (אם הוא יחסי)
    let finalImageUrl = '/default-image.jpg';
    
    if (mainImage && mainImage !== '/default-image.jpg') {
      if (mainImage.startsWith('http')) {
        finalImageUrl = mainImage; // כתובת מלאה
      } else {
        // כתובת יחסית (למשל /uploads/img.jpg) - נוסיף את הדומיין
        finalImageUrl = `${PUBLIC_URL}${mainImage.startsWith('/') ? '' : '/'}${mainImage}`;
      }
    }

    return {
      id: item.id,
      title: attrs.title,
      description: attrs.headline || attrs.description || '',
      date: attrs.date,
      image: finalImageUrl, // הכתובת המוכנה והמתוקנת
      slug: attrs.slug,
      views: attrs.views || 0,
      url: attrs.original_url || null 
    };
  });

  // שליפות במקביל עם שאילתות מתוקנות
  const [latest, onRoad, popular] = await Promise.all([
    // 1. אחרונים
    fetchStrapi('Latest', 'sort=publishedAt:desc&pagination[limit]=10&populate=*'),
    
    // 2. בדרכים (תיקון: בודק גם "iroads" וגם "בדרכים")
    fetchStrapi('OnRoad', 'filters[$or][0][tags_txt][$contains]=iroads&filters[$or][1][tags_txt][$contains]=בדרכים&sort=publishedAt:desc&pagination[limit]=10&populate=*'),
    
    // 3. פופולרי (תיקון: מיון לפי views במקום API נפרד)
    fetchStrapi('Popular', 'sort=views:desc&pagination[limit]=10&populate=*')
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