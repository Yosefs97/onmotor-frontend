// /lib/shop/fetchManufacturers.js
import { sfFetch } from '@/lib/shopify';

export async function fetchManufacturers() {
  // בניית שאילתה שמבקשת את האוספים וגם את הסימון המיוחד שיצרנו
  const query = `#graphql
    query GetManufacturers {
      collections(first: 250, sortKey: TITLE) {
        edges {
          node {
            id
            title
            handle
            image {
              url
              altText
            }
            # 👇 כאן אנחנו שולפים את הסימון: האם זה יצרן?
            metafield(namespace: "custom", key: "is_manufacturer") {
              value
            }
          }
        }
      }
    }
  `;

  // שליחה לשופיפיי
  const { data, error } = await sfFetch(query);

  if (error || !data?.data?.collections) {
    console.error('Error fetching manufacturers:', error);
    return [];
  }

  // המרת המבנה של שופיפיי לרשימה פשוטה
  const items = data.data.collections.edges.map(edge => edge.node);

  // 🔥 הסינון החכם:
  // אנחנו משאירים רק את האוספים שבהם הסימון הוא "true"
  const manufacturers = items.filter(collection => {
    return collection.metafield?.value === 'true';
  });

  // מיון אלפביתי (למרות שביקשנו משופיפיי, תמיד טוב לוודא)
  manufacturers.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));

  return manufacturers;
}