// /app/api/shopify/search/route.js
const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-04';

async function sfFetch(query, variables = {}) {
  if (!domain || !token) {
    return {
      error: 'Missing Shopify env vars',
      status: 500,
      data: null,
    };
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

function normalize(str) {
  if (!str) return '';
  const norm = str.trim().toLowerCase().replace(/\s+/g, ' ');
  const noSpace = norm.replace(/\s+/g, '');
  return { norm, noSpace };
}

function buildQueryString({ q, vendor, model, year, tag, sku, category, type }) {
  const parts = [];

  if (q) {
    const { norm, noSpace } = normalize(q);
    parts.push(`${norm} OR title:${JSON.stringify(noSpace)} OR tag:${JSON.stringify(noSpace)}`);
  }

  if (sku) {
    const { norm, noSpace } = normalize(sku);
    parts.push(
      `sku:${JSON.stringify(norm)} OR barcode:${JSON.stringify(
        norm
      )} OR title:${JSON.stringify(norm)} OR sku:${JSON.stringify(noSpace)} OR barcode:${JSON.stringify(noSpace)} OR title:${JSON.stringify(noSpace)}`
    );
  }

  if (vendor) {
    const { norm, noSpace } = normalize(vendor);
    parts.push(`vendor:${JSON.stringify(norm)} OR tag:${JSON.stringify(noSpace)}`);
  }

  if (model) {
    const { norm, noSpace } = normalize(model);
    parts.push(
      `tag:${JSON.stringify('model:' + norm)} OR title:${JSON.stringify(norm)} OR tag:${JSON.stringify(norm)} OR tag:${JSON.stringify('model:' + noSpace)} OR title:${JSON.stringify(noSpace)} OR tag:${JSON.stringify(noSpace)}`
    );
  }

  if (year) {
    const { norm, noSpace } = normalize(year);
    parts.push(
      `tag:${JSON.stringify('year:' + norm)} OR title:${JSON.stringify(norm)} OR tag:${JSON.stringify(norm)} OR tag:${JSON.stringify('year:' + noSpace)} OR title:${JSON.stringify(noSpace)} OR tag:${JSON.stringify(noSpace)}`
    );
  }

  if (category) {
    const { norm, noSpace } = normalize(category);
    parts.push(
      `tag:${JSON.stringify('cat:' + norm)} OR product_type:${JSON.stringify(norm)} OR tag:${JSON.stringify(norm)} OR product_type:${JSON.stringify(noSpace)} OR tag:${JSON.stringify(noSpace)}`
    );
  }

  if (type) {
    const { norm, noSpace } = normalize(type);
    parts.push(`product_type:${JSON.stringify(norm)} OR product_type:${JSON.stringify(noSpace)}`);
  }

  if (tag) {
    const { norm, noSpace } = normalize(tag);
    parts.push(`tag:${JSON.stringify(norm)} OR tag:${JSON.stringify(noSpace)}`);
  }

  return parts.join(' ');
}

export { sfFetch, buildQueryString };

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const vendor = searchParams.get('vendor') || '';
  const model = searchParams.get('model') || '';
  const year = searchParams.get('year') || '';
  const yearFrom = parseInt(searchParams.get('yearFrom') || '0', 10);
  const yearTo = parseInt(searchParams.get('yearTo') || '9999', 10);
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const sku = searchParams.get('sku') || '';
  const type = searchParams.get('type') || '';
  const first = parseInt(searchParams.get('limit') || '24', 10);
  const after = searchParams.get('cursor');

  const queryStr = buildQueryString({
    q,
    vendor,
    model,
    year,
    tag,
    sku,
    category,
    type,
  });

  const query = `#graphql
    query Products($first: Int!, $after: String, $query: String) {
      products(first: $first, after: $after, query: $query, sortKey: RELEVANCE) {
        pageInfo { hasNextPage endCursor }
        edges {
          cursor
          node {
            id
            title
            handle
            productType
            vendor
            tags
            images(first: 1) { edges { node { url altText } } }
            metafields(identifiers: [
              { namespace: "compatibility", key: "year_from" }
              { namespace: "compatibility", key: "year_to" }
            ]) {
              key
              value
            }
            variants(first: 5) {
              edges {
                node {
                  id
                  title
                  sku
                  barcode
                  availableForSale
                  price { amount currencyCode }
                  quantityAvailable
                }
              }
            }
          }
        }
      }
    }
  `;

  const { error, status, data } = await sfFetch(query, {
    first,
    after,
    query: queryStr || undefined,
  });

  if (error) return Response.json({ error, items: [], pageInfo: {} }, { status });

  // ✅ סינון לפי year_from / year_to מה־metafields
  const items = (data?.data?.products?.edges || [])
    .map((e) => ({ cursor: e.cursor, ...e.node }))
    .filter((prod) => {
      const mf = {};
      (prod.metafields || []).forEach((m) => {
        mf[m.key] = parseInt(m.value, 10);
      });
      const from = mf.year_from || 0;
      const to = mf.year_to || 9999;
      return from <= yearTo && to >= yearFrom;
    });

  return Response.json({
    items,
    pageInfo: data?.data?.products?.pageInfo || {},
  });
}
