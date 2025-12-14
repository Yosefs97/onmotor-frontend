// /lib/shop/fetchCategoryList.js
import { sfFetch } from '@/app/api/shopify/product/[handle]/route';

export async function fetchCategoryList(handles) {
  const queryString = handles.map(h => `handle:${h}`).join(' OR ');

  // 👇 עדכנתי את השאילתה: היא מבקשת גם תמונת אוסף וגם את המוצר הראשון לגיבוי
  const query = `#graphql
    query GetCategoryList($query: String!) {
      collections(first: 20, query: $query) {
        edges {
          node {
            id
            title
            handle
            
            # 1. תמונת האוסף הרשמית
            image {
              url
              altText
            }

            # 2. גיבוי: תמונה של המוצר הראשון באוסף
            products(first: 1) {
              edges {
                node {
                  featuredImage {
                    url
                  }
                }
              }
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

  const fetchedItems = data.data.collections.edges.map(({ node }) => {
    // 👇 הלוגיקה החדשה: נסה לקחת תמונת אוסף -> אם אין, קח תמונת מוצר -> אם אין, החזר null
    const collectionImage = node.image?.url;
    const firstProductImage = node.products.edges?.[0]?.node?.featuredImage?.url;

    return {
      title: node.title,
      handle: node.handle,
      href: `/shop/collection/${node.handle}`,
      image: collectionImage || firstProductImage || null 
    };
  });

  const sortedItems = handles.map(handle => 
    fetchedItems.find(item => item.handle === handle)
  ).filter(Boolean);

  return sortedItems;
}