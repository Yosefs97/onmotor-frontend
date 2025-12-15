// /lib/shop/fetchCollection.js
import { sfFetch } from '@/app/api/shopify/product/[handle]/route';

export async function fetchCollection({ handle, filters = {} }) {
  // 1. המרת מסנני מיון
  const sortKey = filters.sort === 'price_asc' || filters.sort === 'price_desc' ? 'PRICE' : 'BEST_SELLING';
  const reverse = filters.sort === 'price_desc';

  // 2. המרת פילטרים למבנה ששופיפיי מבינה
  const shopifyFilters = [];

  // --- תמיכה במנוע החיפוש הישן (Legacy Support) ---
  // המרת דגם לתגית (לדוגמה: model=EXC -> tag:model:EXC)
  if (filters.model) {
    shopifyFilters.push({ tag: `model:${filters.model}` });
  }

  // המרת שנה לתגית (לדוגמה: year=2020 -> tag:year:2020)
  // הערה: הסרגל הישן שולח טווח, אבל בדרך כלל בחיפוש ממוקד נשלח פרמטר ספציפי או שהלוגיקה ממירה אותו.
  // אם ה-URL מכיל year=2020:
  if (filters.year) {
    shopifyFilters.push({ tag: `year:${filters.year}` });
  }
  
  // אם הסרגל שולח שאילתת טקסט (q)
  // שופיפיי GraphQL בתוך Collection לא תמיד תומך ב-q, אבל נשאיר את זה נקי כרגע.
  // ------------------------------------------------

  // תמיכה רגילה (תגיות ויצרן)
  if (filters.tag) {
    shopifyFilters.push({ tag: filters.tag });
  }
  if (filters.vendor) {
    shopifyFilters.push({ productVendor: filters.vendor });
  }

  // תמיכה בפילטרים חכמים (מידה/צבע וכו')
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
        
        # הגדלתי ל-100 מוצרים כדי לוודא שתוצאות החיפוש מלאות
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
              
              # שומרים על המטא-פילדס שהיו לך קודם
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

        # נתונים לסינון החדש (לא מפריע לישן)
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
    console.error(`Error fetching collection ${handle}:`, error);
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