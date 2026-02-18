// /lib/shop/fetchVendorModels.js
import { fetchModelImages } from './fetchModelImages';

export async function fetchVendorModels({ vendor, filters = {} }) {
  const cleanFilters = { ...filters };

  ['year', 'yearFrom', 'yearTo'].forEach((k) => {
    if (cleanFilters[k] === '0' || cleanFilters[k] === 0) {
      delete cleanFilters[k];
    }
  });

  const params = new URLSearchParams({
    vendor,
    limit: '250', // הגדלנו מעט כדי לוודא שנקבל מספיק מוצרים להיסטוריה
    ...cleanFilters,
  });

  const [resProducts, modelImagesMap] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/shopify/search?${params.toString()}`,
      { next: { revalidate: 600 } }
    ),
    fetchModelImages()
  ]);

  const json = await resProducts.json();
  const items = json.items || [];

  const modelMap = {};

  items.forEach((p) => {
    const modelTag = p.tags.find((t) => t.startsWith('model:'));
    
    if (modelTag) {
      const modelName = modelTag.replace('model:', '').trim();

      if (!modelMap[modelName]) {
        modelMap[modelName] = {
          name: modelName,
          handle: modelName.toLowerCase().replace(/\s+/g, '-'),
          products: [] // נאסוף כאן את המוצרים כדי למצוא את הישן ביותר
        };
      }
      
      // מוסיפים את המוצר לרשימה של הדגם
      modelMap[modelName].products.push({
        createdAt: p.createdAt || p.publishedAt, // תאריך העלאה
        images: p.images?.edges?.map(edge => edge.node.url) || [] // רשימת כל התמונות
      });
    }
  });

  // עכשיו נעבור על כל דגם ונבחר את התמונה הנכונה
  const modelsArray = Object.values(modelMap).map(model => {
    let finalImage = modelImagesMap[model.name] || null;

    // אם אין תמונת Metaobject, נחפש לפי הלוגיקה שלך
    if (!finalImage && model.products.length > 0) {
      // 1. מיון מהמוצר הכי ישן לחדש ביותר
      const sortedByDate = model.products.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
      
      const oldestProduct = sortedByDate[0];

      // 2. לקיחת התמונה האחרונה מהמוצר הכי ישן
      if (oldestProduct.images.length > 0) {
        finalImage = oldestProduct.images[oldestProduct.images.length - 1];
      }
    }

    return {
      name: model.name,
      handle: model.handle,
      image: finalImage
    };
  });

  // מיון אלפביתי של הדגמים
  modelsArray.sort((a, b) =>
    a.name.localeCompare(b.name, 'he', { sensitivity: 'base' })
  );

  return modelsArray;
}