// /app/api/shopify/collections/route.js
const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || "2024-04";

async function sfFetch(query, variables = {}) {
  if (!domain || !token) {
    return {
      error: "Missing Shopify env vars",
      status: 500,
      data: null,
    };
  }

  const res = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok || json.errors) {
    return { error: json.errors || "Shopify error", status: res.status, data: json };
  }

  return { error: null, status: 200, data: json };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const first = parseInt(searchParams.get("limit") || "50", 10); // ברירת מחדל – 50 אוספים

  const query = `#graphql
    query Collections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            handle
            title
            image {
              url
              altText
            }
          }
        }
      }
    }
  `;

  const { error, status, data } = await sfFetch(query, { first });

  if (error) {
    return Response.json({ error, items: [] }, { status });
  }

  const items =
    data?.data?.collections?.edges?.map((e) => ({
      id: e.node.id,
      handle: e.node.handle,
      title: e.node.title,
      image: e.node.image,
    })) || [];

  return Response.json({ items }, { status: 200 });
}
