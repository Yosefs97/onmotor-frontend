// app/layout.js

import './globals.css';
import { AuthModalProvider } from '@/contexts/AuthModalProvider';
import ClientLayout from '@/components/ClientLayout';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import CookieBanner from '@/components/CookieBanner';
import Script from 'next/script';
import { Heebo } from 'next/font/google';
import { getMainImage } from '@/utils/resolveMainImage';
import AdvertisingPopup from '@/components/AdvertisingPopup';
import WhatsAppSlideIn from '@/components/WhatsAppSlideIn';
import MarketingPopup from '@/components/MarketingPopup';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

// --- עדכון 1: הרחבת ה-Metadata ---
export const metadata = {
  metadataBase: new URL("https://www.onmotormedia.com"),
  alternates: {
    canonical: '/',
  },
  title: {
    default: "OnMotor Media – מגזין אופנועים ישראלי",
    template: "%s | OnMotor Media",
  },
  description:
    "מגזין אופנועים ישראלי מוביל – חדשות אופנועים, סקירות דגמים, סקירת ציוד ומבחני דרך. כל מה שרוכב בישראל צריך לדעת.",
  
  // הוספת מילות מפתח עוזרת למנועים להבין את ההקשר הרחב
  keywords: ["אופנועים", "מגזין אופנועים", "סקירות אופנועים", "חדשות רכב", "OnMotor Media", "יוסף סבג", "CF Moto", "מבחני דרכים"],
  
  // הוספת מחברים - חשוב ל-E-E-A-T
  authors: [{ name: 'יוסף סבג', url: 'https://www.onmotormedia.com' }, { name: 'אסף אפרים' }],

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' }, 
      { url: '/favicon_32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },

  openGraph: {
    title: "OnMotor Media – מגזין אופנועים ישראלי",
    description:
      "חדשות אופנועים, סקירות, ציוד וניסיון מהשטח – מגזין האופנועים לרוכב בישראל.",
    url: "https://www.onmotormedia.com",
    siteName: "OnMotor Media",
    images: [
      {
        url: "https://www.onmotormedia.com/full_Logo_v2.jpg",
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
    images: ["https://www.onmotormedia.com/full_Logo_v2.jpg"],
  },
};

// ... (שאר פונקציות העזר נשארות ללא שינוי: getTickerHeadlines, extractDomainName, getSidebarData) ...
async function getTickerHeadlines() {
  const API_URL = process.env.STRAPI_API_URL;
  try {
    const url = `${API_URL}/api/articles?filters[$or][0][tags_txt][$contains]=חדשנות&filters[$or][1][tags_txt][$contains]=2026&filters[$or][2][tags_txt][$contains]=חוק וסדר&sort=publishedAt:desc&populate=*`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    const data = await res.json();
    if (data?.data?.length > 0) {
      return data.data.map((article) => {
        const attrs = article.attributes || article;
        const correctSlug = attrs.href || attrs.slug;
        return {
          text: attrs.headline || attrs.title || "כתבה ללא כותרת",
          link: `/articles/${correctSlug}`,
        };
      });
    }
    return [];
  } catch (err) {
    console.error("Ticker Error:", err);
    return [];
  }
}

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

async function getSidebarData() {
  const API_URL = process.env.STRAPI_API_URL;
  const PUBLIC_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || API_URL;

  const fetchStrapi = async (endpoint, query) => {
    try {
      const url = `${API_URL}/api/${endpoint}?${query}`;
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.error(`Error fetching ${endpoint}:`, e);
      return [];
    }
  };

  const normalizeItem = (item) => {
    const a = item.attributes || item;
    
    let autoSource = '';
    if (a.url) {
      if (a.url.includes('youtube.com') || a.url.includes('youtu.be')) autoSource = 'YouTube';
      else if (a.url.includes('tiktok.com')) autoSource = 'TikTok';
      else if (a.url.includes('instagram.com')) autoSource = 'Instagram';
      else if (a.url.includes('facebook.com')) autoSource = 'Facebook';
      else autoSource = extractDomainName(a.url);
    }

    const { mainImage } = getMainImage(a);
    let finalImageUrl = '/full_Logo_v2.jpg';
    
    if (mainImage && mainImage !== '/full_Logo_v2.jpg') {
      if (mainImage.startsWith('http')) {
        finalImageUrl = mainImage;
      } else {
        finalImageUrl = `${PUBLIC_URL}${mainImage.startsWith('/') ? '' : '/'}${mainImage}`;
      }
    }

    const correctSlug = a.href || a.slug;

    return {
      id: item.id,
      title: a.title || a.name || '',
      slug: correctSlug,
      description: a.description || '',
      image: finalImageUrl,
      date: a.date?.split('T')[0] || a.publishedAt?.split('T')[0] || '',
      url: a.url || (correctSlug ? `/articles/${correctSlug}` : null),
      views: a.views ?? null,
      source: a.source || autoSource,
    };
  };

  const [latestRaw, onRoadRaw, popularRaw, iroadsRaw] = await Promise.all([
    fetchStrapi('articles', 'sort=date:desc&pagination[limit]=20&populate=*'),
    fetchStrapi('articles', 'filters[tags_txt][$contains]=iroads&sort=date:desc&pagination[limit]=20&populate=*'),
    fetchStrapi('populars', 'sort=date:desc&pagination[limit]=20&populate=*'),
    fetchStrapi('articles', 'filters[tags_txt][$contains]=iroads&sort=publishedAt:desc&pagination[limit]=5&populate=*')
  ]);

  return {
    latest: latestRaw.map(normalizeItem),
    onRoad: onRoadRaw.map(normalizeItem),
    popular: popularRaw.map(normalizeItem),
    iroads: iroadsRaw.map(normalizeItem)
  };
}


// --- עדכון 2: רכיב ה-Schema בתוך RootLayout ---

export default async function RootLayout({ children }) {
  const tickerDataPromise = getTickerHeadlines();
  const sidebarDataPromise = getSidebarData();

  const [tickerHeadlines, sidebarData] = await Promise.all([tickerDataPromise, sidebarDataPromise]);

  // בניית נתוני ה-Schema
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization", // הגדרה מדויקת יותר למגזין
    "name": "OnMotor Media",
    "url": "https://www.onmotormedia.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.onmotormedia.com/web-app-manifest-512x512.png",
      "width": 512,
      "height": 512
    },
    "description": "מגזין אופנועים ישראלי מוביל – חדשות אופנועים, סקירות דגמים, סקירת ציוד ומבחני דרך.",
    // פרטים עליך - המייסד
    "founder": {
      "@type": "Person",
      "name": "יוסף סבג",
      "jobTitle": "מהנדס מכונות ומייסד",
      "description": "מהנדס מכונות, יזם ומפתח האתר"
    },
    // פרטים על הצוות - אסף
    "employee": [
      {
        "@type": "Person",
        "name": "אסף אפרים",
        "jobTitle": "עורך ובוחן אופנועים",
        "description": "מכונאי אופנועים, רוכב בוחן ועורך תוכן"
      }
    ],
    // קישורים לרשתות חברתיות - עוזר ל-AI לחבר נקודות
    "sameAs": [
      "https://www.facebook.com/OnMotorMedia",
      "https://www.instagram.com/onmotormedia", // (וודא שזה הלינק הנכון)
      "https://www.tiktok.com/@onmotormedia"    // (וודא שזה הלינק הנכון)
    ]
  };

  return (
    <html lang="he" dir="rtl" className={heebo.className}>
      <head>
        <meta property="fb:app_id" content="1702134291174147" />
        <meta property="fb:pages" content="1671844356419083" />
        <meta property="article:publisher" content="https://www.facebook.com/OnMotorMedia" />

        {/* הטמעת ה-Schema המשודרגת */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaData),
          }}
        />
      </head>

      <body className="flex flex-col min-h-screen">
        <AuthModalProvider>
          <ScrollToTopButton />
          
          <ClientLayout tickerHeadlines={tickerHeadlines} sidebarData={sidebarData}>
            {children}
          </ClientLayout>

          <CookieBanner />

        </AuthModalProvider>

        <Script src="https://cdn.enable.co.il/licenses/enable-L491236ornf8p4x2-1025-75004/init.js"
                strategy="lazyOnload" />
        <Script
          src="https://connect.facebook.net/he_IL/sdk.js#xfbml=1&version=v23.0"
          strategy="lazyOnload"
        />
        <AdvertisingPopup />
        <WhatsAppSlideIn />
        <MarketingPopup />
      </body>
    </html>
  );
}