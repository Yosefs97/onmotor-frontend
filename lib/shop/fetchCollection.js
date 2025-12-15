// /lib/shop/fetchCollection.js
import { sfFetch } from '@/app/api/shopify/product/[handle]/route';

export async function fetchCollection({ handle, filters = {} }) {
  // 1. הגדרות מיון
  const sortKey = filters.sort === 'price_asc' || filters.sort === 'price_desc' ? 'PRICE' : 'BEST_SELLING';
  const reverse = filters.sort === 'price_desc';

  // 2. בניית מערך הפילטרים לשאילתה הראשית
  const shopifyFilters = [];

  // סינון לפי יצרן
  if (filters.vendor) shopifyFilters.push({ productVendor: filters.vendor });

  // סינון לפי סוג מוצר (תת-קטגוריה) - זה הקסם החדש
  if (filters.type) shopifyFilters.push({ productType: filters.type });

  // סינון לפי תגיות (תת-תת-קטגוריה)
  if (filters.tag) shopifyFilters.push({ tag: filters.tag });

  // פילטרים דינמיים נוספים (מידה, וכו')
  Object.keys(filters).forEach(key => {
    if (key.startsWith('filter.')) {
        // ... (אותו קוד טיפול בפילטרים חכמים שכתבנו קודם) ...
        try {
            let val = filters[key];
            try { val = JSON.parse(val); } catch {}
            
            if (key.includes('v.option')) {
                const parts = key.split('.');
                const optionName = parts[parts.length - 1];
                if (Array.isArray(val)) {
                    val.forEach(v => shopifyFilters.push({ variantOption: { name: optionName, value: v } }));
                } else {
                    shopifyFilters.push({ variantOption: { name: optionName, value: val } });
                }
            }
             // טיפול במחיר
            else if (key.includes('v.price')) {
                shopifyFilters.push({ price: val });
            }
        } catch (e) { console.error(e); }
    }
  });
  
  // טיפול בשנים (ידני, כמו קודם) - לא נשלח לשופיפיי בשלב זה

  const query = `#graphql
    query GetCollectionData($handle: String!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $filters: [ProductFilter!]) {
      collection(handle: $handle) {
        id
        title
        description
        
        # שליפת מוצרים (250 כדי לקבל סטטיסטיקה טובה)
        products(first: 250, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
          edges {
            node {
              id
              title
              handle
              availableForSale
              vendor 
              productType # חשוב מאוד!
              tags        # חשוב מאוד!
              
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
      }
      
      # שליפת "כל המוצרים" בקטגוריה (ללא פילטרים) כדי לבנות את עץ הקטגוריות השלם
      # אנחנו צריכים לדעת כמה כפפות יש סה"כ, גם אם כרגע סיננו לפי יצרן מסוים
      allProducts: collection(handle: $handle) {
        products(first: 250) {
            edges {
                node {
                    productType
                    tags
                    vendor
                    metafields(identifiers: [
                        { namespace: "compatibility", key: "year_from" },
                        { namespace: "compatibility", key: "year_to" }
                    ]) { key value }
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

  // --- סינון שנים ידני (כמו קודם) ---
  if (filters.yearFrom || filters.yearTo) {
      // ... (אותו קוד סינון שנים שהיה לך) ...
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

  // --- בניית עץ הקטגוריות הדינמי (החלק החדש והחשוב) ---
  
  // 1. חישוב תתי-קטגוריות (Product Types)
  // דוגמה: { "כפפות": 24, "מעילים": 30 }
  const productTypesCounts = {};
  
  // 2. חישוב תתי-תת-קטגוריות (Tags) - רלוונטי רק אם נבחר Type ספציפי
  // דוגמה אם נבחר "כפפות": { "חורף": 5, "קיץ": 10 }
  const tagsCounts = {};
  
  // 3. יצרנים זמינים בקטגוריה
  const vendorCounts = {};

  const currentSelectedType = filters.type ? decodeURIComponent(filters.type) : null;

  allRawProductsForTree.forEach(prod => {
      // ספירת יצרנים
      if (prod.vendor) {
          vendorCounts[prod.vendor] = (vendorCounts[prod.vendor] || 0) + 1;
      }

      // ספירת סוגי מוצרים (תמיד מוצג)
      if (prod.productType) {
          productTypesCounts[prod.productType] = (productTypesCounts[prod.productType] || 0) + 1;
      }

      // ספירת תגיות (רק אם אנחנו בתוך תת-קטגוריה, או אם נרצה להציג הכל)
      // הלוגיקה: אם המשתמש בחר "כפפות", נספור תגיות רק של מוצרים שהם "כפפות"
      if (currentSelectedType) {
          if (prod.productType === currentSelectedType) {
              prod.tags.forEach(tag => {
                  // סינון תגיות טכניות (כמו cat:road או model:exc)
                  if (!tag.includes(':')) { 
                      tagsCounts[tag] = (tagsCounts[tag] || 0) + 1;
                  }
              });
          }
      }
  });

  // הכנת הנתונים לסרגל
  const dynamicSidebar = {
      types: Object.entries(productTypesCounts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count),
      tags: Object.entries(tagsCounts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count),
      vendors: Object.entries(vendorCounts).map(([name, count]) => ({ name, count })).sort((a,b) => a.name.localeCompare(b.name)),
      selectedType: currentSelectedType
  };

  // המרת מוצרים למבנה תצוגה
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
    dynamicSidebar: dynamicSidebar // שולחים את העץ שבנינו לדף
  };
}