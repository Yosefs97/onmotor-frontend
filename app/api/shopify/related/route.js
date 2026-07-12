// /app/api/shopify/related/route.js
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
    next: { revalidate: 60 },
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    return { error: json.errors || 'Shopify error', status: res.status, data: json };
  }
  return { error: null, status: 200, data: json };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  
  const tagsParam = searchParams.get('tags') || '';
  const excludeHandle = searchParams.get('excludeHandle') || '';
  const first = parseInt(searchParams.get('limit') || '10', 10);

  const fetchProducts = async (queryStr) => {
    const query = `#graphql
      query Related($first: Int!, $query: String) {
        products(first: $first, query: $query) {
          edges {
            node {
              id handle title vendor productType
              images(first: 1) { edges { node { url altText } } }
              variants(first: 1) {
                edges {
                  node {
                    id title availableForSale quantityAvailable
                    price { amount currencyCode }
                  }
                }
              }
            }
          }
        }
      }
    `;
    
    // מביאים קצת יותר כדי לפצות על סינון המוצר הנוכחי
    return await sfFetch(query, { first: first + 5, query: queryStr });
  };

  let items = [];

  // 1. משיכת מוצרים אך ורק לפי תגיות תואמות (שימוש ב-OR)
  if (tagsParam) {
    const tagsArr = tagsParam.split(',').map(t => t.trim()).filter(Boolean);
    if (tagsArr.length > 0) {
      // עטיפת כל תגית במרכאות כפולות כדי ששופיפיי יתמודד נכון עם רווחים ונקודתיים
      const tagQueries = tagsArr.slice(0, 15).map(tag => `tag:"${tag}"`);
      
      // מחברים ב-OR - מספיקה תגית אחת זהה כדי שהמוצר ייחשב כקשור
      const queryStr = `(${tagQueries.join(' OR ')})`;
      
      const { data, error } = await fetchProducts(queryStr);
      
      if (!error && data?.data?.products?.edges) {
        items = data.data.products.edges.map((e) => e.node);
      }
    }
  }

  // 2. סינון המוצר הנוכחי מהרשימה כדי שלא יציג את עצמו
  if (excludeHandle) {
    items = items.filter((p) => p.handle.toLowerCase() !== excludeHandle.toLowerCase());
  }

  // כל מנגנוני הגיבוי (Fallback) לפי Vendor או ProductType הוסרו לחלוטין לבקשתך.
  // אם אין תגיות תואמות, המערך יישאר ריק ולא יוצגו מוצרים סתם.

  // חיתוך למספר הפריטים המבוקש
  items = items.slice(0, first);

  return Response.json({ items });
}