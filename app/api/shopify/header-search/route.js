import { NextResponse } from 'next/server';

export const runtime = "nodejs";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-04';

async function sfFetch(query, variables = {}) {
  // בדיקה 1: האם יש משתני סביבה?
  if (!domain || !token) {
    console.error("❌ Missing Env Vars: domain or token is empty");
    return { error: 'Missing Shopify env vars', status: 500, data: null };
  }

  console.log(`📡 Sending request to: https://${domain}/api/${apiVersion}/graphql.json`);
  
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
    console.error("❌ Shopify API Error Response:", JSON.stringify(json.errors, null, 2));
    return { error: json.errors || 'Shopify error', status: res.status, data: json };
  }

  return { error: null, status: 200, data: json };
}

function sanitize(str) {
  if (!str) return '';
  return str.replace(/[^a-zA-Z0-9\s\-]/g, '');
}

function buildSimpleWildcardQuery(q) {
  if (!q) return '';
  const cleanTerm = sanitize(q.trim());
  if (!cleanTerm) return '';

  // בדיקה 2: איך נראית השאילתה שנוצרה?
  const finalQuery = `(title:${cleanTerm}* OR sku:${cleanTerm}* OR vendor:${cleanTerm}* OR tag:${cleanTerm}*)`;
  console.log("🛠️ Generated Search Query String:", finalQuery);
  return finalQuery;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const queryText = searchParams.get('q');

  console.log("\n--- 🚀 New Header Search Request ---");
  console.log("📥 Received Term:", queryText);

  if (!queryText || queryText.length < 1) {
    return NextResponse.json({ products: [] });
  }

  const queryStr = buildSimpleWildcardQuery(queryText);

  if (!queryStr) {
      console.log("⚠️ Query string is empty after build");
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
        return NextResponse.json({ products: [] });
    }
    
    // בדיקה 3: מה שופיפיי החזיר?
    const edges = data?.data?.products?.edges || [];
    console.log(`✅ Shopify returned ${edges.length} products`);
    if (edges.length === 0) {
        console.log("ℹ️ Zero results found. Verify Query syntax.");
    }

    const products = edges.map(edge => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        image: edge.node.featuredImage?.url,
        price: edge.node.priceRange?.minVariantPrice?.amount,
        type: edge.node.productType
    }));

    return NextResponse.json({ products });

  } catch (error) {
    console.error('💥 Server Error:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}