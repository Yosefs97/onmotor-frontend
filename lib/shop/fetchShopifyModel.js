// /lib/shop/fetchShopifyModel.js
import { sfFetch } from '@/lib/shopify';

export async function fetchShopifyModel({ vendor, model, filters = {} }) {
  // חיפוש רחב שמוודא שנתפוס את המוצר גם אם הדגם כתוב עם רווחים וגם אם בלי (נפוץ בתגיות)
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
    
    // 🔥 התיקון החשוב: הוספת .data כפול כדי לגשת נכון לאובייקט התשובה משופיפיי
    if (!error && data?.data?.search?.edges) {
      items = data.data.search.edges.map(e => e.node);
    }

    // 🔥 סינון קפדני ואחזר מבוסס תגיות *בלבד* const normalizedVendorTarget = vendor.toLowerCase().replace(/[^a-z0-9]/g, '');
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

        // השוואה שמתעלמת מרווחים, מקפים ואותיות גדולות (גם של המותג וגם של הדגם)
        return tagVendor === normalizedVendorTarget && tagModel === normalizedModelTarget;
      });
    });

    // מיון לפי א-ב עברי
    return strictlyMatchedItems.sort((a, b) =>
      a.title.localeCompare(b.title, 'he', { sensitivity: 'base' })
    );

  } catch (err) {
    console.error("Error fetching model products directly from Shopify:", err);
    return [];
  }
}