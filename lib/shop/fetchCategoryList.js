// /lib/shop/fetchCategoryList.js
import { sfFetch } from '@/app/api/shopify/product/[handle]/route';

export async function fetchCategoryList(handles) {
  // בניית שאילתה דינמית שמחפשת רק את האוספים הספציפיים האלה
  // אנו משתמשים ב- OR כדי למצוא את כולם במכה אחת
  const queryString = handles.map(h => `handle:${h}`).join(' OR ');

  const query = `#graphql
    query GetCategoryList($query: String!) {
      collections(first: 20, query: $query) {
        edges {
          node {
            id
            title
            handle
            image {
              url
              altText
            }
          }
        }
      }
    }
  `;

  const { data, error } = await sfFetch(query, { query: queryString });

  if (error || !data?.data?.collections) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // המרה למבנה פשוט
  const fetchedItems = data.data.collections.edges.map(({ node }) => ({
    title: node.title,
    handle: node.handle,
    href: `/shop/collection/${node.handle}`,
    image: node.image?.url || null // 🔥 הנה התמונה משופיפיי
  }));

  // סידור התוצאות לפי הסדר המקורי שביקשת (כי שופיפיי עלול להחזיר בסדר אקראי)
  const sortedItems = handles.map(handle => 
    fetchedItems.find(item => item.handle === handle)
  ).filter(Boolean); // מסנן החוצה קטגוריות שלא נמצאו

  return sortedItems;
}