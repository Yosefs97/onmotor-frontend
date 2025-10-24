import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_API_TOKEN = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-04';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    if (!url) {
      return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
    }

    let image = null;

    // --- ⭐️ תיקון: הוספת תמיכה ב-YouTube Shorts ⭐️ ---
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      try {
        const urlObj = new URL(url);
        let videoId = null;

        if (urlObj.hostname.includes('youtube.com')) {
          // 1. קישור רגיל: ...watch?v=VIDEO_ID
          videoId = urlObj.searchParams.get('v');
          
          // 2. ⭐️ קישור Shorts: ...youtube.com/shorts/VIDEO_ID
          if (!videoId && urlObj.pathname.includes('/shorts/')) {
            videoId = urlObj.pathname.split('/shorts/')[1];
          }

        } else if (urlObj.hostname.includes('youtu.be')) {
          // 3. קישור מקוצר: ...youtu.be/VIDEO_ID
          videoId = urlObj.pathname.substring(1);
        }

        // ניקוי סופי (מסיר פרמטרים כמו ?si=...)
        if (videoId) {
          videoId = videoId.split('?')[0];
          image = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        }
      } catch (err) {
        console.error('YouTube URL parsing error:', err);
        image = null; 
      }
    }
    // --- ⭐️ סוף התיקון ⭐️ ---

    // ✅ TikTok thumbnail
    else if (url.includes('tiktok.com')) {
      try {
        const res = await fetch(
          `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
        );
        if (res.ok) {
          const json = await res.json();
          image = json?.thumbnail_url || null;
        }
      } catch (err) {
        console.error('TikTok fetch error:', err);
      }
    }

    // ✅ Shopify product image
    else if (SHOPIFY_DOMAIN && url.includes(SHOPIFY_DOMAIN)) {
      try {
        const handle = url.split('/').pop();
        const gql = {
          query: `
            {
              product(handle: "${handle}") {
                images(first: 1) {
                  edges {
                    node {
                      url
                    }
                  }
                }
              }
            }
          `,
        };

        const shopifyRes = await fetch(
          `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Storefront-Access-Token': SHOPIFY_API_TOKEN,
            },
            body: JSON.stringify(gql),
          }
        );

        const json = await shopifyRes.json();
        image =
          json?.data?.product?.images?.edges?.[0]?.node?.url || null;
      } catch (err) {
        console.error('Shopify fetch error:', err);
      }
    }

    // ✅ Meta (Instagram / Facebook)
    else if (url.includes('instagram.com') || url.includes('facebook.com')) {
      image = null;
    }

    // ✅ Other websites (עסקים, בלוגים וכו')
    else {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (OnMotorBot)' },
        });
        const html = await res.text();
        const $ = cheerio.load(html);

        image =
          $('meta[property="og:image"]').attr('content') ||
          $('meta[name="twitter:image"]').attr('content') ||
          $('meta[property="og:image:url"]').Gg('content') ||
          null;

        if (!image) {
          const favicon =
            $('link[rel="icon"]').attr('href') ||
            $('link[rel="shortcut icon"]').attr('href') ||
            $('link[rel="apple-touch-icon"]').attr('href') ||
            null;

          if (favicon) {
            if (favicon.startsWith('/')) {
              const baseUrl = new URL(url).origin;
              image = baseUrl + favicon;
            } else {
              image = favicon;
            }
          }
        }
      } catch (err) {
        console.error('OG:image fetch error:', err);
      }
    }

    // ✅ תשובה סופית
    return NextResponse.json({ image: image || null });
  } catch (err) {
    console.error('Error in /api/preview:', err);
    return NextResponse.json({ image: null });
  }
}