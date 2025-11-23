// /app/api/shopify/product/[handle]/route.js
export const runtime = "nodejs";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-04';

async function sfFetch(query, variables = {}) {
  if (!domain || !token) {
    return { error: 'Missing Shopify env vars', status: 500, data: null };
  }
  const res = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    return { error: json.errors || 'Shopify error', status: res.status, data: json };
  }
  return { error: null, status: 200, data: json };
}

export { sfFetch };

export async function GET(_req, { params }) {
  const handle = params.handle;
  const query = `#graphql
    query One($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        descriptionHtml
        vendor
        productType
        tags   # ✅ נוספו תגיות (model:, year:, וכו')
        images(first: 8) {
          edges { node { url altText } }
        }
        variants(first: 25) {
          edges {
            node {
              id
              title
              sku
              availableForSale
              quantityAvailable
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
          type
        }
      }
    }
  `;

  const { error, status, data } = await sfFetch(query, { handle });
  if (error) return Response.json({ error }, { status });

  return Response.json({ item: data.data.product });
}
