import { sfFetch } from '@/lib/shopify';

export async function fetchMenu(handle) {
  // 👇 שאילתה שמבקשת את רשימת כל התפריטים (עד 10)
  const query = `
    query getAllMenus {
      menus(first: 10) {
        nodes {
          handle
          title
          itemsCount
        }
      }
    }
  `;

  console.log(`🕵️ DEBUG: Fetching ALL menus to find the correct handle...`);

  try {
    const response = await sfFetch(query, {});
    
    // 👇 זה ידפיס לנו את הרשימה האמיתית
    console.log(`📋 DEBUG: Available Menus in Shopify:`, JSON.stringify(response, null, 2));

    // זמנית נחזיר מערך ריק כדי לא לשבור את האתר
    return [];

  } catch (e) {
    console.error(`💥 CRITICAL ERROR:`, e);
    return [];
  }
}