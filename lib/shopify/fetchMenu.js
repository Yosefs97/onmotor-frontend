//lib/shopify/fetchMenu.js
import { sfFetch } from '@/lib/shopify';

export async function fetchMenu(handle) {
  const query = `
    query getMenu($handle: String!) {
      menu(handle: $handle) {
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

  const { data } = await sfFetch(query, { handle });
  
  // אם אין תפריט או קרתה שגיאה, מחזירים מערך ריק כדי לא לשבור את האתר
  return data?.menu?.items || [];
}