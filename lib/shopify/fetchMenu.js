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
    
    // אם התפריט לא נמצא, נחזיר מערך ריק (במקום לקרוס)
    if (!response?.data?.menu) {
        console.error(`❌ Menu "${handle}" not found. Check handle name.`);
        return [];
    }

    return response.data.menu.items || [];

  } catch (e) {
    console.error(`💥 Error fetching menu:`, e);
    return [];
  }
}