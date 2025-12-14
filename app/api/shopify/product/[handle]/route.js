//app\api\shopify\product\[handle]\route.js
export const runtime = "nodejs";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-04';

async function sfFetch(query, variables = {}) {
  if (!domain || !token) {
    console.error("Missing Shopify Credentials"); // הוספתי לוג לשגיאות שרת
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
      console.error("Shopify GraphQL Error:", json.errors); // לוג קריטי לדיבוג
      return { error: json.errors || 'Shopify error', status: res.status, data: json };
    }
    
    return { error: null, status: 200, data: json };
  } catch (e) {
    console.error("Network Error in sfFetch:", e);
    return { error: 'Network error', status: 500, data: null };
  }
}

export { sfFetch };

export async function GET(_req, { params }) {
  // 🔥 תיקון 1: ב-Next.js 15 חובה לעשות await ל-params
  const resolvedParams = await params;
  
  // 🔥 תיקון 2: פענוח ה-handle (חובה עבור עברית!)
  // אם ה-URL הוא .../product/%D7%A7%D7%A1%D7%93%D7%94 -> זה יהפוך אותו ל-"קסדה"
  const handle = decodeURIComponent(resolvedParams.handle);

  // לוג זמני כדי שתראה בשרת מה בדיוק נשלח לשופיפיי (תמחק את זה אחרי שהכל עובד)
  console.log(`Fetching Shopify Product handle: "${handle}"`);

  const query = `#graphql
    query One($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        descriptionHtml
        vendor
        productType
        tags
        images(first: 8) {
          edges { node { url altText } }
        }
        variants(first: 25) {
          edges {
            node {
              id
              title
              sku
              availableForSale
              quantityAvailable
              price { amount currencyCode }
            }
          }
        }
        metafields(identifiers: [
          { namespace: "compatibility", key: "year_from" },
          { namespace: "compatibility", key: "year_to" }
        ]) {
          namespace
          key
          value
          type
        }
      }
    }
  `;

  const { error, status, data } = await sfFetch(query, { handle });

  if (error) {
    return Response.json({ error }, { status });
  }

  // אם שופיפיי החזיר תשובה תקינה אבל לא מצא את המוצר (product: null)
  if (!data.data.product) {
    console.warn(`Shopify returned NULL for handle: "${handle}"`);
  }

  return Response.json({ item: data.data.product });
}