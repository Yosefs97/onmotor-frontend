// /app/api/preview/route.js
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

    // ✅ YouTube thumbnails
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('v=')
        ? new URL(url).searchParams.get('v')
        : url.split('/').pop();
      image = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }

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

        // ננסה למצוא קודם OG / Twitter image
        image =
          $('meta[property="og:image"]').attr('content') ||
          $('meta[name="twitter:image"]').attr('content') ||
          $('meta[property="og:image:url"]').attr('content') ||
          null;

        // ✅ אם לא מצאנו — ננסה להביא favicon (לוגו האתר)
        if (!image) {
          const favicon =
            $('link[rel="icon"]').attr('href') ||
            $('link[rel="shortcut icon"]').attr('href') ||
            $('link[rel="apple-touch-icon"]').attr('href') ||
            null;

          if (favicon) {
            // אם הנתיב יחסי — נוסיף את הדומיין
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
