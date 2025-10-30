// lib/fetchExternalImages.js
import * as cheerio from 'cheerio';

/**
 * שולף תמונות מכל דף אינטרנט (כולל דפי יצרנים כמו KTM, Yamaha, Ducati וכו').
 * מזהה אוטומטית <img>, data-src, href עם סיומות תמונה, או נתיבים יחסיים.
 * @param {string} pageUrl כתובת הדף שממנו רוצים לשלוף תמונות
 * @returns {Promise<Array<{src: string, alt?: string, title?: string}>>}
 */
export async function fetchExternalImages(pageUrl) {
  try {
    if (!pageUrl) throw new Error('Missing URL');

    // ✅ שליפת הדף עם user-agent כדי למנוע חסימות
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    if (!response.ok)
      throw new Error(`Failed to fetch ${pageUrl} (status ${response.status})`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const baseUrl = new URL(pageUrl).origin;

    const found = new Set();

    /**
     * פונקציה פנימית שמתקנת נתיב יחסי ל־URL מלא
     */
    const normalizeUrl = (src) => {
      if (!src) return null;
      if (src.startsWith('http')) return src;
      return `${baseUrl}/${src.replace(/^\/+/, '')}`;
    };

    // ✅ 1. כל תגיות ה־<img>
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !src.startsWith('data:')) {
        const fullUrl = normalizeUrl(src);
        if (fullUrl) found.add(fullUrl);
      }
    });

    // ✅ 2. href של <a> שמכיל סיומת תמונה
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(href)) {
        const fullUrl = normalizeUrl(href);
        if (fullUrl) found.add(fullUrl);
      }
    });

    // ✅ 3. data-src או data-rel או style background-image
    $('[data-src],[data-rel],[style]').each((_, el) => {
      const dataSrc =
        $(el).attr('data-src') ||
        $(el).attr('data-rel') ||
        $(el).attr('style');

      if (dataSrc) {
        const match = dataSrc.match(
          /(https?:\/\/[^\s'")]+(\.jpg|\.jpeg|\.png|\.gif|\.webp|\.avif))/i
        );
        if (match && match[1]) found.add(match[1]);
        else if (dataSrc.includes('Content/')) {
          const fullUrl = normalizeUrl(dataSrc);
          if (fullUrl) found.add(fullUrl);
        }
      }
    });

    // ✅ יצירת מערך מאוחד
    const images = Array.from(found).map((src) => ({
      src,
      alt: '',
      title: '',
    }));

    console.log(`✅ Found ${images.length} images from ${pageUrl}`);
    return images;
  } catch (err) {
    console.error('❌ fetchExternalImages error:', err);
    return [];
  }
}
