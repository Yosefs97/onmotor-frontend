// /app/api/shopify/search-suggestions/route.js
import { NextResponse } from 'next/server';

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

// מנקה רווחים כפולים וממיר לאותיות קטנות
function normalize(str) {
  if (!str) return '';
  const norm = str.trim().toLowerCase().replace(/\s+/g, ' ');
  const noSpace = norm.replace(/\s+/g, '');
  return { norm, noSpace };
}

// מנטרל תווים מיוחדים (כמו מקף) כדי שנוכל לחפש מק"ט בלי מרכאות
function escapeShopifyQuery(str) {
  if (!str) return '';
  return str.replace(/([+\-=&|!(){}[\]^"~*?:\\/])/g, '\\$1');
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const queryText = searchParams.get('q');

  // ✅ מאפשר חיפוש החל מהאות הראשונה
  if (!queryText || queryText.length < 1) {
    return NextResponse.json({ products: [] });
  }

  const { norm, noSpace } = normalize(queryText);
  
  // גרסה מוגנת לחיפוש מק"ט (כדי שמקף לא ישבור את החיפוש)
  const escapedNorm = escapeShopifyQuery(norm);
  const escapedNoSpace = escapeShopifyQuery(noSpace);

  // 👇 השאילתה הפשוטה והמנצחת 👇
  // טקסט: עטוף במרכאות + כוכבית (חיפוש מדוייק שמתחיל ב...)
  // מק"ט: ללא מרכאות (עם escape) + כוכבית
  const formattedQuery = `(` +
      `title:${JSON.stringify(norm)}* OR ` +        // חיפוש כותרת
      `product_type:${JSON.stringify(norm)}* OR ` + // חיפוש סוג
      `sku:${escapedNorm}* OR ` +                   // מק"ט רגיל
      `sku:${escapedNoSpace}* OR ` +                // מק"ט מחובר
      `barcode:${escapedNorm}* OR ` +               // ברקוד
      `tag:${escapedNorm}*` +                       // תגיות
  `)`;

  const graphqlQuery = `
    query SearchSuggestions($query: String!) {
      products(first: 5, query: $query, sortKey: RELEVANCE) {
        edges {
          node {
            id
            title
            handle
            productType
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
            # אופציונלי: החזרת SKU כדי לוודא התאמה
            variants(first: 1) {
              edges {
                node {
                  sku
                  barcode
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const { error, data } = await sfFetch(graphqlQuery, { query: formattedQuery });

    if (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ products: [] });
    }
    
    const products = data?.data?.products?.edges.map(edge => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        image: edge.node.featuredImage?.url,
        price: edge.node.priceRange?.minVariantPrice?.amount,
        currency: edge.node.priceRange?.minVariantPrice?.currencyCode,
        type: edge.node.productType,
        sku: edge.node.variants?.edges[0]?.node?.sku
    })) || [];

    return NextResponse.json({ products });

  } catch (error) {
    console.error('Search Logic Error:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}