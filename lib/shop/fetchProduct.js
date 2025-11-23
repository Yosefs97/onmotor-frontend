// /lib/shop/fetchProduct.js
export async function fetchProduct(handle) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/shopify/product/${handle}`,
    { next: { revalidate: 600 } }
  );

  const json = await res.json();
  return json.item || null;
}
