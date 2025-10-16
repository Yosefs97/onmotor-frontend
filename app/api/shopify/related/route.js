// /app/api/shopify/related/route.js
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

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const vendor = searchParams.get('vendor') || '';
  const productType = searchParams.get('productType') || '';
  const model = searchParams.get('model') || '';
  const excludeHandle = searchParams.get('excludeHandle') || '';
  const first = parseInt(searchParams.get('limit') || '8', 10);

  const queryStr = [
    vendor && `vendor:${JSON.stringify(vendor)}`,
    productType && `product_type:${JSON.stringify(productType)}`,
    model && `tag:${JSON.stringify('model:' + model)}`,
  ]
    .filter(Boolean)
    .join(' ');

  const query = `#graphql
    query Related($first: Int!, $query: String) {
      products(first: $first, query: $query) {
        edges {
          node {
            id handle title vendor productType
            images(first: 1) { edges { node { url altText } } }
            variants(first: 1) {
              edges {
                node {
                  id title availableForSale quantityAvailable
                  price { amount currencyCode }
                }
              }
            }
          }
        }
      }
    }
  `;

  const { error, status, data } = await sfFetch(query, { first, query: queryStr || undefined });
  if (error) return Response.json({ error }, { status });

  let items = data.data.products.edges.map((e) => e.node);

  // ✅ מסנן את המוצר הנוכחי לפי handle
  if (excludeHandle) {
    items = items.filter((p) => p.handle.toLowerCase() !== excludeHandle.toLowerCase());
  }

  return Response.json({ items });
}
