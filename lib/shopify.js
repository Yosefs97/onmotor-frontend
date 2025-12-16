// קובץ חדש: /lib/shopify.js
const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-07';

export async function sfFetch(query, variables = {}) {
  if (!domain || !token) {
    console.error("Missing Shopify Credentials");
    return { error: 'Missing Shopify env vars', status: 500, data: null };
  }
  
  try {
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
      console.error("Shopify GraphQL Error:", json.errors);
      return { error: json.errors || 'Shopify error', status: res.status, data: json };
    }
    
    return { error: null, status: 200, data: json };
  } catch (e) {
    console.error("Network Error in sfFetch:", e);
    return { error: 'Network error', status: 500, data: null };
  }
}