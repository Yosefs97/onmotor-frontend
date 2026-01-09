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

// פונקציה לניקוי תווים מיוחדים
function escapeShopifyQuery(str) {
  if (!str) return '';
  return str.replace(/([+\-=&|!(){}[\]^"~*?:\\/])/g, '\\$1');
}

function buildSmartQuery(q) {
    if (!q) return '';
    
    const cleanQuery = q.trim(); // הוסר toLowerCase כדי לא לשבור מק"טים תלויי-רישיות אם יש
    const escapedQuery = escapeShopifyQuery(cleanQuery);

    // בונים שאילתה פשוטה ויעילה:
    // (Title או SKU או Tag או Type) ומתחילים ב-escapedQuery
    // הכוכבית * בסוף כל שדה מאפשרת השלמה אוטומטית (Autocomplete)
    
    // שימו לב: כאן אין JSON.stringify על המשתנה עצמו בתוך השאילתה, 
    // כי אנחנו רוצים שהכוכבית תהיה צמודה לטקסט ולא מחוץ למרכאות.
    // ה-escapeShopifyQuery כבר דואג שלא יהיו תווים מסוכנים.
    
    return `(` +
        `title:${escapedQuery}* OR ` +
        `sku:${escapedQuery}* OR ` +
        `tag:${escapedQuery}* OR ` +
        `product_type:${escapedQuery}*` +
        `)`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const queryText = searchParams.get('q');

  // מאפשר חיפוש החל מהאות הראשונה
  if (!queryText || queryText.length < 1) {
    return NextResponse.json({ products: [] });
  }

  const formattedQuery = buildSmartQuery(queryText);

  // בדיקה בסיסית - אם השאילתה יצאה ריקה (למשל רק רווחים)
  if (!formattedQuery) {
      return NextResponse.json({ products: [] });
  }

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