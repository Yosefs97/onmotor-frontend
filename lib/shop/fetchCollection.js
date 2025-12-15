// /lib/shop/fetchCollection.js
import { sfFetch } from '@/app/api/shopify/product/[handle]/route';

export async function fetchCollection({ handle, filters = {} }) {
  const sortKey = filters.sort === 'price_asc' || filters.sort === 'price_desc' ? 'PRICE' : 'BEST_SELLING';
  const reverse = filters.sort === 'price_desc';

  const shopifyFilters = [];

  // --- 1. תמיכה בחיפוש הישן (דגם/שנה) ---
  if (filters.model) shopifyFilters.push({ tag: `model:${filters.model}` });
  if (filters.vendor) shopifyFilters.push({ productVendor: filters.vendor });
  if (filters.tag) shopifyFilters.push({ tag: filters.tag });

  // בדיקת טווח שנים בסיסית (אם זה שנה בודדת)
  if (filters.year && !filters.yearFrom) {
     shopifyFilters.push({ tag: `year:${filters.year}` });
  }

  // --- 2. תרגום פילטרים חכמים ל-GraphQL ---
  Object.keys(filters).forEach(key => {
    if (key.startsWith('filter.')) {
      try {
         // מנסים לפרסר את הערך (לרוב הוא JSON)
         let val = filters[key];
         try { val = JSON.parse(val); } catch {} 

         // 🟢 תיקון קריטי: מיפוי נכון של שמות הפילטרים ל-API של שופיפיי

         // מלאי (Availability)
         if (key.includes('v.availability')) {
            // שופיפיי שולח 1 (זמין) או 0 (לא זמין), ה-API רוצה true/false
            const isAvailable = val === '1' || val === 1 || val === true || (Array.isArray(val) && val.includes('1'));
            if (isAvailable) {
                shopifyFilters.push({ available: true });
            }
         }
         // מחיר (Price)
         else if (key.includes('v.price')) {
            // טיפול בטווח מחירים: { "min": 0, "max": 100 }
            shopifyFilters.push({ price: val });
         }
         // וריאציות (מידה, צבע) - Variant Options
         else if (key.includes('v.option')) {
             // צריך לחלץ את שם האופציה מהמפתח (למשל size מתוך filter.v.option.size)
             const parts = key.split('.');
             const optionName = parts[parts.length - 1]; // לוקח את המילה האחרונה
             
             // אם זה מערך (בחרו כמה מידות), צריך להוסיף כל אחת
             if (Array.isArray(val)) {
                 val.forEach(v => shopifyFilters.push({ variantOption: { name: optionName, value: v } }));
             } else {
                 shopifyFilters.push({ variantOption: { name: optionName, value: val } });
             }
         }
         // סוג מוצר (Product Type)
         else if (key.includes('p.product_type')) {
             if (Array.isArray(val)) {
                 val.forEach(v => shopifyFilters.push({ productType: v }));
             } else {
                 shopifyFilters.push({ productType: val });
             }
         }
         // מותג (Vendor) - אם מגיע מהפילטר החכם
         else if (key.includes('p.vendor')) {
             if (Array.isArray(val)) {
                 val.forEach(v => shopifyFilters.push({ productVendor: v }));
             } else {
                 shopifyFilters.push({ productVendor: val });
             }
         }

      } catch (e) {
         console.error("Filter parsing error:", e);
      }
    }
  });

  const query = `#graphql
    query GetCollection($handle: String!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $filters: [ProductFilter!]) {
      collection(handle: $handle) {
        id
        title
        description
        products(first: 250, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
          edges {
            node {
              id
              title
              handle
              availableForSale
              vendor 
              tags
              priceRange { minVariantPrice { amount currencyCode } }
              images(first: 1) { edges { node { url altText } } }
              variants(first: 1) { edges { node { id price { amount currencyCode } } } }
              metafields(identifiers: [
                { namespace: "compatibility", key: "year_from" },
                { namespace: "compatibility", key: "year_to" }
              ]) { namespace key value }
            }
          }
        }
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

  const { data, error } = await sfFetch(query, { handle, sortKey, reverse, filters: shopifyFilters });

  if (error || !data?.data?.collection) return null;

  const collection = data.data.collection;
  let rawProducts = collection.products.edges.map(e => e.node);

  // --- סינון ידני לשנים (כמו קודם) ---
  if (filters.yearFrom || filters.yearTo) {
    const userFrom = parseInt(filters.yearFrom || '0', 10);
    const userTo = parseInt(filters.yearTo || '9999', 10);
    rawProducts = rawProducts.filter(prod => {
      const mf = {};
      (prod.metafields || []).forEach((m) => { if(m) mf[m.key] = parseInt(m.value, 10); });
      const prodFrom = mf.year_from || 0;
      const prodTo = mf.year_to || 9999;
      return prodFrom <= userTo && prodTo >= userFrom;
    });
  }

  const products = rawProducts.map((node) => ({
    id: node.id,
    title: node.title,
    handle: node.handle,
    availableForSale: node.availableForSale,
    vendor: node.vendor,
    tags: node.tags,
    metafields: node.metafields,
    images: node.images,
    variants: { edges: [{ node: { price: node.priceRange.minVariantPrice } }] }
  }));

  return {
    title: collection.title,
    description: collection.description,
    products: products,
    filters: collection.filters?.filters || []
  };
}