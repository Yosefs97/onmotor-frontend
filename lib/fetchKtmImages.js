// lib/fetchKtmImages.js
import * as cheerio from 'cheerio';

/**
 * חיפוש תמונות מתוך עמוד מדיה של KTM Press.
 * @param {string} pageUrl - כתובת עמוד KTM Press.
 * @returns {Promise<string[]>} מערך כתובות תמונות מלאות.
 */
export async function fetchKtmImages(pageUrl) {
  try {
    const response = await fetch(pageUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);
    const baseUrl = new URL(pageUrl).origin; // https://press.ktm.com

    const images = [];

    // חיפוש תגיות <img> או נתיבי תמונה עם src יחסי
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt') || '';
      const title = $(el).attr('title') || '';

      if (src && src.includes('Content/')) {
        // ניקוי ויצירת נתיב מלא
        const fullUrl = src.startsWith('http')
          ? src
          : `${baseUrl}/${src.replace(/^\/+/, '')}`;
        images.push({ src: fullUrl, alt, title });
      }
    });

    // אם לא נמצאו תמונות, אפשר לבדוק תגיות אחרות או CSS רקע (למקרים חריגים)
    return images;
  } catch (err) {
    console.error('fetchKtmImages error:', err);
    return [];
  }
}
