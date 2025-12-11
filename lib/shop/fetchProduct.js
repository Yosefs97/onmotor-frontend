// /lib/shop/fetchProduct.js
export async function fetchProduct(handle) {
  // אם ה-handle מגיע ריק, נחזיר null מיד
  if (!handle) return null;

  try {
    // 🔥 תיקון קריטי: קידוד ה-handle
    // אם ה-handle הוא בעברית (למשל "קסדה"), הוא חייב להיות מקודד כדי לעבור בכתובת ה-URL
    const encodedHandle = encodeURIComponent(handle);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/shopify/product/${encodedHandle}`,
      { 
        next: { revalidate: 600 },
        // כדאי להוסיף כדי למנוע בעיות מטמון מיותרות בתוך ה-fetch עצמו
        headers: { 'Content-Type': 'application/json' } 
      }
    );

    // בדיקה שהשרת החזיר תשובה תקינה (200 OK)
    if (!res.ok) {
      console.error(`Failed to fetch product: ${handle}, Status: ${res.status}`);
      return null;
    }

    const json = await res.json();
    return json.item || null;

  } catch (error) {
    console.error('Error in fetchProduct:', error);
    return null;
  }
}