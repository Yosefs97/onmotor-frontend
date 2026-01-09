//app\api\shopify\search-suggestions\route.js
import { NextResponse } from 'next/server';

export const runtime = "nodejs";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-04';

// --- אותה פונקציית Fetch מהקובץ שעובד לך ---
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

// --- אותה פונקציית normalize מהקובץ שעובד לך ---
function normalize(str) {
  if (!str) return '';
  const norm = str.trim().toLowerCase().replace(/\s+/g, ' ');
  const noSpace = norm.replace(/\s+/g, '');
  return { norm, noSpace };
}

// --- אותה פונקציית buildQueryString מהקובץ שעובד לך ---
function buildQueryString({ q }) {
  const parts = [];
  if (q) {
    const { norm, noSpace } = normalize(q);
    // הוספתי כאן כוכבית (*) קטנה בסוף רק כדי לאפשר השלמה תוך כדי הקלדה, 
    // אבל שמרתי על המבנה המדויק שלך (OR title: OR tag:)
    parts.push(`${norm}* OR title:${JSON.stringify(noSpace)}* OR tag:${JSON.stringify(noSpace)}*`);
  }
  return parts.join(' ');
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const queryText = searchParams.get('q');

  if (!queryText || queryText.length < 1) {
    return NextResponse.json({ products: [] });
  }

  // שימוש בלוגיקה המדויקת שלך לבניית השאילתה
  const queryStr = buildQueryString({ q: queryText });

  const graphqlQuery = `
    query SearchSuggestions($query: String!) {
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
        console.error("API Error:", error);
        return NextResponse.json({ products: [] });
    }
    
    // מיפוי התוצאות למבנה פשוט שהחיפוש החי צריך
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
    console.error('Logic Error:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}