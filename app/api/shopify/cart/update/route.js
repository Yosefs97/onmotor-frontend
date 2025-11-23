// /app/api/shopify/cart/update/route.js
export const runtime = "nodejs";

import { sfFetch } from "../../checkout/route";

export async function POST(req) {
  const body = await req.json();
  const cartId = req.cookies.get("cartId")?.value;

  const mutation = `#graphql
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
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
        userErrors { field message }
      }
    }
  `;

  const { data } = await sfFetch(mutation, {
    cartId,
    lines: [{ id: body.lineId, quantity: body.quantity }],
  });

  return Response.json({ cart: data.data.cartLinesUpdate.cart });
}
