// /app/api/shopify/checkout/route.js
export const runtime = "nodejs";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-07';

async function sfFetch(query, variables={}) {
  if (!domain || !token) {
    return { error: 'Missing Shopify env vars', status: 500, data: null };
  }
  const res = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store'
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    return { error: json.errors || 'Shopify error', status: res.status, data: json };
  }
  return { error: null, status: 200, data: json };
}

// ✅ הורדתי את year מתגים — אין שימוש פה
function buildQueryString({ q, vendor, model, category, tag }) {
  const parts = [];
  if (q) parts.push(q);
  if (vendor) parts.push(`vendor:${JSON.stringify(vendor)}`);
  if (model) parts.push(`tag:${JSON.stringify('model:'+model)}`);
  if (category) parts.push(`product_type:${JSON.stringify(category)}`);
  if (tag) parts.push(`tag:${JSON.stringify(tag)}`);
  return parts.join(' ');
}

export { sfFetch, buildQueryString };

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const lines = Array.isArray(body.lines) ? body.lines : [];
  const mutation = `#graphql
    mutation CartCreate($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart {
          id checkoutUrl
          lines(first: 50) { edges { node { id quantity merchandise { ... on ProductVariant { id title } } } } }
        }
        userErrors { field message }
      }
    }
  `;
  const { error, status, data } = await sfFetch(mutation, { lines });
  if (error) return Response.json({ error }, { status });
  const errors = data.data?.cartCreate?.userErrors || [];
  if (errors.length) return Response.json({ error: errors }, { status: 400 });
  return Response.json({ cart: data.data.cartCreate.cart });
}
