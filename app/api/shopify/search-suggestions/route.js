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

// --- פונקציות עזר (זהות למנוע החלפים) ---

function normalize(str) {
  if (!str) return '';
  const norm = str.trim().toLowerCase().replace(/\s+/g, ' ');
  const noSpace = norm.replace(/\s+/g, '');
  return { norm, noSpace };
}

function escapeShopifyQuery(str) {
  if (!str) return '';
  // בורח מתווים מיוחדים כדי שמקף לא ייחשב כ-NOT
  return str.replace(/([+\-=&|!(){}[\]^"~*?:\\/])/g, '\\$1');
}

// --- המנוע הראשי ---

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const queryText = searchParams.get('q');

  // מאפשר חיפוש החל מהאות הראשונה
  if (!queryText || queryText.length < 1) {
    return NextResponse.json({ products: [] });
  }

  // 👇 בניית השאילתה בדיוק כמו במנוע החלפים 👇
  const { norm, noSpace } = normalize(queryText);
  const escapedNorm = escapeShopifyQuery(norm);
  const escapedNoSpace = escapeShopifyQuery(noSpace);

  const formattedQuery = `(` +
      `title:${JSON.stringify(norm)}* OR ` +       // טקסט רגיל (עברית/אנגלית)
      `sku:${escapedNorm}* OR ` +                  // מק"ט עם מקפים (מוגן)
      `sku:${escapedNoSpace}* OR ` +               // מק"ט מחובר
      `tag:${escapedNorm}* OR ` +                  // תגיות
      `product_type:${JSON.stringify(norm)}* OR ` + 
      `title:${JSON.stringify(noSpace)}*` +        // כותרת ללא רווחים
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
        type: edge.node.productType
    })) || [];

    return NextResponse.json({ products });

  } catch (error) {
    console.error('Search Logic Error:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}