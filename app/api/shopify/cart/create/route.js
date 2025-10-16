// /app/api/shopify/cart/create/route.js
import { sfFetch } from "../../checkout/route";

export async function POST() {
  const mutation = `#graphql
    mutation {
      cartCreate {
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

  const { error, data } = await sfFetch(mutation);
  if (error) return Response.json({ error }, { status: 500 });

  const cart = data.data.cartCreate.cart;

  const headers = new Headers();
  headers.append("Set-Cookie", `cartId=${cart.id}; Path=/; HttpOnly; SameSite=Lax`);

  return new Response(JSON.stringify({ cart }), { headers, status: 200 });
}
