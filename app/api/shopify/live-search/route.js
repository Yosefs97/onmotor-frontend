//app/api/shopify/live-search/route.js
import { NextResponse } from 'next/server';

export const runtime = "nodejs";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-04';

// 1. פונקציית Fetch (מועתקת מהקוד התקין שלך)
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

// 2. פונקציית normalize (מועתקת מהקוד התקין שלך)
function normalize(str) {
  if (!str) return '';
  const norm = str.trim().toLowerCase().replace(/\s+/g, ' ');
  const noSpace = norm.replace(/\s+/g, '');
  return { norm, noSpace };
}

// 3. בניית שאילתה מותאמת ל-Live Search (הוספתי * בסוף כדי שיעבוד חלקי)
function buildLiveQuery(q) {
  if (!q) return '';
  const { norm, noSpace } = normalize(q);

  // הוספתי * (כוכבית) בסוף כל שדה כדי לאפשר Autocomplete
  return `(` +
    `title:${JSON.stringify(norm)}* OR ` +
    `sku:${JSON.stringify(norm)}* OR ` +
    `sku:${JSON.stringify(noSpace)}* OR ` +
    `tag:${JSON.stringify(norm)}* OR ` +
    `product_type:${JSON.stringify(norm)}* OR ` +
    `title:${JSON.stringify(noSpace)}*` +
  `)`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const queryText = searchParams.get('q');

  // מחזיר מערך ריק אם אין שאילתה
  if (!queryText || queryText.length < 1) {
    return NextResponse.json({ products: [] });
  }

  // בונה את השאילתה עם הכוכביות
  const queryStr = buildLiveQuery(queryText);

  const graphqlQuery = `
    query LiveSearch($query: String!) {
      products(first: 6, query: $query, sortKey: RELEVANCE) {
        edges {
          node {
            id
            title
            handle
            productType
            vendor
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              edges {
                node {
                  sku
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const { error, data } = await sfFetch(graphqlQuery, { query: queryStr });

    if (error) {
        console.error("Live Search API Error:", error);
        return NextResponse.json({ products: [] });
    }
    
    // מיפוי הנתונים למבנה שהקומפוננטה מצפה לו
    const products = data?.data?.products?.edges.map(edge => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        image: edge.node.featuredImage?.url,
        price: edge.node.priceRange?.minVariantPrice?.amount,
        type: edge.node.productType,
        sku: edge.node.variants?.edges[0]?.node?.sku
    })) || [];

    return NextResponse.json({ products });

  } catch (error) {
    console.error('Live Search Logic Error:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}