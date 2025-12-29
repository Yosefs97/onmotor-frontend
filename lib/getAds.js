// lib/getAds.js

const API_URL = process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const COLLECTION_NAME = 'service-ads';

export async function getLawAds() {
  try {
    const res = await fetch(`${API_URL}/api/${COLLECTION_NAME}?populate=*`, { 
      next: { revalidate: 600 } 
    });
    
    if (!res.ok) return [];
    const json = await res.json();
    
    if (!json.data || !Array.isArray(json.data)) return [];

    return json.data.map(item => {
      let imageUrl = null;

      // 1. בדיקת קישור חיצוני (JSON) - Cloudinary
      const links = item.external_media_links;
      if (Array.isArray(links) && links.length > 0) {
          const firstLink = links[0];
          if (typeof firstLink === 'string' && firstLink.startsWith('http')) {
              imageUrl = firstLink.trim();
          }
      }

      // 2. אם לא נמצא קישור חיצוני, נסה למשוך תמונה מ-Strapi
      if (!imageUrl && item.image) {
        const imgData = Array.isArray(item.image) ? item.image[0] : item.image;
        if (imgData && imgData.url) {
             const url = imgData.url;
             imageUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
        }
      }

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        link: item.link,
        category: item.category, 
        image: { url: imageUrl }
      };
    });
  } catch (error) {
    console.error("Failed to fetch ads:", error);
    return [];
  }
}