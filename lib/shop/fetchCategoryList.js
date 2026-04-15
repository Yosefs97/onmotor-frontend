// /lib/shop/fetchCategoryList.js
import { sfFetch } from '@/lib/shopify';

// לינקים מיוחדים
const CUSTOM_LINKS = {
  'parts': '/shop', 
};

export async function fetchCategoryList() {
  const query = `#graphql
    fragment CollectionInfo on Collection {
      id
      title
      handle
      image { url altText }
      products(first: 1) {
        edges { node { featuredImage { url } } }
      }
    }
    
    query GetSpecificCollections {
      # הסרתי את parts מהשאילתה כי אנחנו לא מציגים אותו יותר
      road: collection(handle: "road") { ...CollectionInfo }
      offroad: collection(handle: "offroad") { ...CollectionInfo }
      oils: collection(handle: "oils") { ...CollectionInfo }
      tires: collection(handle: "tires") { ...CollectionInfo }
      battery: collection(handle: "battery") { ...CollectionInfo }
    }
  `;

  const { data, error } = await sfFetch(query);
  if (error || !data?.data) {
    console.error('Error fetching categories:', error);
    return [];
  }

  const collectionsObj = data.data;
  const result = [];
  
  // 👇 הסרתי את 'parts' מהרשימה הזו - זה מה שמעלים את הקוביה!
  const keys = ['road', 'offroad', 'oils', 'tires','battery'];

  keys.forEach(key => {
    const node = collectionsObj[key];
    if (node) {
      const img = node.image?.url || node.products.edges?.[0]?.node?.featuredImage?.url;
      const href = CUSTOM_LINKS[node.handle] || `/shop/collection/${node.handle}`;

      result.push({
        title: node.title,
        handle: node.handle,
        href: href,
        image: img || null 
      });
    }
  });

  return result;
}