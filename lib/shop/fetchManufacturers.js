// /lib/shop/fetchManufacturers.js
export async function fetchManufacturers() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/shopify/collections?limit=50`,
    {
      next: { revalidate: 600 }, // ISR — טוען פעם ב־10 דקות
    }
  );

  const json = await res.json();
  const items = json.items || [];

  // מיון אלפביתי
  items.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));

  return items;
}
