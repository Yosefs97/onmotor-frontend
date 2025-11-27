// app/api/sidebar-left/route.js
import { NextResponse } from 'next/server';
import { getMainImage } from '@/utils/resolveMainImage';

const STRAPI_URL = process.env.STRAPI_API_URL;

export const revalidate = 120;

/* 🧩 דומיין נקי */
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
    return 'Website';
  }
}

/* fetch ל-Strapi */
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

/* 🎯 normalizeItem */
function normalizeItem(obj) {
  const a = obj.attributes || obj;

  // 🔵 מקור
  let autoSource = '';
  if (a.url) {
    if (a.url.includes('youtube.com') || a.url.includes('youtu.be'))
      autoSource = 'YouTube';
    else if (a.url.includes('tiktok.com'))
      autoSource = 'TikTok';
    else if (a.url.includes('instagram.com'))
      autoSource = 'Instagram';
    else if (a.url.includes('facebook.com'))
      autoSource = 'Facebook';
    else
      autoSource = extractDomainName(a.url);
  }

  // 🔴 תמונה — לפי getMainImage המקורי
  const { mainImage } = getMainImage(a);

  // ✅ תיקון: שימוש ב-href אם קיים
  const correctSlug = a.href || a.slug;

  return {
    id: obj.id,
    title: a.title || a.name || '',
    slug: correctSlug,
    description: a.description || '',
    image: mainImage,
    date: a.date?.split('T')[0] || a.publishedAt?.split('T')[0] || '',

    // 🟢 url פנימי או חיצוני - עם ה-slug הנכון
    url: a.url || (correctSlug ? `/articles/${correctSlug}` : ''),

    views: a.views ?? null,
    source: a.source || autoSource,
  };
}

export async function GET() {
  try {
    // 1️⃣ אחרונים
    const latestRaw = await fetchFromStrapi(
      '/api/articles?sort=date:desc&pagination[limit]=20&populate=*'
    );
    const latest = latestRaw.map(normalizeItem);

    // 2️⃣ בדרכים
    const onRoadRaw = await fetchFromStrapi(
      '/api/articles?filters[tags_txt][$contains]=iroads&sort=date:desc&pagination[limit]=20&populate=*'
    );
    const onRoad = onRoadRaw.map(normalizeItem);

    // 3️⃣ פופולרי
    const popularRaw = await fetchFromStrapi(
      '/api/populars?sort=date:desc&pagination[limit]=20&populate=*'
    );
    const popular = popularRaw.map(normalizeItem);

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