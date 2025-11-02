// lib/fetchExternalImages.js
import * as cheerio from 'cheerio';

/**
 * גרסה אוניברסלית:
 * ✅ Yamaha Media (release-overview, GraphQL)
 * ✅ Yamaha PDP (api/product-assets)
 * ✅ KTM press (regex חדש)
 * ✅ fallback לכל אתר אחר
 */
export async function fetchExternalImages(pageUrl) {
  try {
    console.log(`🔍 Fetching images from ${pageUrl}`);
    const found = new Set();

    // 🟣 1. Yamaha Media (release-overview pages)
    if (pageUrl.includes('media.yamaha-motor.eu')) {
      console.log('⚙️ Yamaha Media site detected — using GraphQL API');

      // חילוץ ה-slug מתוך ה-URL
      const match = pageUrl.match(/release-overview\/([^/?#]+)/i);
      const slug = match ? match[1].replace(/\/$/, '') : null;

      if (slug) {
        console.log(`📦 Fetching Yamaha Media GraphQL data for slug: ${slug}`);
        const apiUrl = 'https://media.yamaha-motor.eu/api/graphql';
        const body = JSON.stringify({
          operationName: 'GetReleaseDetails',
          variables: { slug },
          query: `
            query GetReleaseDetails($slug: String!) {
              releases(filters: { slug: { eq: $slug } }) {
                data {
                  attributes {
                    title
                    media {
                      data {
                        attributes {
                          url
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
        });

        try {
          const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
            body,
          });

          if (res.ok) {
            const json = await res.json();
            const media =
              json?.data?.releases?.data?.[0]?.attributes?.media?.data || [];

            media.forEach((m) => {
              const src = m?.attributes?.url;
              if (src && src.includes('cdn2.yamaha-motor.eu')) found.add(src);
            });

            console.log(`✅ Found ${found.size} images from Yamaha Media GraphQL`);
          } else {
            console.warn(`⚠️ Yamaha GraphQL returned status ${res.status}`);
          }
        } catch (err) {
          console.error('❌ Yamaha GraphQL fetch error:', err);
        }
      }
    }

    // 🟢 2. Yamaha PDP API mode
    if (pageUrl.includes('yamaha-motor.eu') && pageUrl.includes('/pdp/')) {
      console.log('⚙️ Yamaha PDP mode activated');
      const yamahaMatch = pageUrl.match(/pdp\/([^/]+)-(\d{4})/i);

      if (yamahaMatch) {
        const model = yamahaMatch[1].toUpperCase().replace(/-/g, '');
        const year = yamahaMatch[2];
        const apiUrl = `https://www.yamaha-motor.eu/api/product-assets/${year}/${model}`;
        console.log(`📦 Fetching Yamaha PDP assets from ${apiUrl}`);

        try {
          const res = await fetch(apiUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36',
            },
          });

          if (res.ok) {
            const json = await res.json();

            const extractFromJson = (obj) => {
              if (!obj) return;
              if (typeof obj === 'string' && obj.includes('cdn2.yamaha-motor.eu')) {
                found.add(obj);
              } else if (typeof obj === 'object') {
                Object.values(obj).forEach(extractFromJson);
              }
            };

            extractFromJson(json);
            console.log(`✅ Yamaha PDP API returned ${found.size} images`);
          }
        } catch (err) {
          console.error('❌ Yamaha PDP API fetch error:', err);
        }
      }
    }

    // 🟠 3. KTM press fallback
    if (pageUrl.includes('press.ktm.com')) {
      console.log('⚙️ KTM press site detected');
      const response = await fetch(pageUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36',
        },
      });

      if (!response.ok)
        throw new Error(`HTTP ${response.status} when fetching ${pageUrl}`);

      const html = await response.text();

      const matches = html.match(
        /(https:\/\/press\.ktm\.com\/Content\/[A-Za-z0-9/_-]+\/(?:1200|2400)\.jpg)/gi
      );

      if (matches?.length) {
        matches.forEach((src) => found.add(src));
        console.log(`✅ Found ${matches.length} KTM images`);
      }
    }

    // 🧩 4. fallback כללי
    if (found.size === 0) {
      const response = await fetch(pageUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36',
        },
      });

      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);
        const baseUrl = new URL(pageUrl).origin;

        const normalizeUrl = (src) => {
          if (!src) return null;
          if (src.startsWith('http')) return src;
          if (src.startsWith('//')) return `https:${src}`;
          if (src.startsWith('data:')) return null;
          return `${baseUrl}/${src.replace(/^\/+/, '')}`;
        };

        $('img,[data-src],[data-lazy],[data-bg],[data-original]').each((_, el) => {
          const src =
            $(el).attr('src') ||
            $(el).attr('data-src') ||
            $(el).attr('data-lazy') ||
            $(el).attr('data-bg') ||
            $(el).attr('data-original');
          const full = normalizeUrl(src);
          if (full) found.add(full);
        });

        $('meta[property="og:image"], meta[name="twitter:image"]').each((_, el) => {
          const content = $(el).attr('content');
          const full = normalizeUrl(content);
          if (full) found.add(full);
        });
      }
    }

    // ✅ ניקוי סופי
    const images = Array.from(found)
      .filter((src) =>
        /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(src.toLowerCase())
      )
      .filter((src) => !src.toLowerCase().includes('loading.gif'))
      .filter((src) => !src.toLowerCase().includes('/assets/img/0.gif'))
      .filter((src) => !src.toLowerCase().includes('/assets/img/logo.png'))
      .filter((src) => !src.toLowerCase().includes('/assets/img/icon_pdf.png'))
      .filter((src) => !src.toLowerCase().includes('placeholder'))
      .map((src) => ({ src, alt: '', title: '' }));

    console.log(`✅ Found ${images.length} total images from ${pageUrl}`);
    return images;
  } catch (err) {
    console.error('❌ fetchExternalImages error:', err);
    return [];
  }
}
