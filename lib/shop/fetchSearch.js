// /lib/shop/fetchSearch.js
export async function fetchSearchResults(filters = {}) {
  const params = new URLSearchParams({ ...filters, limit: '24' });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/shopify/search?${params.toString()}`,
    { next: { revalidate: 600 } }
  );

  const json = await res.json();
  return json.items || [];
}
