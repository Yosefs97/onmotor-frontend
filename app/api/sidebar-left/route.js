// app/api/sidebar-left/route.js
import { NextResponse } from 'next/server';
import { getMainImage } from '@/utils/resolveMainImage';

const STRAPI_URL = process.env.STRAPI_API_URL;

// ISR לנתיב הזה – יקטין את מספר הקריאות ל-Strapi
export const revalidate = 120;

/* 🧩 דומיין נקי (בשביל source כשצריך) */
function extractDomainName(url) {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    const parts = host.split('.');
    let base = '';
    if (
      parts.length >= 3 &&
      ['co', 'org', 'net'].includes(parts[parts.length - 2])
    ) {
      base = parts[parts.length - 3];
    } else {
      base = parts[0];
    }
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return 'Website';
  }
}

/* פוקנציה קטנה לביצוע fetch ל-Strapi עם טיפול בשגיאות */
async function fetchFromStrapi(path) {
  if (!STRAPI_URL) {
    console.error('❌ STRAPI_API_URL לא מוגדר');
    return [];
  }

  try {
    const res = await fetch(`${STRAPI_URL}${path}`, {
      // cache בצד השרת (ISR) – כדי שלא כל בקשה של קליינט תיגע ב-Strapi
      next: { revalidate: 120 },
    });

    if (!res.ok) {
      console.error('❌ שגיאת Strapi:', res.status, path);
      return [];
    }

    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('❌ שגיאה ב-fetchFromStrapi:', err);
    return [];
  }
}

/* נרמול כתבה רגילה (articles) */
function normalizeArticle(item) {
  const attrs = item.attributes || {};
  const { mainImage } = getMainImage(attrs);

  return {
    id: item.id,
    title: attrs.title || '',
    slug: attrs.slug || '',
    description: attrs.description || '',
    image: mainImage,
    date:
      attrs.date ||
      (attrs.publishedAt ? attrs.publishedAt.split('T')[0] : ''),
    
    // ⬅⬅⬅ תיקון חשוב: url פנימי אמיתי
    url: attrs.slug ? `/articles/${attrs.slug}` : '',

    views: attrs.views ?? null,
    source: 'OnMotor',
  };
}

/* נרמול פופולרי (populars) */
function normalizePopular(item) {
  const attrs = item.attributes || {};
  const { mainImage } = getMainImage(attrs);

  const url = attrs.url || '';
  let source = attrs.source || '';

  if (!source && url) {
    source = extractDomainName(url);
  }

  return {
    id: item.id,
    title: attrs.title || '',
    slug: '', // פופולרי הוא תמיד חיצוני
    description: attrs.description || '',
    image: mainImage,         // ⬅ תמונה משדה image שהעלית
    date:
      attrs.date ||
      (attrs.publishedAt ? attrs.publishedAt.split('T')[0] : ''),
    url,
    views: attrs.views ?? null,
    source,
  };
}


export async function GET() {
  try {
    // 1️⃣ אחרונים – כתבות רגילות
    const latestRaw = await fetchFromStrapi(
      '/api/articles?sort=date:desc&pagination[limit]=20&populate=*'
    );
    const latest = latestRaw.map(normalizeArticle);

    // 2️⃣ בדרכים – כתבות עם תגית iroads
    const onRoadRaw = await fetchFromStrapi(
      '/api/articles?filters[tags_txt][$contains]=iroads&sort=date:desc&pagination[limit]=20&populate=*'
    );
    const onRoad = onRoadRaw.map(normalizeArticle);

    // 3️⃣ פופולרי – מתוך collection populars, עם שדה image
    const popularRaw = await fetchFromStrapi(
      '/api/populars?sort=date:desc&pagination[limit]=20&populate[image]=*&populate[gallery]=*'
    );
    const popular = popularRaw.map(normalizePopular);

    return NextResponse.json({
      latest,
      onRoad,
      popular,
    });
  } catch (err) {
    console.error('❌ sidebar-left API error:', err);
    return NextResponse.json(
      { latest: [], onRoad: [], popular: [] },
      { status: 500 }
    );
  }
}
