// /lib/shop/fetchCollection.js
import { sfFetch } from '@/app/api/shopify/product/[handle]/route';

export async function fetchCollection({ handle, filters = {} }) {
  // 1. מיון
  const sortKey = filters.sort === 'price_asc' || filters.sort === 'price_desc' ? 'PRICE' : 'BEST_SELLING';
  const reverse = filters.sort === 'price_desc';

  // 2. המרת הפילטרים למבנה של שופיפיי
  const shopifyFilters = [];

  // --- תיקון קריטי: תמיכה במנוע הישן ---
  
  // דגם: המרה לתגית model:EXC
  if (filters.model) {
    shopifyFilters.push({ tag: `model:${filters.model}` });
  }

  // שנה: המנוע הישן שולח טווח. אם הטווח הוא שנה אחת (למשל 2020-2020), נחפש את התגית הספציפית
  if (filters.yearFrom && filters.yearTo && filters.yearFrom === filters.yearTo) {
    shopifyFilters.push({ tag: `year:${filters.yearFrom}` });
  } 
  // אם מחפשים שנה בודדת ספציפית
  else if (filters.year) {
    shopifyFilters.push({ tag: `year:${filters.year}` });
  }
  
  // יצרן
  if (filters.vendor) {
    shopifyFilters.push({ productVendor: filters.vendor });
  }

  // תגיות רגילות
  if (filters.tag) {
    shopifyFilters.push({ tag: filters.tag });
  }

  // פילטרים חכמים (Size, Color וכו')
  Object.keys(filters).forEach(key => {
    if (key.startsWith('filter.')) {
      try {
         const val = JSON.parse(filters[key]); 
         shopifyFilters.push({ [key.replace('filter.', '')]: val });
      } catch {
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
        
        # מושכים 100 מוצרים כדי לוודא שיש מספיק תוצאות
        products(first: 100, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
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

        # נתוני סינון לסרגל החדש
        filters: products(first: 0) {
          filters {
            id
            label
            type
            values { id label count input }
          }
        }
      }
    }
  `;

  const { data, error } = await sfFetch(query, { 
    handle, 
    sortKey, 
    reverse,
    filters: shopifyFilters 
  });

  if (error || !data?.data?.collection) {
    // זה קורה בדרך כלל אם האוסף 'all' לא קיים בשופיפיי
    console.error(`Error fetching collection ${handle}. Check if collection exists in Shopify.`, error);
    return null;
  }

  const collection = data.data.collection;

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
        { node: { price: node.priceRange.minVariantPrice } }
      ]
    }
  }));

  return {
    title: collection.title,
    description: collection.description,
    products: products,
    filters: collection.filters?.filters || []
  };
}