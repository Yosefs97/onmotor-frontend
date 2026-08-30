// /lib/shopify.js

// 👇 תיקון 1: משתמשים בשם המשתנה המדויק שהגדרנו ב-Vercel (בלי NEXT_PUBLIC)
const domain = process.env.SHOPIFY_STORE_DOMAIN; 

// 👇 תיקון 2: מוודאים ששם המשתנה של הטוקן תואם
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-07';

export async function sfFetch(query, variables = {}) {
  // בדיקה קריטית שתופיע בלוגים אם משהו חסר
  if (!domain || !token) {
    console.error("❌ CRITICAL: Missing Shopify Credentials in Vercel!");
    console.error("Domain:", domain);
    console.error("Token defined?", !!token);
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
      cache: 'no-store', // או 'force-cache' תלוי בצורך
    });

    const json = await res.json();
    
    if (!res.ok || json.errors) {
      console.error("Shopify GraphQL Error:", JSON.stringify(json.errors, null, 2));
      return { error: json.errors || 'Shopify error', status: res.status, data: json };
    }
    
    return { error: null, status: 200, data: json };
  } catch (e) {
    console.error("Network Error in sfFetch:", e);
    return { error: 'Network error', status: 500, data: null };
  }
}
