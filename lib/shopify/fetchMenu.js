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

  console.log(`🔍 DEBUG: Asking Shopify for menu: "${handle}"`);

  try {
    const response = await sfFetch(query, { handle });
    
    // 👇 זה ידפיס לנו בדיוק למה שופיפיי מסרב
    console.log(`📦 DEBUG RESPONSE for ${handle}:`, JSON.stringify(response, null, 2));

    if (!response?.data?.menu) {
        console.error(`❌ ERROR: Shopify returned NULL. Verify Handle & Permissions!`);
        return [];
    }

    return response.data.menu.items || [];

  } catch (e) {
    console.error(`💥 CRITICAL ERROR:`, e);
    return [];
  }
}