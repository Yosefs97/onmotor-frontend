// /lib/shop/fetchShopifyModel.js
import { sfFetch } from '@/lib/shopify';

export async function fetchShopifyModel({ vendor, model, filters = {} }) {
  const cleanVendor = vendor.replace(/-/g, ' ');
  const cleanModel = model.replace(/-/g, ' ');
  const modelNoSpaces = model.replace(/[^a-zA-Z0-9]/g, '');

  const searchQuery = `${cleanVendor} OR ${cleanModel} OR ${modelNoSpaces}`;

  // 🌟 הוספנו תמיכה ב-Cursor לפגינציה
  const query = `#graphql
    query GetModelProducts($query: String!, $cursor: String) {
      products(first: 250, query: $query, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
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
  `;

  try {
    let allItems = [];
    let hasNextPage = true;
    let cursor = null;

    // 🌟 לולאה שמושכת את *כל* המוצרים שעונים לחיפוש, בלי להיעצר ב-250
    while (hasNextPage) {
      const { data, error } = await sfFetch(query, { query: searchQuery, cursor });
      
      if (error) {
        console.error("GraphQL Error in fetchShopifyModel:", error);
        break;
      }

      const responseData = data?.data || data;
      const productsInfo = responseData?.products;

      if (!productsInfo?.edges) break;

      allItems.push(...productsInfo.edges.map(e => e.node));

      hasNextPage = productsInfo.pageInfo.hasNextPage;
      cursor = productsInfo.pageInfo.endCursor;
    }

    if (allItems.length === 0) return [];

    // נרמול אגרסיבי של יצרן ודגם המטרה (אותיות קטנות, בלי רווחים ותווים מיוחדים)
    const normalizedVendorTarget = vendor.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedModelTarget = model.toLowerCase().replace(/[^a-z0-9]/g, '');

    // סינון חכם של המוצרים
    const strictlyMatchedItems = allItems.filter((p) => {
      if (!p.tags || !Array.isArray(p.tags)) return false;

      return p.tags.some((t) => {
        if (!t.toLowerCase().startsWith('fit:')) return false;
        
        const parts = t.split(':');
        if (parts.length < 3) return false;

        const tagVendor = parts[1].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const tagModel = parts[2].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const tagCode = parts[3] ? parts[3].trim().toLowerCase().replace(/[^a-z0-9]/g, '') : null;

        // בודקים התאמה של היצרן
        if (tagVendor !== normalizedVendorTarget) return false;

        // בודקים התאמה של הדגם: או ששם הדגם מתאים, או שקוד הדגם (החלק ה-4) מתאים למודל שחיפשנו
        return tagModel === normalizedModelTarget || tagCode === normalizedModelTarget;
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