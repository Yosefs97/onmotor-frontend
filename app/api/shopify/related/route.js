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
  
  const tagsParam = searchParams.get('tags') || '';
  const excludeHandle = searchParams.get('excludeHandle') || '';
  const vendor = searchParams.get('vendor') || '';
  const productType = searchParams.get('productType') || '';
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
    
    // מביאים קצת יותר כדי לפצות על סינון עצמי מאוחר יותר
    return await sfFetch(query, { first: first + 5, query: queryStr });
  };

  let items = [];

  // 🔥 1. עדיפות עליונה: חיפוש חלקים שמתאימים בדיוק לאותו דגם אופנוע (לפי תגיות fit)
  if (tagsParam) {
    const tagsArr = tagsParam.split(',').map(t => t.trim()).filter(Boolean);
    if (tagsArr.length > 0) {
      // חובה להשתמש במרכאות כפולות סביב הערך כדי ששופיפיי יתייחס לרווחים כחלק מהתגית
      const tagQueries = tagsArr.slice(0, 15).map(tag => `tag:"${tag}"`);
      
      // הפיכת השאילתה ל-AND: דורש שכל התגיות יופיעו במוצרים הנוספים
      const queryStr = `(${tagQueries.join(' AND ')})`;
      
      const { data, error } = await fetchProducts(queryStr);
      
      if (!error && data?.data?.products?.edges) {
        items = data.data.products.edges.map((e) => e.node);
      }
    }
  }

  // מסננים החוצה את המוצר הנוכחי (כדי שלא נציג אותו בקרוסלה של עצמו)
  if (excludeHandle) {
    items = items.filter((p) => p.handle.toLowerCase() !== excludeHandle.toLowerCase());
  }

  // 🔥 2. מנגנון גיבוי (Fallback) חכם יותר 🔥
  if (items.length === 0 && !tagsParam) {
    const fallbackParts = [];
    
    // שימוש במרכאות כפולות גם כאן ליתר ביטחון
    if (productType) fallbackParts.push(`product_type:"${productType}"`);
    if (vendor) fallbackParts.push(`vendor:"${vendor}"`);
    
    if (fallbackParts.length > 0) {
      const fallbackQueryStr = fallbackParts.join(' AND ');
      const { data, error } = await fetchProducts(fallbackQueryStr);
      
      if (!error && data?.data?.products?.edges) {
        let fallbackItems = data.data.products.edges.map((e) => e.node);
        if (excludeHandle) {
          fallbackItems = fallbackItems.filter((p) => p.handle.toLowerCase() !== excludeHandle.toLowerCase());
        }
        items = fallbackItems;
      }
    }
  }

  // חותכים חזרה בדיוק לכמות שביקשנו להציג (לדוגמה: 10)
  items = items.slice(0, first);

  return Response.json({ items });
}