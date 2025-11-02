// lib/fetchExternalImages.js
import * as cheerio from 'cheerio';

/**
 * גרסה אוניברסלית עם תמיכה ב-KTM, Yamaha (כולל JSON פנימי ו־API רשמי), ודפים דינמיים
 */
export async function fetchExternalImages(pageUrl) {
  try {
    console.log(`🔍 Fetching images from ${pageUrl}`);
    const found = new Set();

    // 🟣 Yamaha API Mode — הדרך הרשמית, מביאה את כל התמונות
    if (pageUrl.includes('yamaha-motor.eu')) {
      console.log('⚙️ Yamaha mode activated');

      // חילוץ דגם ושנה מה-URL
      const yamahaMatch = pageUrl.match(/pdp\/([^/]+)-(\d{4})/i);
      if (yamahaMatch) {
        const model = yamahaMatch[1].toUpperCase().replace(/-/g, '');
        const year = yamahaMatch[2];
        const apiUrl = `https://www.yamaha-motor.eu/api/product-assets/${year}/${model}`;
        console.log(`📦 Fetching Yamaha assets from ${apiUrl}`);

        try {
          const res = await fetch(apiUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36',
            },
          });

          if (res.ok) {
            const json = await res.json();

            // רקורסיה שמחלצת כל URL של תמונה מהמבנה המורכב
            const extractFromJson = (obj) => {
              if (!obj) return;
              if (typeof obj === 'string' && obj.includes('cdn2.yamaha-motor.eu')) {
                found.add(obj);
              } else if (typeof obj === 'object') {
                Object.values(obj).forEach(extractFromJson);
              }
            };

            extractFromJson(json);
            console.log(`✅ Yamaha API returned ${found.size} image URLs`);
          } else {
            console.warn(`⚠️ Yamaha API returned status ${res.status}`);
          }
        } catch (err) {
          console.error('❌ Yamaha API fetch error:', err);
        }
      }
    }

    // אם לא נמצאו עדיין תמונות (או שזה לא אתר Yamaha)
    if (found.size === 0) {
      const response = await fetch(pageUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36',
        },
      });

      if (!response.ok)
        throw new Error(`HTTP ${response.status} when fetching ${pageUrl}`);

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

      // 🧩 תמונות רגילות + lazy load
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

      // 🎨 רקעים עם background-image
      $('[style]').each((_, el) => {
        const style = $(el).attr('style');
        const match = style?.match(/url\(['"]?(.*?)['"]?\)/i);
        if (match?.[1]) {
          const full = normalizeUrl(match[1]);
          if (full) found.add(full);
        }
      });

      // 🔗 לינקים ישירים לתמונות
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(href)) {
          const full = normalizeUrl(href);
          if (full) found.add(full);
        }
      });

      // 📰 תמונות ממטא
      $('meta[property="og:image"], meta[name="twitter:image"]').each((_, el) => {
        const content = $(el).attr('content');
        const full = normalizeUrl(content);
        if (full) found.add(full);
      });

      // 🟠 KTM fallback – רק אם לא נמצאו תמונות
      if (found.size === 0 && pageUrl.includes('press.ktm.com')) {
        console.log('⚙️ Using KTM pattern fallback');
        const matches = html.match(/Content\/\d+\/[a-z0-9-]+\/1200\/2400\/\.jpg/gi);
        if (matches?.length) {
          matches.forEach((p) => {
            const fixed = `${baseUrl}/${p.replace(/^Content\//, '')}`;
            found.add(fixed);
          });
        }
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

    console.log(`✅ Found ${images.length} images from ${pageUrl}`);
    return images;
  } catch (err) {
    console.error('❌ fetchExternalImages error:', err);
    return [];
  }
}
