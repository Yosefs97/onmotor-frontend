// /app/api/shopify/product/[handle]/route.js
export const runtime = "nodejs";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-04';

async function sfFetch(query, variables = {}) {
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

export async function GET(_req, { params }) {
  // 🔥 תיקון ל-Next.js 15
  const resolvedParams = await params;
  
  // 🔥 פענוח ה-handle (חובה עבור עברית!)
  const handle = decodeURIComponent(resolvedParams.handle);

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
        
        # 👇 הוספנו את האפשרויות (מידה, צבע וכו')
        options {
          id
          name
          values
        }

        images(first: 10) {
          edges { node { url altText } }
        }

        # 👇 הרחבנו את הוריאציות כדי לכלול את הבחירות והתמונות שלהן
        variants(first: 250) {
          edges {
            node {
              id
              title
              sku
              availableForSale
              quantityAvailable
              price { amount currencyCode }
              
              # תמונה ספציפית לוריאציה (למשל קסדה אדומה)
              image { url altText }
              
              # הבחירות שמגדירות את הוריאציה (Color: Red, Size: L)
              selectedOptions { name value }
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

  return Response.json({ item: data.data.product });
}