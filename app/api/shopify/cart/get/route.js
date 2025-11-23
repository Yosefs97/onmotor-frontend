// /app/api/shopify/cart/get/route.js
export const runtime = "nodejs";

import { sfFetch } from "../../checkout/route";

export async function GET(req) {
  const cartId = req.cookies.get("cartId")?.value;
  if (!cartId) return Response.json({ cart: null });

  const query = `#graphql
    query GetCart($id: ID!) {
      cart(id: $id) {
        id
        checkoutUrl
        totalQuantity
        estimatedCost { totalAmount { amount currencyCode } }
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    handle
                    title
                    featuredImage { url }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const { data } = await sfFetch(query, { id: cartId });
  return Response.json({ cart: data.data.cart });
}
