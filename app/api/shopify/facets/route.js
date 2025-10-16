// /app/api/shopify/facets/route.js
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

export async function GET() {
  const query = `#graphql
    query Facets {
      products(first: 200) {
        edges {
          node {
            vendor
            tags
            metafields(identifiers: [
              { namespace: "compatibility", key: "year_from" }
              { namespace: "compatibility", key: "year_to" }
            ]) {
              key
              value
            }
          }
        }
      }
    }
  `;

  const { error, status, data } = await sfFetch(query);
  if (error) return Response.json({ error }, { status });

  const vendors = new Set();
  const tags = new Set();
  const models = {};             // vendor -> [models]
  const yearsByModel = {};       // model -> [years]
  const categoriesByModel = {};  // model -> [categories]

  data.data.products.edges.forEach(({ node }) => {
    if (node.vendor) vendors.add(node.vendor);

    const productModels = [];
    const productCats = [];

    // extract years from metafields
    const mf = {};
    (node.metafields || []).forEach(m => {
      mf[m.key] = m.value;
    });
    const from = mf.year_from ? parseInt(mf.year_from, 10) : null;
    const to   = mf.year_to ? parseInt(mf.year_to, 10) : null;
    const range = [];
    if (from && to) {
      for (let y = from; y <= to; y++) range.push(String(y));
    } else if (from) {
      range.push(String(from));
    } else if (to) {
      range.push(String(to));
    }

    (node.tags || []).forEach((t) => {
      tags.add(t);

      // מודלים
      if (t.startsWith('model:')) {
        const modelName = t.replace('model:', '').trim().toLowerCase();
        productModels.push(modelName);

        if (node.vendor) {
          if (!models[node.vendor]) models[node.vendor] = [];
          if (!models[node.vendor].includes(modelName)) {
            models[node.vendor].push(modelName);
          }
        }
      }

      // קטגוריות
      if (t.startsWith('cat:')) {
        const catVal = t.replace('cat:', '').trim();
        productCats.push(catVal);
      }
    });

    // קישור לכל מודל במוצר
    productModels.forEach((m) => {
      if (range.length) {
        if (!yearsByModel[m]) yearsByModel[m] = [];
        range.forEach((y) => {
          if (!yearsByModel[m].includes(y)) yearsByModel[m].push(y);
        });
      }
      if (productCats.length) {
        if (!categoriesByModel[m]) categoriesByModel[m] = [];
        productCats.forEach((c) => {
          if (!categoriesByModel[m].includes(c)) categoriesByModel[m].push(c);
        });
      }
    });
  });

  return Response.json({
    vendors: Array.from(vendors).sort(),
    models,
    tags: Array.from(tags).sort(),
    yearsByModel,
    categoriesByModel,
  });
}
