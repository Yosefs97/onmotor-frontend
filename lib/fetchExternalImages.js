// lib/fetchExternalImages.js
import * as cheerio from 'cheerio';

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

    const normalizeUrl = (src) => {
      if (!src) return null;
      if (src.startsWith('http')) return src;
      if (src.startsWith('//')) return `https:${src}`;
      if (src.startsWith('data:')) return null;
      return `${baseUrl}/${src.replace(/^\/+/, '')}`;
    };

    $('img').each((_, el) => {
      const src = $(el).attr('src');
      const full = normalizeUrl(src);
      if (full) found.add(full);
    });

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && /\.(jpg|jpeg|png|gif|webp)$/i.test(href)) {
        const full = normalizeUrl(href);
        if (full) found.add(full);
      }
    });

    // 🟠 fallback ל-KTM – אם אין תמונות ב-HTML
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

    const images = Array.from(found)
      .filter((src) => /\.(jpg|jpeg|png|gif|webp)$/i.test(src))
      // 🔄 שינוי: הוספת מסנן להסרת קבצי loading.gif
      .filter((src) => !src.toLowerCase().includes('loading.gif'))
      .filter((src) => !src.toLowerCase().includes('/assets/img/0.gif'))
      .filter((src) => !src.toLowerCase().includes('/assets/img/logo.png'))
      .map((src) => ({ src, alt: '', title: '' }));

    console.log(`✅ Found ${images.length} images from ${pageUrl}`);
    return images;
  } catch (err) {
    console.error('❌ fetchExternalImages error:', err);
    return [];
  }
}