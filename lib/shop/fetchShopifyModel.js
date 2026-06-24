// /lib/shop/fetchShopifyModel.js
import { sfFetch } from '@/lib/shopify';

function getVendorVariations(vendor) {
  const clean = vendor.replace(/-/g, ' ').trim();
  const noSpaces = vendor.replace(/[^a-zA-Z0-9]/g, '').trim();
  const variations = new Set([clean, noSpaces, vendor, clean.toLowerCase(), clean.toUpperCase()]);
  if (clean.toLowerCase().replace(/\s+/g, '') === 'gasgas') {
    variations.add('GAS GAS');
    variations.add('GasGas');
  }
  return Array.from(variations);
}

export async function fetchShopifyModel({ vendor, model, filters = {} }) {
  const variations = getVendorVariations(vendor);
  const cleanModel = model.replace(/-/g, ' ');
  const modelNoSpaces = model.replace(/[^a-zA-Z0-9]/g, '');

  // בניית שאילתת חיפוש רחבה ויציבה עבור שופיפיי
  const vendorQuery = variations.map(v => `vendor:'${v}'`).join(' OR ');
  const searchQuery = `(${vendorQuery}) AND (${cleanModel} OR ${modelNoSpaces})`;

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

    // לולאת פגינציה מלאה למניעת חיתוך מוצרים ב-250
    while (hasNextPage) {
      const { data, error } = await sfFetch(query, { query: searchQuery, cursor });
      if (error) break;

      const responseData = data?.data || data;
      const productsInfo = responseData?.products;

      if (!productsInfo?.edges) break;

      allItems.push(...productsInfo.edges.map(e => e.node));
      hasNextPage = productsInfo.pageInfo.hasNextPage;
      cursor = productsInfo.pageInfo.endCursor;
    }

    if (allItems.length === 0) return [];

    const normalizedVendorTarget = vendor.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedModelTarget = model.toLowerCase().replace(/[^a-z0-9]/g, '');

    // סינון קפדני וחכם בצד השרת של Next.js
    const strictlyMatchedItems = allItems.filter((p) => {
      if (!p.tags || !Array.isArray(p.tags)) return false;

      return p.tags.some((t) => {
        if (!t.toLowerCase().startsWith('fit:')) return false;
        
        const parts = t.split(':');
        if (parts.length < 3) return false;

        const tagVendor = parts[1].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const tagModel = parts[2].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const tagCode = parts[3] ? parts[3].trim().toLowerCase().replace(/[^a-z0-9]/g, '') : null;

        // וידוא התאמת יצרן
        const vendorMatches = tagVendor === normalizedVendorTarget || tagVendor === 'gasgas' || tagVendor === 'gas gas';
        if (!vendorMatches) return false;

        // וידוא התאמת דגם מוחלטת (לפי שם הדגם המנורמל או לפי קוד הדגם הספציפי)
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