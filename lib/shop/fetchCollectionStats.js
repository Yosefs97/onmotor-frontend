import { shopifyFetch } from '@/lib/shopify'; // או הפונקציה שאתה משתמש בה לביצוע בקשות

export async function fetchCollectionStats(handle) {
  // שאילתה שמביאה את המוצרים בקולקציה כדי לחלץ מהם סטטיסטיקות
  // הערה: בשופיפיי אין שליפה ישירה של "סטטיסטיקות", אז שולפים מוצרים ומסכמים בצד שרת
  // או שמשתמשים ב-Filter API של שופיפיי אם הוא מוגדר.
  // זו דוגמה פשוטה של שליפת 100 מוצרים וסיכום ידני:

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

  const res = await shopifyFetch({
    query,
    variables: { handle }
  });

  const collection = res.body.data.collection;
  
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
    node.tags.forEach(tag => {
      if (!tag.includes(':')) { // מתעלמים מתגיות מערכת
         tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    });
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