// app/layout.js

import './globals.css';
import { AuthModalProvider } from '@/contexts/AuthModalProvider';
import ClientLayout from '@/components/ClientLayout';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import Script from 'next/script';
import { Heebo } from 'next/font/google';
import { getMainImage } from '@/utils/resolveMainImage'; // וודא שהקובץ הזה קיים אצלך

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL("https://www.onmotormedia.com"),
  title: {
    default: "OnMotor Media – מגזין אופנועים ישראלי",
    template: "%s | OnMotor Media",
  },
  description: "מגזין אופנועים ישראלי מוביל...",
  // ... שאר המטא דאטה ...
};

// --- פונקציה לשליפת טיקר (ללא שינוי) ---
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
    console.error("Ticker Error:", err);
    return [];
  }
}

// 🛠️ פונקציית עזר לחילוץ דומיין (מהקוד הישן שלך)
function extractDomainName(url) {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    const parts = host.split('.');
    if (parts.length >= 3 && ['co', 'org', 'net'].includes(parts[parts.length - 2])) {
      return parts[parts.length - 3].charAt(0).toUpperCase() + parts[parts.length - 3].slice(1);
    }
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  } catch {
    return 'Website';
  }
}

// ✅ פונקציה ראשית לשליפת נתוני סיידבר (הועתקה מ-route.js והותאמה לשרת)
async function getSidebarData() {
  const API_URL = process.env.STRAPI_API_URL;
  const PUBLIC_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL;

  // פונקציית Fetch גנרית שתומכת ב-Endpoints שונים
  const fetchStrapi = async (endpoint, query) => {
    try {
      const url = `${API_URL}/api/${endpoint}?${query}`;
      const res = await fetch(url, { next: { revalidate: 300 } }); // קאש ל-5 דקות
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.error(`Error fetching ${endpoint}:`, e);
      return [];
    }
  };

  // פונקציית נרמול (מיפוי) - משלבת את הלוגיקה מהקוד הישן שלך
  const normalizeItem = (item) => {
    const a = item.attributes || item;
    
    // 1. חישוב מקור (Source)
    let autoSource = '';
    if (a.url) {
      if (a.url.includes('youtube.com') || a.url.includes('youtu.be')) autoSource = 'YouTube';
      else if (a.url.includes('tiktok.com')) autoSource = 'TikTok';
      else if (a.url.includes('instagram.com')) autoSource = 'Instagram';
      else if (a.url.includes('facebook.com')) autoSource = 'Facebook';
      else autoSource = extractDomainName(a.url);
    }

    // 2. טיפול בתמונה (עם getMainImage שלך + תיקון נתיב יחסי)
    const { mainImage } = getMainImage(a);
    let finalImageUrl = '/default-image.jpg';
    
    if (mainImage && mainImage !== '/default-image.jpg') {
      if (mainImage.startsWith('http')) {
        finalImageUrl = mainImage;
      } else {
        finalImageUrl = `${PUBLIC_URL}${mainImage.startsWith('/') ? '' : '/'}${mainImage}`;
      }
    }

    return {
      id: item.id,
      title: a.title || a.name || '',
      slug: a.slug || '',
      description: a.description || '',
      image: finalImageUrl,
      date: a.date?.split('T')[0] || a.publishedAt?.split('T')[0] || '',
      url: a.url || (a.slug ? `/articles/${a.slug}` : null),
      views: a.views ?? null,
      source: a.source || autoSource,
    };
  };

  // ✅ שליפות במקביל - בדיוק לפי הלוגיקה הישנה
  const [latestRaw, onRoadRaw, popularRaw, iroadsRaw] = await Promise.all([
    // 1. אחרונים
    fetchStrapi('articles', 'sort=date:desc&pagination[limit]=20&populate=*'),
    
    // 2. בדרכים (שימוש בפילטר iroads המקורי)
    fetchStrapi('articles', 'filters[tags_txt][$contains]=iroads&sort=date:desc&pagination[limit]=20&populate=*'),
    
    // 3. פופולרי (פנייה ל-API הייחודי populars)
    fetchStrapi('populars', 'sort=date:desc&pagination[limit]=20&populate=*'),

    // 4. נתיבי ישראל (עבור הבוקס התחתון)
    fetchStrapi('articles', 'filters[tags_txt][$contains]=iroads&sort=publishedAt:desc&pagination[limit]=5&populate=*')
  ]);

  return {
    latest: latestRaw.map(normalizeItem),
    onRoad: onRoadRaw.map(normalizeItem),
    popular: popularRaw.map(normalizeItem),
    iroads: iroadsRaw.map(normalizeItem)
  };
}

export default async function RootLayout({ children }) {
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