// /lib/shop/fetchCollection.js
import { sfFetch } from '@/lib/shopify';

export async function fetchCollection({ handle, filters = {} }) {
  const sortKey = filters.sort === 'price_asc' || filters.sort === 'price_desc' ? 'PRICE' : 'BEST_SELLING';
  const reverse = filters.sort === 'price_desc';

  const shopifyFilters = [];

  // 1. פענוח עברית
  const cleanType = filters.type ? decodeURIComponent(filters.type) : null;
  const cleanVendor = filters.vendor ? decodeURIComponent(filters.vendor) : null;
  const cleanTag = filters.tag ? decodeURIComponent(filters.tag) : null;

  // בניית פילטרים ל-API (Best Effort)
  if (cleanVendor) shopifyFilters.push({ productVendor: cleanVendor });
  if (cleanType) shopifyFilters.push({ productType: cleanType });
  if (cleanTag) shopifyFilters.push({ tag: cleanTag });

  if (filters.minPrice || filters.maxPrice) {
      const priceFilter = {};
      if (filters.minPrice) priceFilter.min = parseFloat(filters.minPrice);
      if (filters.maxPrice) priceFilter.max = parseFloat(filters.maxPrice);
      shopifyFilters.push({ price: priceFilter });
  }

  // טיפול במידות/וריאציות
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

  const query = `#graphql
    query GetCollectionData($handle: String!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $filters: [ProductFilter!]) {
      collection(handle: $handle) {
        id
        title
        description
        
        # מוצרים לתצוגה בגריד (מסוננים ע"י שופיפיי אם אפשר)
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
        
        # פילטרים מובנים (מידות)
        filters: products(first: 0, filters: $filters) {
            filters {
                id
                label
                type
                values { id label count input }
            }
        }
      }
      
      # שליפת "כל" המוצרים בקולקציה לבניית הסיידבר החכם
      # הגדלתי ל-250 כדי לקבל תמונה מלאה ככל האפשר
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
  
  // המאגר המלא של המוצרים בקולקציה (לצורך חישוב הסיידבר)
  const fullCollectionTree = data.data.allProducts.products.edges.map(e => e.node);

  // --- 1. סינון הגריד (מוצרים לתצוגה) ---
  // סינון ידני לגיבוי (במקרה שה-API לא סינן)
  if (cleanType) rawProducts = rawProducts.filter(p => p.productType === cleanType);
  if (cleanVendor) rawProducts = rawProducts.filter(p => p.vendor === cleanVendor);
  if (cleanTag) rawProducts = rawProducts.filter(p => p.tags.includes(cleanTag));
  
  if (filters.minPrice) rawProducts = rawProducts.filter(p => parseFloat(p.priceRange.minVariantPrice.amount) >= parseFloat(filters.minPrice));
  if (filters.maxPrice) rawProducts = rawProducts.filter(p => parseFloat(p.priceRange.minVariantPrice.amount) <= parseFloat(filters.maxPrice));

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

  // --- 2. בניית הסיידבר החכם (Smart Faceting) ---
  
  // פונקציית עזר לספירה
  const countBy = (items, keyExtractor) => {
    const counts = {};
    items.forEach(item => {
      const keys = keyExtractor(item);
      const keyList = Array.isArray(keys) ? keys : [keys];
      keyList.forEach(k => {
        if (k && !k.includes(':')) { // סינון תגיות טכניות
            counts[k] = (counts[k] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // מיון לפי כמות יורדת
  };

  // א. חישוב רשימת הקטגוריות (Types):
  // מסננים את המאגר המלא לפי היצרן והתגית שנבחרו (אבל מתעלמים מהסוג שנבחר, כדי להציג את כל הסוגים הזמינים בסינון הנוכחי)
  const typesPool = fullCollectionTree.filter(p => 
      (!cleanVendor || p.vendor === cleanVendor) && 
      (!cleanTag || p.tags.includes(cleanTag))
  );
  const typeCounts = countBy(typesPool, p => p.productType);

  // ב. חישוב רשימת היצרנים (Vendors):
  // מסננים לפי הסוג והתגית שנבחרו (מתעלמים מהיצרן, כדי להראות את כל היצרנים האופציונליים)
  const vendorsPool = fullCollectionTree.filter(p => 
      (!cleanType || p.productType === cleanType) && 
      (!cleanTag || p.tags.includes(cleanTag))
  );
  const vendorCounts = countBy(vendorsPool, p => p.vendor);

  // ג. חישוב רשימת התגיות (Tags):
  // מסננים לפי הסוג והיצרן שנבחרו (כאן אנחנו רוצים לצמצם תגיות רק למה שרלוונטי למוצרים המוצגים)
  const tagsPool = fullCollectionTree.filter(p => 
      (!cleanType || p.productType === cleanType) && 
      (!cleanVendor || p.vendor === cleanVendor)
  );
  const tagCounts = countBy(tagsPool, p => p.tags);

  const dynamicSidebar = {
      types: typeCounts,
      vendors: vendorCounts,
      tags: tagCounts,
      selectedType: cleanType
  };

  // הכנת המוצרים לתצוגה
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