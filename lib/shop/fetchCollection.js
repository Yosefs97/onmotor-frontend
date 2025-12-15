// /lib/shop/fetchCollection.js
import { sfFetch } from '@/app/api/shopify/product/[handle]/route';

export async function fetchCollection({ handle, filters = {} }) {
  const sortKey = filters.sort === 'price_asc' || filters.sort === 'price_desc' ? 'PRICE' : 'BEST_SELLING';
  const reverse = filters.sort === 'price_desc';

  const shopifyFilters = [];

  // 1. יצרן (Vendor)
  if (filters.vendor) shopifyFilters.push({ productVendor: filters.vendor });

  // 2. סוג מוצר (Product Type)
  if (filters.type) shopifyFilters.push({ productType: filters.type });

  // 3. תגיות (Tags)
  if (filters.tag) shopifyFilters.push({ tag: filters.tag });

  // 4. מחיר (Price) - טיפול בטווחים
  if (filters.minPrice || filters.maxPrice) {
      const priceFilter = {};
      if (filters.minPrice) priceFilter.min = parseFloat(filters.minPrice);
      if (filters.maxPrice) priceFilter.max = parseFloat(filters.maxPrice);
      shopifyFilters.push({ price: priceFilter });
  }

  // 5. פילטרים חכמים (וריאציות: מידה, צבע וכו')
  Object.keys(filters).forEach(key => {
    // שופיפיי שולח פילטרים בפורמט: filter.v.option.size
    if (key.startsWith('filter.')) {
        try {
            let val = filters[key];
            // לפעמים הערך מגיע כמחרוזת JSON (מערך) ולפעמים כסטרינג
            try { val = JSON.parse(val); } catch {}
            
            // זיהוי וריאציות (Size, Color)
            if (key.includes('v.option')) {
                const parts = key.split('.');
                const optionName = parts[parts.length - 1]; // "size", "color"
                
                if (Array.isArray(val)) {
                    val.forEach(v => shopifyFilters.push({ variantOption: { name: optionName, value: v } }));
                } else {
                    shopifyFilters.push({ variantOption: { name: optionName, value: val } });
                }
            }
        } catch (e) { console.error("Error parsing filter:", key, e); }
    }
  });

  const query = `#graphql
    query GetCollectionData($handle: String!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $filters: [ProductFilter!]) {
      collection(handle: $handle) {
        id
        title
        description
        
        # 1. שליפת מוצרים מסוננים
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

        # 2. שליפת הפילטרים החכמים של שופיפיי (בשביל המידות)
        # אנחנו צריכים את זה כדי לדעת אילו מידות זמינות בתוצאות הנוכחיות
        filters: products(first: 0, filters: $filters) {
            filters {
                id
                label
                type
                values { id label count input }
            }
        }
      }
      
      # 3. שליפת כל המוצרים לבניית העץ (ללא פילטרים)
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

  if (error || !data?.data?.collection) return null;

  const collection = data.data.collection;
  let rawProducts = collection.products.edges.map(e => e.node);
  const allRawProductsForTree = data.data.allProducts.products.edges.map(e => e.node);

  // סינון שנים ידני (לא השתנה)
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

  // בניית עץ הקטגוריות
  const productTypesCounts = {};
  const tagsCounts = {};
  const vendorCounts = {};
  const currentSelectedType = filters.type ? decodeURIComponent(filters.type) : null;

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
    filters: collection.filters?.filters || [], // כאן מגיעות המידות משופיפיי
    dynamicSidebar: dynamicSidebar
  };
}