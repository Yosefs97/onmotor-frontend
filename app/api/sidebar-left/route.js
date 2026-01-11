// app/api/sidebar-left/route.js
import { NextResponse } from 'next/server';
import { getMainImage } from '@/utils/resolveMainImage';

const STRAPI_URL = process.env.STRAPI_API_URL;

export const revalidate = 120;

/* 🧩 דומיין נקי - מחלץ שם אתר מקישור */
function extractDomainName(url) {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    const parts = host.split('.');
    let base = '';
    if (parts.length >= 3 && ['co','org','net'].includes(parts[parts.length-2])) {
      base = parts[parts.length-3];
    } else {
      base = parts[0];
    }
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return 'Web';
  }
}

async function fetchFromStrapi(path) {
  if (!STRAPI_URL) return [];
  try {
    const res = await fetch(`${STRAPI_URL}${path}`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('❌ fetchFromStrapi:', err);
    return [];
  }
}

/* 🎯 normalizeItem - כאן השינוי החשוב */
function normalizeItem(obj) {
  const a = obj.attributes || obj;

  // 1. זיהוי אוטומטי של מקור הכתבה (YouTube, Ynet וכו') לפי ה-URL
  let autoSource = '';
  if (a.url) {
    if (a.url.includes('youtube.com') || a.url.includes('youtu.be')) autoSource = 'YouTube';
    else if (a.url.includes('tiktok.com')) autoSource = 'TikTok';
    else if (a.url.includes('instagram.com')) autoSource = 'Instagram';
    else if (a.url.includes('facebook.com')) autoSource = 'Facebook';
    else autoSource = extractDomainName(a.url);
  }

  // 2. בדיקה האם שדה source מכיל לינק לתמונה (מתחיל ב-http)
  const sourceField = a.source || '';
  const isSourceLink = sourceField.startsWith('http') || sourceField.startsWith('/');

  // 3. קביעת התמונה הראשית (Image Logic)
  // אופציה 1: תמונה שהועלתה לסטראפי (דרך getMainImage)
  const { mainImage } = getMainImage(a);
  
  // אופציה 2: אם אין תמונה בסטראפי, והשדה source הוא לינק -> השתמש בו כתמונה
  let finalImage = mainImage;
  if (!finalImage && isSourceLink) {
    finalImage = sourceField;
  }

  // 4. קביעת הטקסט שיוצג למטה (Source Text Logic)
  // אם ה-source הוא לינק לתמונה, אנחנו לא רוצים להציג את הלינק כטקסט. נציג את המקור האוטומטי.
  // אחרת, נציג את הטקסט שהמשתמש כתב (למשל "ynet").
  const displaySource = isSourceLink ? autoSource : (sourceField || autoSource);

  const correctSlug = a.href || a.slug;

  return {
    id: obj.id,
    title: a.title || a.name || '',
    slug: correctSlug,
    description: a.description || '',
    
    // כאן נכנסת התמונה הנבחרת (סטראפי או קישור משדה המקור)
    image: finalImage, 
    
    date: a.date?.split('T')[0] || a.publishedAt?.split('T')[0] || '',
    url: a.url || (correctSlug ? `/articles/${correctSlug}` : ''),
    views: a.views ?? null,
    
    // כאן נכנס הטקסט לתצוגה
    source: displaySource, 
  };
}

export async function GET() {
  try {
    const latestRaw = await fetchFromStrapi('/api/articles?sort=date:desc&pagination[limit]=20&populate=*');
    const onRoadRaw = await fetchFromStrapi('/api/articles?filters[tags_txt][$contains]=iroads&sort=date:desc&pagination[limit]=20&populate=*');
    const popularRaw = await fetchFromStrapi('/api/populars?sort=date:desc&pagination[limit]=20&populate=*');

    return NextResponse.json({
      latest: latestRaw.map(normalizeItem),
      onRoad: onRoadRaw.map(normalizeItem),
      popular: popularRaw.map(normalizeItem),
    });
  } catch (err) {
    console.error('❌ sidebar-left API error:', err);
    return NextResponse.json({ latest: [], onRoad: [], popular: [] }, { status: 500 });
  }
}