// /lib/shop/fetchShopifyModel.js
export async function fetchShopifyModel({ vendor, model, filters = {} }) {
  const params = new URLSearchParams({
    fitBrand: vendor,
    fitModel: model,
    limit: '250', // הגדלנו לטובת סינון תגיות מדויק במקרה שיש הצפות של וונדורים
    ...filters,
  });

  const res = await fetch(
    `${process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL}/api/shopify/search?${params.toString()}`,
    {
      next: { revalidate: 600 },
    }
  );

  const json = await res.json();
  const items = json.items || [];

  // 🔥 אכיפת שיוך לפי תגיות בלבד (Post-Filtering) 🔥
  const normalizedVendorTarget = vendor.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizedModelTarget = model.toLowerCase().replace(/[^a-z0-9]/g, '');

  const strictlyMatchedItems = items.filter((p) => {
    if (!p.tags || !Array.isArray(p.tags)) return false;

    // בודק אם לפחות תגית אחת מתאימה במדויק לקומבינציית יצרן + דגם
    return p.tags.some((t) => {
      if (!t.toLowerCase().startsWith('fit:')) return false;
      
      const parts = t.split(':');
      if (parts.length < 3) return false;

      const tagVendor = parts[1].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const tagModel = parts[2].trim().toLowerCase().replace(/[^a-z0-9]/g, '');

      return tagVendor === normalizedVendorTarget && tagModel === normalizedModelTarget;
    });
  });

  return strictlyMatchedItems.sort((a, b) =>
    a.title.localeCompare(b.title, 'he', { sensitivity: 'base' })
  );
}