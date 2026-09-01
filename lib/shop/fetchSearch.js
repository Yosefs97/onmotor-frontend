// /lib/shop/fetchSearch.js
export async function fetchSearchResults(filters = {}) {
  const params = new URLSearchParams({ ...filters, limit: '24' });

  const res = await fetch(
  `${process.env.NEXT_PUBLIC_SITE_URL}/api/shopify/search?${params.toString()}`,
  { next: { revalidate: 600 } }
);

const body = await res.text();
const json = body ? JSON.parse(body) : {};

if (!res.ok || json.error) {
  throw new Error(json.error || `Shopify search failed: ${res.status}`);
}

return json.items || [];
}
