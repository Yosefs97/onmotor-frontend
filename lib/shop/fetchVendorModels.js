// /lib/shop/fetchVendorModels.js
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

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/shopify/search?${params.toString()}`,
    {
      next: { revalidate: 600 }, // ISR אמיתי
    }
  );

  const json = await res.json();
  const items = json.items || [];

  // 📌 הפקת רשימת דגמים מתוך התגים
  const modelMap = {};

  items.forEach((p) => {
    const modelTag = p.tags.find((t) => t.startsWith('model:'));
    if (modelTag) {
      const modelName = modelTag.replace('model:', '').trim();

      if (!modelMap[modelName]) {
        modelMap[modelName] = {
          name: modelName,
          image: p.images?.edges?.[0]?.node?.url || null,
          handle: modelName.toLowerCase().replace(/\s+/g, '-'),
        };
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
