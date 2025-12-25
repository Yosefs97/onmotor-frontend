// /app/api/shopify/search-suggestions/route.js
import { NextResponse } from 'next/server';

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] });
  }

  // שאילתת GraphQL לחיפוש מוצרים לפי כותרת או תגית
  const graphqlQuery = `
    query SearchSuggestions($query: String!) {
      products(first: 5, query: $query) {
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
    // הוספת * כדי לאפשר חיפוש חלקי (למשל "קסד" ימצא "קסדה")
    const formattedQuery = `${query}*`;

    const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: { query: formattedQuery },
      }),
      next: { revalidate: 0 } // לא לשמור במטמון כדי לקבל תוצאות בזמן אמת
    });

    const json = await res.json();
    
    // נירמול הנתונים למערך פשוט יותר
    const products = json.data?.products?.edges.map(edge => ({
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
    console.error('Search Error:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}