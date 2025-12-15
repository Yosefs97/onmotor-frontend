// /lib/shop/fetchCollectionStats.js

// 👇 תיקון: ייבוא הפונקציה בשם הנכון כפי שהיא מוגדרת אצלך בפרויקט
import { sfFetch } from '@/lib/shopify'; 

export async function fetchCollectionStats(handle) {
  const query = `
    query CollectionStats($handle: String!) {
      collection(handle: $handle) {
        title
        handle
        products(first: 100) {
          edges {
            node {
              productType
              vendor
              tags
            }
          }
        }
      }
    }
  `;

  // 👇 תיקון: שימוש ב-sfFetch
  const res = await sfFetch({
    query,
    variables: { handle }
  });

  // וודא שהמבנה שחוזר מ-sfFetch תואם (לפעמים זה res.body.data ולפעמים ישר res.data)
  // ברוב המימושים של sfFetch זה מחזיר את ה-JSON המלא
  const data = res?.body?.data || res?.data; 
  const collection = data?.collection;
  
  if (!collection) return null;

  // עיבוד הנתונים: ספירת יצרנים, סוגים ותגיות
  const typeCounts = {};
  const vendorCounts = {};
  const tagCounts = {};

  collection.products.edges.forEach(({ node }) => {
    // ספירת סוגים
    if (node.productType) {
      typeCounts[node.productType] = (typeCounts[node.productType] || 0) + 1;
    }
    // ספירת יצרנים
    if (node.vendor) {
      vendorCounts[node.vendor] = (vendorCounts[node.vendor] || 0) + 1;
    }
    // ספירת תגיות (מסננים תגיות טכניות כמו cat:xxx)
    if (node.tags) {
        node.tags.forEach(tag => {
          if (!tag.includes(':')) { // מתעלמים מתגיות מערכת
             tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
    }
  });

  // המרה למערך שהסיידבר מצפה לקבל
  const toArray = (obj) => Object.entries(obj).map(([name, count]) => ({ name, count }));

  return {
    title: collection.title,
    handle: collection.handle,
    types: toArray(typeCounts),
    vendors: toArray(vendorCounts),
    tags: toArray(tagCounts)
  };
}