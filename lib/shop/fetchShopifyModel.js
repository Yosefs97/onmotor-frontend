// /lib/shop/fetchShopifyModel.js
import { sfFetch } from '@/lib/shopify';

export async function fetchShopifyModel({ vendor, model, filters = {} }) {
  // חיפוש רחב כדי למשוך מהשרת כל מוצר שקשור לדגם
  const cleanModel = model.replace(/-/g, ' ');
  const modelNoSpaces = model.replace(/[^a-zA-Z0-9]/g, '');
  const searchQuery = `${cleanModel} OR ${modelNoSpaces}`;

  // שאילתת GraphQL ישירה
  const query = `#graphql
    query SearchModelProducts($query: String!) {
      search(query: $query, first: 250, types: PRODUCT) {
        edges {
          node {
            ... on Product {
              id
              title
              handle
              availableForSale
              vendor
              productType
              tags
              images(first: 1) { edges { node { url altText } } }
              variants(first: 1) { edges { node { price { amount currencyCode } } } }
              metafields(identifiers: [
                { namespace: "compatibility", key: "year_from" },
                { namespace: "compatibility", key: "year_to" }
              ]) { namespace key value }
            }
          }
        }
      }
    }
  `;

  try {
    const { data, error } = await sfFetch(query, { query: searchQuery });
    let items = [];
    
    // מנגנון זיהוי חכם למיקום הנתונים (מטפל במקרה של data.data וגם data ישיר)
    const responseData = data?.data || data;
    
    if (!error && responseData?.search?.edges) {
      items = responseData.search.edges.map(e => e.node);
    }

    if (items.length === 0) return [];

    // 🔥 התיקון: המשתנים ירדו שורה ולא נבלעים בהערה 🔥
    const normalizedVendorTarget = vendor.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedModelTarget = model.toLowerCase().replace(/[^a-z0-9]/g, '');

    const strictlyMatchedItems = items.filter((p) => {
      // אם אין תגיות, מסננים החוצה
      if (!p.tags || !Array.isArray(p.tags)) return false;

      // דורשים לפחות תגית התאמה אחת שעונה במדויק על יצרן + דגם
      return p.tags.some((t) => {
        if (!t.toLowerCase().startsWith('fit:')) return false;
        
        const parts = t.split(':');
        if (parts.length < 3) return false;

        const tagVendor = parts[1].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const tagModel = parts[2].trim().toLowerCase().replace(/[^a-z0-9]/g, '');

        // השוואה שמתעלמת מרווחים ומקפים
        return tagVendor === normalizedVendorTarget && tagModel === normalizedModelTarget;
      });
    });

    // מיון לפי א-ב 
    return strictlyMatchedItems.sort((a, b) =>
      a.title.localeCompare(b.title, 'he', { sensitivity: 'base' })
    );

  } catch (err) {
    console.error("Error fetching model products directly from Shopify:", err);
    return [];
  }
}