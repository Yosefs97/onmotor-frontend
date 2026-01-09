//app/api/shopify/header-search/route.js
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

// פונקציה לניקוי תווים מסוכנים ידנית (בלי להוסיף מרכאות!)
function sanitize(str) {
  if (!str) return '';
  // משאיר רק אותיות, מספרים, רווחים ומקפים
  return str.replace(/[^a-zA-Z0-9\s\-]/g, '');
}

function buildSimpleWildcardQuery(q) {
  if (!q) return '';
  
  // 1. מנקים את המילה מתווים מיוחדים
  const cleanTerm = sanitize(q.trim());
  if (!cleanTerm) return '';

  // 2. בונים שאילתה נקייה. שים לב - אין כאן JSON.stringify
  // אנחנו מחפשים ב-Title, SKU, Vendor ו-Tag
  // הכוכבית * אומרת "כל מה שמתחיל בזה"
  return `(title:${cleanTerm}* OR sku:${cleanTerm}* OR vendor:${cleanTerm}* OR tag:${cleanTerm}*)`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const queryText = searchParams.get('q');

  if (!queryText || queryText.length < 1) {
    return NextResponse.json({ products: [] });
  }

  const queryStr = buildSimpleWildcardQuery(queryText);

  // אם אחרי הניקוי לא נשאר כלום, מחזירים ריק
  if (!queryStr) {
      return NextResponse.json({ products: [] });
  }

  const graphqlQuery = `
    query HeaderSearch($query: String!) {
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
          }
        }
      }
    }
  `;

  try {
    const { error, data } = await sfFetch(graphqlQuery, { query: queryStr });

    if (error) {
        console.error("Header Search API Error:", error);
        return NextResponse.json({ products: [] });
    }
    
    const products = data?.data?.products?.edges.map(edge => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        image: edge.node.featuredImage?.url,
        price: edge.node.priceRange?.minVariantPrice?.amount,
        type: edge.node.productType
    })) || [];

    return NextResponse.json({ products });

  } catch (error) {
    console.error('Header Search Logic Error:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}