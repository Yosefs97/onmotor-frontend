// /lib/shop/fetchCategoryList.js
import { sfFetch } from '@/app/api/shopify/product/[handle]/route';

export async function fetchCategoryList() {
  // אנחנו מבקשים כל קטגוריה בנפרד (Aliases) כדי לא להסתמך על מנוע החיפוש
  // זה מבטיח שאם האוסף קיים - נקבל אותו
  const query = `#graphql
    fragment CollectionInfo on Collection {
      id
      title
      handle
      image {
        url
        altText
      }
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

    query GetSpecificCollections {
      helmets: collection(handle: "helmets") { ...CollectionInfo }
      clothing: collection(handle: "clothing") { ...CollectionInfo }
      gloves: collection(handle: "gloves") { ...CollectionInfo }
      offroad: collection(handle: "offroad-gear") { ...CollectionInfo }
      oils: collection(handle: "oils") { ...CollectionInfo }
      accessories: collection(handle: "accessories") { ...CollectionInfo }
    }
  `;

  const { data, error } = await sfFetch(query);

  if (error || !data?.data) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // הופכים את התשובה לרשימה מסודרת
  const collectionsObj = data.data;
  const result = [];

  // רשימת המפתחות לפי הסדר שרצינו
  const keys = ['helmets', 'clothing', 'gloves', 'offroad', 'oils', 'accessories'];

  keys.forEach(key => {
    const node = collectionsObj[key];
    if (node) {
      // לוגיקת התמונה (ראשי -> או מוצר ראשון -> או כלום)
      const collectionImage = node.image?.url;
      const firstProductImage = node.products.edges?.[0]?.node?.featuredImage?.url;

      result.push({
        title: node.title,
        handle: node.handle,
        href: `/shop/collection/${node.handle}`,
        image: collectionImage || firstProductImage || null 
      });
    }
  });

  return result;
}