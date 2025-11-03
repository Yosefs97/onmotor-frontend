// app/api/proxy-honda/route.js

/**
 * ✅ Proxy API for Honda News images
 * מאפשר לטעון תמונות מ־hondanews.eu מבלי לקבל את הלוגו שלהם (עוקף את Hotlink Protection)
 */

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const imgUrl = searchParams.get("url");

    if (!imgUrl || !imgUrl.startsWith("https://hondanews.eu/")) {
      return new Response("Missing or invalid url", { status: 400 });
    }

    // 🛰️ בקשה אמיתית לשרת של הונדה
    const response = await fetch(imgUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36",
        "Referer": "https://hondanews.eu/",
        "Accept":
          "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return new Response(`Failed to fetch image (${response.status})`, {
        status: response.status,
      });
    }

    // 🎯 שליפת תוכן התמונה
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // 📦 החזרה עם כותרות מתאימות ודיליי Cache ל־24 שעות
    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // 24h
      },
    });
  } catch (err) {
    console.error("❌ proxy-honda error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
