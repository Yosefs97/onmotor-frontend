// /app/api/shopify/cart/add/route.js
export const runtime = "nodejs";

import { sfFetch } from "../../checkout/route";

export async function POST(req) {
  const body = await req.json();
  let cartId = req.cookies.get("cartId")?.value;

  if (!cartId) {
    const createMutation = `#graphql
      mutation {
        cartCreate {
          cart { id checkoutUrl }
        }
      }
    `;
    const { data } = await sfFetch(createMutation);
    cartId = data.data.cartCreate.cart.id;
  }

  const mutation = `#graphql
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
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
    lines: [{ merchandiseId: body.variantId, quantity: body.quantity }],
  });

  const cart = data.data.cartLinesAdd.cart;

  const headers = new Headers();
  headers.append("Set-Cookie", `cartId=${cart.id}; Path=/; HttpOnly; SameSite=Lax`);

  return new Response(JSON.stringify({ cart }), { headers, status: 200 });
}
