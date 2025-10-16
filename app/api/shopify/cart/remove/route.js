// /app/api/shopify/cart/remove/route.js
import { sfFetch } from "../../checkout/route";

export async function POST(req) {
  const body = await req.json();
  const cartId = req.cookies.get("cartId")?.value;

  const mutation = `#graphql
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
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
    lineIds: [body.lineId],
  });

  return Response.json({ cart: data.data.cartLinesRemove.cart });
}
