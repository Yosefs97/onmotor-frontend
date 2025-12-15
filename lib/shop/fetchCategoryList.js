// /lib/shop/fetchCategoryList.js
import { sfFetch } from '@/app/api/shopify/product/[handle]/route';

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
      parts: collection(handle: "parts") { ...CollectionInfo }
      road: collection(handle: "road") { ...CollectionInfo }
      offroad: collection(handle: "offroad") { ...CollectionInfo }
      oils: collection(handle: "oils") { ...CollectionInfo }
      tires: collection(handle: "tires") { ...CollectionInfo }
    }
  `;

  const { data, error } = await sfFetch(query);
  if (error || !data?.data) {
    console.error('Error fetching categories:', error);
    return [];
  }

  const collectionsObj = data.data;
  const result = [];
  
  // סדר ההופעה באתר
  const keys = ['parts', 'road', 'offroad', 'oils', 'tires'];

  keys.forEach(key => {
    const node = collectionsObj[key];
    if (node) {
      const img = node.image?.url || node.products.edges?.[0]?.node?.featuredImage?.url;
      // בדיקת לינק מיוחד
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