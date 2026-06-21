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
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    return { error: json.errors || 'Shopify error', status: res.status, data: json };
  }
  return { error: null, status: 200, data: json };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  
  // מקבלים את רשימת התגיות ואת ההחרגה של המוצר הנוכחי
  const tagsParam = searchParams.get('tags') || '';
  const excludeHandle = searchParams.get('excludeHandle') || '';
  const first = parseInt(searchParams.get('limit') || '10', 10);

  const parts = [];

  // בניית שאילתה דינמית מבוססת תגיות (חיבור ב-OR כדי להביא מוצרים עם תגיות חופפות)
  if (tagsParam) {
    const tagsArr = tagsParam.split(',').map(t => t.trim()).filter(Boolean);
    
    if (tagsArr.length > 0) {
      // נשתמש בעד 15 תגיות כדי לא לייצר שאילתה ארוכה וכבדה מדי לשופיפיי
      const safeTags = tagsArr.slice(0, 15);
      
      // בונים לולאת OR: (tag:"A" OR tag:"B" OR tag:"C")
      const tagQueries = safeTags.map(tag => `tag:${JSON.stringify(tag)}`);
      parts.push(`(${tagQueries.join(' OR ')})`);
    }
  }

  // אם אין למוצר תגיות בכלל, אי אפשר למצוא מוצרים דומים. נחזיר רשימה ריקה.
  if (parts.length === 0) {
     return Response.json({ items: [] });
  }

  const queryStr = parts.join(' ');

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

  // שולפים קצת יותר מוצרים מהנדרש (first + 2) כי אנחנו מסננים את המוצר הנוכחי בסוף 
  // ורוצים לוודא שיישארו לנו מספיק מוצרים להציג בקרוסלה
  const { error, status, data } = await sfFetch(query, { first: first + 2, query: queryStr });
  
  if (error) return Response.json({ error }, { status });

  let items = data.data.products.edges.map((e) => e.node);

  // מסננים החוצה את המוצר שעליו אנחנו נמצאים כרגע
  if (excludeHandle) {
    items = items.filter((p) => p.handle.toLowerCase() !== excludeHandle.toLowerCase());
  }

  // חותכים חזרה בדיוק לכמות שביקשנו (first)
  items = items.slice(0, first);

  return Response.json({ items });
}