// /lib/shop/fetchCollection.js
import { sfFetch } from '@/app/api/shopify/product/[handle]/route';

export async function fetchCollection({ handle, filters = {} }) {
  // 1. המרת מסנני מיון
  const sortKey = filters.sort === 'price_asc' || filters.sort === 'price_desc' ? 'PRICE' : 'BEST_SELLING';
  const reverse = filters.sort === 'price_desc';

  // 2. המרת פילטרים מה-URL למבנה של שופיפיי (GraphQL ProductFilter)
  const shopifyFilters = [];

  // תגיות (למשל road-helmets)
  if (filters.tag) {
    shopifyFilters.push({ tag: filters.tag });
  }
  // יצרן (Vendor)
  if (filters.vendor) {
    shopifyFilters.push({ productVendor: filters.vendor });
  }

  // פילטרים דינמיים (מידה, צבע, מחיר וכו' - מגיעים עם קידומת filter.)
  Object.keys(filters).forEach(key => {
    if (key.startsWith('filter.')) {
      try {
         // שופיפיי לפעמים שולחת JSON
         const val = JSON.parse(filters[key]); 
         shopifyFilters.push({ [key.replace('filter.', '')]: val });
      } catch {
         // ולפעמים סטרינג רגיל
         shopifyFilters.push({ [key]: filters[key] });
      }
    }
  });

  const query = `#graphql
    query GetCollection($handle: String!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $filters: [ProductFilter!]) {
      collection(handle: $handle) {
        id
        title
        description
        
        # 👇 שליפת מוצרים עם פילטרים מיושמים
        products(first: 50, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
          edges {
            node {
              id
              title
              handle
              availableForSale
              vendor 
              tags
              
              images(first: 1) {
                edges { node { url altText } }
              }
              
              priceRange {
                minVariantPrice { amount currencyCode }
              }
              
              variants(first: 1) {
                edges { 
                  node { 
                    id 
                    price { amount currencyCode } 
                  } 
                }
              }
              
              metafields(identifiers: [
                { namespace: "compatibility", key: "year_from" },
                { namespace: "compatibility", key: "year_to" }
              ]) {
                namespace
                key
                value
              }
            }
          }
        }

        # 👇 החלק החדש: שליפת אפשרויות הסינון (Facets) עבור הסרגל
        # אנו מבקשים 0 מוצרים כי המטרה כאן היא רק לקבל את המטא-דאטה של הפילטרים
        filters: products(first: 0) {
          filters {
            id
            label
            type
            values {
              id
              label
              count
              input # זה הנתון שנצטרך לשלוח חזרה ב-URL
            }
          }
        }
      }
    }
  `;

  // שליחת הבקשה עם המשתנים החדשים
  const { data, error } = await sfFetch(query, { 
    handle, 
    sortKey, 
    reverse,
    filters: shopifyFilters 
  });

  if (error || !data?.data?.collection) {
    console.error(`Error fetching collection ${handle}:`, error);
    return null;
  }

  const collection = data.data.collection;

  // המרת המוצרים למבנה של ProductGrid
  const products = collection.products.edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    handle: node.handle,
    availableForSale: node.availableForSale,
    vendor: node.vendor,
    tags: node.tags,
    metafields: node.metafields,
    images: node.images,
    variants: {
      edges: [
        {
          node: {
            price: node.priceRange.minVariantPrice
          }
        }
      ]
    }
  }));

  return {
    title: collection.title,
    description: collection.description,
    products: products,
    filters: collection.filters?.filters || [] // מחזירים את הפילטרים לסרגל
  };
}