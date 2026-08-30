import { sfFetch } from '@/lib/shopify';

export async function fetchHomepageProducts(limit = 8) {
  const query = `#graphql
    query HomepageProducts {
      products(first: 24, sortKey: BEST_SELLING) {
        edges {
          node {
            id
            title
            handle
            vendor
            availableForSale
            featuredImage { url altText }
            priceRange {
              minVariantPrice { amount currencyCode }
            }
          }
        }
      }
    }
  `;

  const { data, error } = await sfFetch(query);
  if (error || !data?.data?.products?.edges) return [];

  const products = data.data.products.edges
    .map(({ node }) => node)
    .filter((product) => product.availableForSale && product.featuredImage?.url);

  for (let index = products.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [products[index], products[randomIndex]] = [products[randomIndex], products[index]];
  }

  return products.slice(0, limit);
}
