// lib/fetchExternalImages.js
import * as cheerio from 'cheerio';

/**
 * אוניברסלי – שולף את כל כתובות התמונות מעמוד אינטרנט כלשהו.
 */
export async function fetchExternalImages(pageUrl) {
  try {
    console.log(`🔍 Fetching images from ${pageUrl}`);
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
      },
    });

    if (!response.ok)
      throw new Error(`HTTP ${response.status} when fetching ${pageUrl}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const baseUrl = new URL(pageUrl).origin;
    const found = new Set();

    // פונקציה שמתקנת נתיבים יחסיים
    const normalizeUrl = (src) => {
      if (!src) return null;
      if (src.startsWith('http')) return src;
      if (src.startsWith('//')) return `https:${src}`;
      if (src.startsWith('data:')) return null;
      return `${baseUrl}/${src.replace(/^\/+/, '')}`;
    };

    // 1️⃣ תגיות <img>
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      const full = normalizeUrl(src);
      if (full) found.add(full);
    });

    // 2️⃣ תגיות <source srcset="...">
    $('source').each((_, el) => {
      const srcset = $(el).attr('srcset');
      if (srcset) {
        srcset
          .split(',')
          .map((s) => s.trim().split(' ')[0])
          .forEach((s) => {
            const full = normalizeUrl(s);
            if (full) found.add(full);
          });
      }
    });

    // 3️⃣ קישורים שמפנים לתמונות
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(href)) {
        const full = normalizeUrl(href);
        if (full) found.add(full);
      }
    });

    // 4️⃣ תגיות meta (og:image, twitter:image)
    $('meta[property="og:image"], meta[name="twitter:image"]').each((_, el) => {
      const content = $(el).attr('content');
      if (content) {
        const full = normalizeUrl(content);
        if (full) found.add(full);
      }
    });

    // 5️⃣ סגנונות עם background-image:url(...)
    $('[style]').each((_, el) => {
      const style = $(el).attr('style');
      const match = style?.match(/url\(["']?(.*?)["']?\)/i);
      if (match && match[1]) {
        const full = normalizeUrl(match[1]);
        if (full) found.add(full);
      }
    });

    // 6️⃣ fallback – כל כתובת שיש בה תמונה בטקסט הגולמי
    const regexMatches = html.match(/https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp|avif|svg)/gi);
    if (regexMatches) {
      regexMatches.forEach((url) => found.add(url));
    }

    // 7️⃣ ניקוי כפילויות וסינון לפי סיומות לגיטימיות
    const images = Array.from(found)
      .map((src) => src.trim())
      .filter(
        (src, i, arr) =>
          /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(src) &&
          arr.indexOf(src) === i
      )
      .map((src) => ({ src, alt: '', title: '' }));

    console.log(`✅ Found ${images.length} images from ${pageUrl}`);
    return images;
  } catch (err) {
    console.error('❌ fetchExternalImages error:', err);
    return [];
  }
}
