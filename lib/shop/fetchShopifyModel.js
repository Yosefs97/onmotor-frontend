// /lib/shop/fetchShopifyModel.js
export async function fetchShopifyModel({ vendor, model, filters = {} }) {
  const params = new URLSearchParams({
    fitBrand: vendor,
    fitModel: model,
    limit: '100',
    ...filters,
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/shopify/search?${params.toString()}`,
    {
      next: { revalidate: 600 },
    }
  );

  const json = await res.json();
  const items = json.items || [];

  return items.sort((a, b) =>
    a.title.localeCompare(b.title, 'he', { sensitivity: 'base' })
  );
}