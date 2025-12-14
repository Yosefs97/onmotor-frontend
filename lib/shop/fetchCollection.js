// /lib/shop/fetchCollection.js
import { sfFetch } from '@/app/api/shopify/product/[handle]/route';

export async function fetchCollection({ handle, filters = {} }) {
  // המרת מסנני מיון למבנה של שופיפיי
  const sortKey = filters.sort === 'price_asc' || filters.sort === 'price_desc' ? 'PRICE' : 'BEST_SELLING';
  const reverse = filters.sort === 'price_desc';

  const query = `#graphql
    query GetCollection($handle: String!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
      collection(handle: $handle) {
        id
        title
        description
        # טוענים 100 מוצרים כדי לקבל את כל המותגים הרלוונטיים
        products(first: 100, sortKey: $sortKey, reverse: $reverse) {
          edges {
            node {
              id
              title
              handle
              availableForSale
              vendor # 🔥 קריטי לסינון לפי חברה
              
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              
              # שמירה על מבנה הוריאנטים עבור הלוגיקה הקיימת שלך
              variants(first: 1) {
                edges {
                  node {
                    id
                    price {
                      amount
                      currencyCode
                    }
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
              }
            }
          }
        }
      }
    }
  `;

  const { data, error } = await sfFetch(query, { handle, sortKey, reverse });

  if (error || !data?.data?.collection) {
    console.error(`Error fetching collection ${handle}:`, error);
    return null;
  }

  const collection = data.data.collection;

  // המרת הנתונים למבנה ש-ProductGrid שלך מכיר
  const products = collection.products.edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    handle: node.handle,
    availableForSale: node.availableForSale,
    vendor: node.vendor, // שומרים את היצרן לשימוש בדף
    metafields: node.metafields,
    images: node.images, // משאירים את המבנה המקונן עבור ProductGrid
    variants: {
      edges: [
        {
          node: {
            price: node.priceRange.minVariantPrice
          }
        }
      ]
    }
  }));

  return {
    title: collection.title,
    description: collection.description,
    products: products,
  };
}