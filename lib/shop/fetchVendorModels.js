// /lib/shop/fetchVendorModels.js
import { fetchModelImages } from './fetchModelImages'; // 🔥 אימפורט חדש

export async function fetchVendorModels({ vendor, filters = {} }) {
  const cleanFilters = { ...filters };

  // ניקוי שדות "0" שלא אמורים להיות בפנייה
  ['year', 'yearFrom', 'yearTo'].forEach((k) => {
    if (cleanFilters[k] === '0' || cleanFilters[k] === 0) {
      delete cleanFilters[k];
    }
  });

  const params = new URLSearchParams({
    vendor,
    limit: '100',
    ...cleanFilters,
  });

  // אנחנו מבצעים שתי קריאות במקביל: אחת למוצרים ואחת לתמונות דגמים
  // זה מייעל זמנים (Promise.all)
  const [resProducts, modelImagesMap] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/shopify/search?${params.toString()}`,
      { next: { revalidate: 600 } }
    ),
    fetchModelImages() // 🔥 שליפת תמונות ה-Metaobjects
  ]);

  const json = await resProducts.json();
  const items = json.items || [];

  // 📌 הפקת רשימת דגמים מתוך התגים
  const modelMap = {};

  items.forEach((p) => {
    const modelTag = p.tags.find((t) => t.startsWith('model:'));
    
    if (modelTag) {
      const modelName = modelTag.replace('model:', '').trim(); // למשל: xevo250

      if (!modelMap[modelName]) {
        // 🔥 בדיקה: האם יש תמונה מוגדרת ב-Metaobjects?
        const metaImage = modelImagesMap[modelName];
        
        // אם יש metaImage נשתמש בו, אחרת נשתמש בתמונה של המוצר הראשון, אחרת כלום
        const finalImage = metaImage || p.images?.edges?.[0]?.node?.url || null;

        modelMap[modelName] = {
          name: modelName,
          image: finalImage,
          handle: modelName.toLowerCase().replace(/\s+/g, '-'),
        };
      } else {
        // (אופציונלי) אם כבר קיים דגם ברשימה אבל אין לו תמונה מה-Metaobject
        // ויש לו רק תמונת מוצר, והמוצר הנוכחי הוא אולי יותר רלוונטי...
        // אבל עדיף להשאיר פשוט: הראשון תופס, אלא אם הוגדר Metaobject.
        
        // אם לדגם הקיים אין תמונה בכלל, ולמוצר הזה יש - נעדכן
        if (!modelMap[modelName].image && p.images?.edges?.[0]?.node?.url) {
           modelMap[modelName].image = p.images.edges[0].node.url;
        }
      }
    }
  });

  const modelsArray = Object.values(modelMap);

  // מיון אלפביתי
  modelsArray.sort((a, b) =>
    a.name.localeCompare(b.name, 'he', { sensitivity: 'base' })
  );

  return modelsArray;
}