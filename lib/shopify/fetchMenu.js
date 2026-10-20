// lib/shopify/fetchMenu.js
import { sfFetch } from '@/lib/shopify';

export async function fetchMenu(handle) {
  const query = `
    query getMenu($handle: String!) {
      menu(handle: $handle) {
        id
        handle
        items {
          title
          url
          items {
            title
            url
            items {
              title
              url
            }
          }
        }
      }
    }
  `;

  try {
    const response = await sfFetch(query, { handle });
    
    // 🔥 התיקון: חדירה נכונה לתוך 2 שכבות ה-data (של הפונקציה שלך + של GraphQL)
    const menuData = response?.data?.data?.menu;

    // אם התפריט לא נמצא בתוך השכבה הפנימית, רק אז נחזיר שגיאה
    if (!menuData) {
        console.error(`❌ Menu "${handle}" not found. Check handle name.`);
        return [];
    }

    return menuData.items || [];

  } catch (e) {
    console.error(`💥 Error fetching menu:`, e);
    return [];
  }
}