// lib/fetchExternalImages.js
import * as cheerio from 'cheerio';

/**
 * ✅ Universal version:
 * - Yamaha Media (release-overview, כולל חיפוש ישיר ב־CDN)
 * - Yamaha PDP (api/product-assets)
 * - KTM press
 * - fallback לכל אתר אחר
 */
export async function fetchExternalImages(pageUrl) {
  try {
    console.log(`🔍 Fetching images from ${pageUrl}`);
    const found = new Set();

      // 🖼️ טיפול בקישורי תמונה ישירים (כולל Honda News ללא סיומת)
    if (
      pageUrl.match(/\.(jpg|jpeg|png|webp|gif|avif)(\?|$)/i) ||
      pageUrl.match(/hondanews\.eu\/image\/motorcycles\/(low|high|original)\/\d+/i)
    ) {
      console.log('🖼️ Direct Honda image URL detected');
      const candidates = [
        pageUrl.replace('/low/', '/original/'),
        pageUrl.replace('/low/', '/high/'),
        pageUrl,
      ];

      const validImages = [];
      for (const url of candidates) {
        try {
          const res = await fetch(url, {
            method: 'HEAD',
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36',
              'Accept':
                'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
              'Referer': 'https://hondanews.eu/',
            },
            redirect: 'follow',
          });
          const type = res.headers.get('content-type') || '';
          if (type.startsWith('image/')) {
            console.log(`✅ Found valid image: ${url}`);
            validImages.push({ src: url, alt: '', title: '' });
          } else {
            console.warn(`⚠️ Skipped non-image (maybe logo): ${url}`);
          }
        } catch (err) {
          console.warn(`❌ Failed to fetch: ${url}`);
        }
      }

      if (validImages.length > 0) return validImages;
    }

    // 🟣 1. Yamaha Media (release-overview)
    if (pageUrl.includes('media.yamaha-motor.eu')) {
      console.log('⚙️ Yamaha Media site detected — direct CDN scan');

      try {
        const response = await fetch(pageUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36',
          },
        });

        if (!response.ok)
          throw new Error(`HTTP ${response.status} when fetching ${pageUrl}`);

        const html = await response.text();

        // 🎯 חילוץ ישיר של קישורים לתמונות Yamaha CDN (גם אם מוסתרים בסקריפטים)
        const yamahaMatches = html.match(
          /(https:\/\/cdn2\.yamaha-motor\.eu\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif|avif))/gi
        );

        if (yamahaMatches?.length) {
          yamahaMatches.forEach((src) => found.add(src));
          console.log(`✅ Found ${found.size} Yamaha CDN images`);
        } else {
          console.warn('⚠️ No Yamaha CDN images found directly in HTML');
        }
      } catch (err) {
        console.error('❌ Yamaha Media fetch error:', err);
      }
    }

    // 🟢 2. Yamaha PDP
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
              if (
                typeof obj === 'string' &&
                obj.includes('cdn2.yamaha-motor.eu')
              ) {
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

        // 🔴 4. Honda News (Europe)
    if (pageUrl.includes('hondanews.eu')) {
      console.log('⚙️ Honda News site detected');
      try {
        // 📸 טיפול במקרה של קישור ישיר לתמונה (כמו /image/motorcycles/low/...)
        if (pageUrl.match(/\/image\/motorcycles\/low\/\d+\//i)) {
          console.log('🖼️ Detected direct Honda image URL');
          found.add(pageUrl);
        } else {
          // 🌐 טיפול בעמוד מלא (press page)
          const response = await fetch(pageUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36',
            },
          });

          if (response.ok) {
            const html = await response.text();
            const $ = cheerio.load(html);

            // חילוץ כל התמונות של Honda News
            $('img').each((_, el) => {
              const src = $(el).attr('src');
              if (src && src.includes('/image/motorcycles/')) {
                const absolute = new URL(src, pageUrl).href;
                found.add(absolute);
              }
            });
          } else {
            console.warn(`⚠️ Honda page fetch failed: ${response.status}`);
          }
        }
      } catch (err) {
        console.error('❌ Honda News fetch error:', err);
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

    // ✅ ניקוי סופי עם כל המסננים שלך
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
