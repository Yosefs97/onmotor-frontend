// קובץ קיים: /app/api/shopify/product/[handle]/route.js
import { sfFetch } from '@/lib/shopify'; // 👈 זה השינוי הקריטי! אנחנו מייבאים מבחוץ

export const runtime = "nodejs";

export async function GET(_req, { params }) {
  // 🔥 תיקון ל-Next.js 15
  const resolvedParams = await params;
  
  // 🔥 פענוח ה-handle
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
        options {
          id
          name
          values
        }
        images(first: 10) {
          edges { node { url altText } }
        }
        variants(first: 250) {
          edges {
            node {
              id
              title
              sku
              availableForSale
              quantityAvailable
              price { amount currencyCode }
              image { url altText }
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