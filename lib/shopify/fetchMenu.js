//lib/shopify/fetchMenu.js
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

  console.log(`🔍 DEBUG: Requesting menu with handle: "${handle}"`);

  try {
    const response = await sfFetch(query, { handle });
    
    // 👇 זה ידפיס לנו בטרמינל של Vercel את התשובה הגולמית משופיפיי
    console.log(`📦 DEBUG: Raw Shopify Response for "${handle}":`, JSON.stringify(response, null, 2));

    if (!response?.data?.menu) {
        console.error(`❌ ERROR: Menu with handle "${handle}" not found (returned null). Check Shopify Admin!`);
        return [];
    }

    const items = response.data.menu.items || [];
    console.log(`✅ DEBUG: Found ${items.length} items in menu.`);
    return items;

  } catch (e) {
    console.error(`💥 CRITICAL ERROR fetching menu:`, e);
    return [];
  }
}