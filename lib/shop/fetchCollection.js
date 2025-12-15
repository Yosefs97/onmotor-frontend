// /lib/shop/fetchCollection.js
import { sfFetch } from '@/app/api/shopify/product/[handle]/route';

export async function fetchCollection({ handle, filters = {} }) {
  // 1. מיון
  const sortKey = filters.sort === 'price_asc' || filters.sort === 'price_desc' ? 'PRICE' : 'BEST_SELLING';
  const reverse = filters.sort === 'price_desc';

  // 2. המרת הפילטרים למבנה ששופיפיי מבינה (עבור השאילתה הראשונית)
  const shopifyFilters = [];

  // דגם: המרה לתגית model:EXC
  if (filters.model) {
    shopifyFilters.push({ tag: `model:${filters.model}` });
  }

  // שים לב: אנחנו לא מסננים לפי שנה בשלב הזה מול שופיפיי (אלא אם כן זו שנה בודדת בתגית),
  // כי את בדיקת הטווחים האמיתית נעשה ידנית למטה.
  if (filters.year && !filters.yearFrom) {
     shopifyFilters.push({ tag: `year:${filters.year}` });
  }
  
  // יצרן
  if (filters.vendor) {
    shopifyFilters.push({ productVendor: filters.vendor });
  }

  // תגיות רגילות
  if (filters.tag) {
    shopifyFilters.push({ tag: filters.tag });
  }

  // פילטרים חכמים
  Object.keys(filters).forEach(key => {
    if (key.startsWith('filter.')) {
      try {
         const val = JSON.parse(filters[key]); 
         shopifyFilters.push({ [key.replace('filter.', '')]: val });
      } catch {
         shopifyFilters.push({ [key]: filters[key] });
      }
    }
  });

  const query = `#graphql
    query GetCollection($handle: String!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $filters: [ProductFilter!]) {
      collection(handle: $handle) {
        id
        title
        description
        
        # 🔥 הגדלנו ל-250 מוצרים כדי שיהיה מספיק מידע לסינון הידני של השנים
        products(first: 250, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
          edges {
            node {
              id
              title
              handle
              availableForSale
              vendor 
              tags
              
              images(first: 1) {
                edges { node { url altText } }
              }
              
              priceRange {
                minVariantPrice { amount currencyCode }
              }
              
              variants(first: 1) {
                edges { 
                  node { 
                    id 
                    price { amount currencyCode } 
                  } 
                }
              }
              
              # 👇 חובה לשלוף את המטא-פילדס
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

        filters: products(first: 0) {
          filters {
            id
            label
            type
            values { id label count input }
          }
        }
      }
    }
  `;

  const { data, error } = await sfFetch(query, { 
    handle, 
    sortKey, 
    reverse,
    filters: shopifyFilters 
  });

  if (error || !data?.data?.collection) {
    console.error(`Error fetching collection ${handle}. Check if collection exists in Shopify.`, error);
    return null;
  }

  const collection = data.data.collection;
  let rawProducts = collection.products.edges.map(e => e.node);

  // ---------------------------------------------------------
  // 🔥 שלב הסינון הידני (החלק שהיה חסר בקוד שלך)
  // ---------------------------------------------------------
  
  if (filters.yearFrom || filters.yearTo) {
    const userFrom = parseInt(filters.yearFrom || '0', 10);
    const userTo = parseInt(filters.yearTo || '9999', 10);

    rawProducts = rawProducts.filter(prod => {
      // המרת המטא-פילדס
      const mf = {};
      (prod.metafields || []).forEach((m) => {
        if (m && m.value) mf[m.key] = parseInt(m.value, 10);
      });

      // אם למוצר אין טווח שנים מוגדר, נציג אותו (אוניברסלי) או נסנן (תלוי בהחלטה שלך).
      // כאן אנחנו מניחים שאם אין הגבלה - הוא מתאים.
      const prodFrom = mf.year_from || 0;
      const prodTo = mf.year_to || 9999;

      // בדיקת חפיפה: האם השנה שהמשתמש חיפש נופלת בטווח של המוצר?
      return prodFrom <= userTo && prodTo >= userFrom;
    });
  }

  // המרה למבנה סופי
  const products = rawProducts.map((node) => ({
    id: node.id,
    title: node.title,
    handle: node.handle,
    availableForSale: node.availableForSale,
    vendor: node.vendor,
    tags: node.tags,
    metafields: node.metafields,
    images: node.images,
    variants: {
      edges: [
        { node: { price: node.priceRange.minVariantPrice } }
      ]
    }
  }));

  return {
    title: collection.title,
    description: collection.description,
    products: products,
    filters: collection.filters?.filters || []
  };
}