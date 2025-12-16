// /lib/shop/fetchCollection.js
import { sfFetch } from '@/lib/shopify';

export async function fetchCollection({ handle, filters = {} }) {
  const sortKey = filters.sort === 'price_asc' || filters.sort === 'price_desc' ? 'PRICE' : 'BEST_SELLING';
  const reverse = filters.sort === 'price_desc';

  const shopifyFilters = [];

  // 1. פענוח עברית מה-URL (חשוב מאוד!)
  const cleanType = filters.type ? decodeURIComponent(filters.type) : null;
  const cleanVendor = filters.vendor ? decodeURIComponent(filters.vendor) : null;
  const cleanTag = filters.tag ? decodeURIComponent(filters.tag) : null;

  // בניית הפילטרים לשליחה לשופיפיי (Best Effort)
  if (cleanVendor) shopifyFilters.push({ productVendor: cleanVendor });
  if (cleanType) shopifyFilters.push({ productType: cleanType });
  if (cleanTag) shopifyFilters.push({ tag: cleanTag });

  if (filters.minPrice || filters.maxPrice) {
      const priceFilter = {};
      if (filters.minPrice) priceFilter.min = parseFloat(filters.minPrice);
      if (filters.maxPrice) priceFilter.max = parseFloat(filters.maxPrice);
      shopifyFilters.push({ price: priceFilter });
  }

  // טיפול בפילטרים של וריאציות (מידה/צבע)
  Object.keys(filters).forEach(key => {
    if (key.startsWith('filter.')) {
        try {
            let val = filters[key];
            try { val = JSON.parse(val); } catch {}
            
            if (key.includes('v.option')) {
                const parts = key.split('.');
                const optionName = parts[parts.length - 1]; 
                
                const cleanValue = Array.isArray(val) 
                    ? val.map(v => decodeURIComponent(v)) 
                    : decodeURIComponent(val);

                if (Array.isArray(cleanValue)) {
                    cleanValue.forEach(v => shopifyFilters.push({ variantOption: { name: optionName, value: v } }));
                } else {
                    shopifyFilters.push({ variantOption: { name: optionName, value: cleanValue } });
                }
            }
        } catch (e) { console.error("Error parsing filter:", key, e); }
    }
  });

  // שאילתת GraphQL - שולפים יותר מוצרים (250) כדי שנוכל לסנן ידנית אם צריך
  const query = `#graphql
    query GetCollectionData($handle: String!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $filters: [ProductFilter!]) {
      collection(handle: $handle) {
        id
        title
        description
        
        # שליפת מוצרים (עם פילטרים ברמת ה-API)
        products(first: 250, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
          edges {
            node {
              id
              title
              handle
              availableForSale
              vendor 
              productType 
              tags        
              priceRange { minVariantPrice { amount currencyCode } }
              images(first: 1) { edges { node { url altText } } }
              variants(first: 1) { edges { node { id price { amount currencyCode } } } }
              metafields(identifiers: [
                { namespace: "compatibility", key: "year_from" },
                { namespace: "compatibility", key: "year_to" }
              ]) { namespace key value }
            }
          }
        }
        
        # שליפת פילטרים לממשק (כמו מידות)
        filters: products(first: 0, filters: $filters) {
            filters {
                id
                label
                type
                values { id label count input }
            }
        }
      }
      
      # שליפת כל המוצרים לצורך בניית הסיידבר (ללא פילטרים)
      allProducts: collection(handle: $handle) {
        products(first: 250) {
            edges {
                node {
                    productType
                    tags
                    vendor
                }
            }
        }
      }
    }
  `;

  const { data, error } = await sfFetch(query, { handle, sortKey, reverse, filters: shopifyFilters });

  if (error) {
      console.error("Shopify Fetch Error:", error);
      return null;
  }
  if (!data?.data?.collection) return null;

  const collection = data.data.collection;
  let rawProducts = collection.products.edges.map(e => e.node);
  const allRawProductsForTree = data.data.allProducts.products.edges.map(e => e.node);

  // 🔥🔥🔥 תיקון קריטי: סינון ידני ב-JavaScript (גיבוי) 🔥🔥🔥
  // זה מוודא שאם שופיפיי החזיר את כל המוצרים בגלל בעיית קונפיגורציה, אנחנו נסנן אותם כאן.
  
  if (cleanType) {
    rawProducts = rawProducts.filter(p => p.productType === cleanType);
  }
  if (cleanVendor) {
    rawProducts = rawProducts.filter(p => p.vendor === cleanVendor);
  }
  if (cleanTag) {
    rawProducts = rawProducts.filter(p => p.tags.includes(cleanTag));
  }
  
  // סינון מחיר ידני (אם צריך)
  if (filters.minPrice) {
    rawProducts = rawProducts.filter(p => parseFloat(p.priceRange.minVariantPrice.amount) >= parseFloat(filters.minPrice));
  }
  if (filters.maxPrice) {
    rawProducts = rawProducts.filter(p => parseFloat(p.priceRange.minVariantPrice.amount) <= parseFloat(filters.maxPrice));
  }

  // סינון שנים (כבר היה קיים)
  if (filters.yearFrom || filters.yearTo) {
      const userFrom = parseInt(filters.yearFrom || '0', 10);
      const userTo = parseInt(filters.yearTo || '9999', 10);
      rawProducts = rawProducts.filter(prod => {
        const mf = {};
        (prod.metafields || []).forEach((m) => { if(m) mf[m.key] = parseInt(m.value, 10); });
        const prodFrom = mf.year_from || 0;
        const prodTo = mf.year_to || 9999;
        return prodFrom <= userTo && prodTo >= userFrom;
      });
  }

  // בניית עץ הקטגוריות לסיידבר (נשאר זהה)
  const productTypesCounts = {};
  const tagsCounts = {};
  const vendorCounts = {};
  const currentSelectedType = cleanType; 

  allRawProductsForTree.forEach(prod => {
      if (prod.vendor) vendorCounts[prod.vendor] = (vendorCounts[prod.vendor] || 0) + 1;
      if (prod.productType) productTypesCounts[prod.productType] = (productTypesCounts[prod.productType] || 0) + 1;
      
      if (currentSelectedType && prod.productType === currentSelectedType) {
          prod.tags.forEach(tag => {
              if (!tag.includes(':')) tagsCounts[tag] = (tagsCounts[tag] || 0) + 1;
          });
      }
  });

  const dynamicSidebar = {
      types: Object.entries(productTypesCounts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count),
      tags: Object.entries(tagsCounts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count),
      vendors: Object.entries(vendorCounts).map(([name, count]) => ({ name, count })).sort((a,b) => a.name.localeCompare(b.name)),
      selectedType: currentSelectedType
  };

  const products = rawProducts.map((node) => ({
    id: node.id,
    title: node.title,
    handle: node.handle,
    availableForSale: node.availableForSale,
    vendor: node.vendor,
    tags: node.tags,
    metafields: node.metafields,
    images: node.images,
    variants: { edges: [{ node: { price: node.priceRange.minVariantPrice } }] }
  }));

  return {
    title: collection.title,
    description: collection.description,
    products: products,
    filters: collection.filters?.filters || [],
    dynamicSidebar: dynamicSidebar
  };
}