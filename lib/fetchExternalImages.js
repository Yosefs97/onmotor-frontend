// lib/fetchExternalImages.js
import * as cheerio from 'cheerio';

/**
 * שולף את כל כתובות התמונות מעמוד אינטרנט כלשהו (כולל עמודי יצרנים)
 */
export async function fetchExternalImages(pageUrl) {
  try {
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36',
      },
    });

    if (!response.ok)
      throw new Error(`HTTP ${response.status} when fetching ${pageUrl}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const baseUrl = new URL(pageUrl).origin;

    const found = new Set();

    // פונקציה שתנרמל נתיבים לכתובת מלאה
    const normalizeUrl = (src) => {
      if (!src) return null;
      if (src.startsWith('http')) return src;
      if (src.startsWith('//')) return `https:${src}`;
      if (src.startsWith('data:')) return null;
      return `${baseUrl}/${src.replace(/^\/+/, '')}`;
    };

    // 1. תגיות <img>
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      const full = normalizeUrl(src);
      if (full) found.add(full);
    });

    // 2. קישורים ל־.jpg / .png / .webp וכו'
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(href)) {
        const full = normalizeUrl(href);
        if (full) found.add(full);
      }
    });

    // 3. data-src / data-rel
    $('[data-src],[data-rel]').each((_, el) => {
      const attr = $(el).attr('data-src') || $(el).attr('data-rel');
      const full = normalizeUrl(attr);
      if (full) found.add(full);
    });

    // 4. רקע CSS: style="background-image:url(...jpg)"
    $('[style]').each((_, el) => {
      const style = $(el).attr('style');
      const match = style?.match(/url\(['"]?(.*?)['"]?\)/i);
      if (match && match[1]) {
        const full = normalizeUrl(match[1]);
        if (full) found.add(full);
      }
    });

    const images = Array.from(found)
      .filter((src) => /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(src))
      .map((src) => ({ src, alt: '', title: '' }));

    console.log(`✅ Found ${images.length} images from ${pageUrl}`);
    return images;
  } catch (err) {
    console.error('❌ fetchExternalImages error:', err);
    return [];
  }
}
