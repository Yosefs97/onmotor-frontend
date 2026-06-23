// /lib/shop/fetchShopifyModel.js
import { sfFetch } from '@/lib/shopify';

export async function fetchShopifyModel({ vendor, model, filters = {} }) {
  // חיפוש חופשי ורחב בשופיפיי שיצוד את כל מה שקשור לדגם (כולל תגיות)
  const searchQuery = model;

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
    
    if (!error && data?.search?.edges) {
      items = data.search.edges.map(e => e.node);
    }

    // 🔥 סינון קפדני ואחזר מבוסס תגיות *בלבד* (Post-Filtering)
    const normalizedVendorTarget = vendor.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedModelTarget = model.toLowerCase().replace(/[^a-z0-9]/g, '');

    const strictlyMatchedItems = items.filter((p) => {
      // אם אין תגיות, אין סיכוי להתאמה
      if (!p.tags || !Array.isArray(p.tags)) return false;

      // אנחנו דורשים שלפחות תגית "fit:" אחת תתאים בצורה מושלמת ליצרן ולדגם
      return p.tags.some((t) => {
        if (!t.toLowerCase().startsWith('fit:')) return false;
        
        const parts = t.split(':');
        if (parts.length < 3) return false;

        const tagVendor = parts[1].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const tagModel = parts[2].trim().toLowerCase().replace(/[^a-z0-9]/g, '');

        // השוואה שמתעלמת מרווחים, מקפים ואותיות גדולות
        return tagVendor === normalizedVendorTarget && tagModel === normalizedModelTarget;
      });
    });

    return strictlyMatchedItems.sort((a, b) =>
      a.title.localeCompare(b.title, 'he', { sensitivity: 'base' })
    );

  } catch (err) {
    console.error("Error fetching model products directly from Shopify:", err);
    return [];
  }
}