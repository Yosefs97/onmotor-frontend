// /lib/shop/fetchShopifyModel.js
import { sfFetch } from '@/lib/shopify';

export async function fetchShopifyModel({ vendor, model, filters = {} }) {
  const cleanVendor = vendor.replace(/-/g, ' ');
  const vendorNoSpaces = vendor.replace(/[^a-zA-Z0-9]/g, '');

  // מושכים את כל המוצרים שיש להם תגית שמתאימה ליצרן, ואז מסננים לדגם ב-JS
  const searchQuery = `tag:"fit:${cleanVendor}*" OR tag:"fit:${vendorNoSpaces}*" OR tag:"fit: ${cleanVendor}*" OR tag:"fit: ${vendorNoSpaces}*"`;

  const query = `#graphql
    query GetModelProducts($query: String!) {
      products(first: 250, query: $query) {
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
    const { data, error } = await sfFetch(query, { query: searchQuery });
    let items = [];
    
    const responseData = data?.data || data;
    if (!error && responseData?.products?.edges) {
      items = responseData.products.edges.map(e => e.node);
    }

    if (items.length === 0) return [];

    const normalizedVendorTarget = vendor.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedModelTarget = model.toLowerCase().replace(/[^a-z0-9]/g, '');

    const strictlyMatchedItems = items.filter((p) => {
      if (!p.tags || !Array.isArray(p.tags)) return false;

      return p.tags.some((t) => {
        if (!t.toLowerCase().startsWith('fit:')) return false;
        
        const parts = t.split(':');
        if (parts.length < 3) return false;

        const tagVendor = parts[1].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const tagModel = parts[2].trim().toLowerCase().replace(/[^a-z0-9]/g, '');

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