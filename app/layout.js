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

export const metadata = {
  metadataBase: new URL("https://www.onmotormedia.com"),
  title: {
    default: "OnMotor Media – מגזין אופנועים ישראלי | חדשות, סקירות וקהילה",
    template: "%s | OnMotor Media",
  },
  description:
    "מגזין אופנועים ישראלי מוביל – חדשות אופנועים, סקירות דגמים, סקירת ציוד ומבחני דרך. כל מה שרוכב בישראל צריך לדעת.",
  openGraph: {
    title: "OnMotor Media – מגזין אופנועים ישראלי",
    description:
      "חדשות אופנועים, סקירות, ציוד וניסיון מהשטח – מגזין האופנועים לרוכב בישראל.",
    url: "https://www.onmotormedia.com",
    siteName: "OnMotor Media",
    images: [
      {
        url: "https://www.onmotormedia.com/full_Logo.jpg",
        width: 1200,
        height: 630,
        alt: "OnMotor Media Logo",
      },
    ],
    locale: "he_IL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OnMotor Media – מגזין אופנועים ישראלי",
    description:
      "חדשות אופנועים, סקירות דגמים לקהילת הרוכבים של ישראל.",
    images: ["https://www.onmotormedia.com/full_Logo.jpg"],
  },
};

// ✅ פונקציה לשליפת כותרות לניוז-טיקר
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

// ✅ פונקציה חדשה לשליפת נתוני הסיידבר (אחרונים, בדרכים, פופולרי)
async function getSidebarData() {
  const API_URL = process.env.STRAPI_API_URL;

  // פונקציית עזר
  const fetchStrapi = async (query) => {
    try {
      const res = await fetch(`${API_URL}/api/articles?${query}`, { next: { revalidate: 3600 } });
      const json = await res.json();
      return json.data || [];
    } catch (e) { return []; }
  };

  const mapData = (items) => items.map(item => {
    const a = item.attributes || item;
    let imageUrl = '/default-image.jpg';
    if (a.image?.data?.attributes?.url) imageUrl = a.image.data.attributes.url;

    // הרכבת כתובת תמונה מלאה
    const fullImage = imageUrl.startsWith('http') 
      ? imageUrl 
      : `${process.env.NEXT_PUBLIC_STRAPI_API_URL || ''}${imageUrl}`;

    return {
      id: item.id,
      title: a.title,
      description: a.headline || a.description || '',
      date: a.date,
      image: fullImage,
      slug: a.slug,
      views: a.views || 0,
      url: a.original_url || null // אם יש שדה כזה ב-Strapi לקישורים חיצוניים
    };
  });

  // שליפות במקביל
  const [latest, onRoad, popular] = await Promise.all([
    // 1. אחרונים
    fetchStrapi('sort=publishedAt:desc&pagination[limit]=10&populate=image'),
    // 2. בדרכים (לפי תגית)
    fetchStrapi('filters[tags_txt][$contains]=בדרכים&sort=publishedAt:desc&pagination[limit]=10&populate=image'),
    // 3. פופולרי (לפי צפיות)
    fetchStrapi('sort=views:desc&pagination[limit]=10&populate=image')
  ]);

  return {
    latest: mapData(latest),
    onRoad: mapData(onRoad),
    popular: mapData(popular)
  };
}

export default async function RootLayout({ children }) {
  // ✅ שליפת כל הנתונים במקביל
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
          
          {/* ✅ העברת הנתונים ל-ClientLayout */}
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