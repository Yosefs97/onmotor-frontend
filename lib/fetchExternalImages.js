// lib/fetchExternalImages.js
import * as cheerio from 'cheerio';

/**
 * גרסה אוניברסלית עם תמיכה ב-KTM, Yamaha (כולל JSON פנימי), ודפים דינמיים
 */
export async function fetchExternalImages(pageUrl) {
  try {
    console.log(`🔍 Fetching images from ${pageUrl}`);

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
    const found = new Set();

    const normalizeUrl = (src) => {
      if (!src) return null;
      if (src.startsWith('http')) return src;
      if (src.startsWith('//')) return `https:${src}`;
      if (src.startsWith('data:')) return null;
      return `${baseUrl}/${src.replace(/^\/+/, '')}`;
    };

    // 🧩 שלבים רגילים — img, lazy, bg וכו׳
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

    $('[style]').each((_, el) => {
      const style = $(el).attr('style');
      const match = style?.match(/url\(['"]?(.*?)['"]?\)/i);
      if (match?.[1]) {
        const full = normalizeUrl(match[1]);
        if (full) found.add(full);
      }
    });

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(href)) {
        const full = normalizeUrl(href);
        if (full) found.add(full);
      }
    });

    $('meta[property="og:image"], meta[name="twitter:image"]').each((_, el) => {
      const content = $(el).attr('content');
      const full = normalizeUrl(content);
      if (full) found.add(full);
    });

    // 🟣 Yamaha Mode – כולל ניתוח JSON פנימי
    if (pageUrl.includes('yamaha-motor.eu')) {
      console.log('⚙️ Detected Yamaha site – parsing deep JSON');

      // שלב 1: חיפוש ישיר ב-HTML לכל לינק של ה-CDN
      const cdnMatches = html.match(
        /(https:\/\/cdn2\.yamaha-motor\.eu\/prod\/product-assets\/[^\s"']+\.(jpg|jpeg|png|webp|avif))/gi
      );
      if (cdnMatches?.length) cdnMatches.forEach((src) => found.add(src));

      // שלב 2: ניתוח JSON פנימי שמכיל קישורי תמונות
      $('script[type="application/json"]').each((_, el) => {
        try {
          const jsonText = $(el).html();
          if (jsonText.includes('cdn2.yamaha-motor.eu')) {
            const urls = jsonText.match(
              /(https:\/\/cdn2\.yamaha-motor\.eu\/[^\s"']+\.(jpg|jpeg|png|webp|avif))/gi
            );
            urls?.forEach((src) => found.add(src));
          }
        } catch {}
      });
    }

    // 🟠 KTM fallback
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

    // ✅ ניקוי וסינון סופי
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
