export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const imgUrl = searchParams.get("url");

    if (!imgUrl || !imgUrl.startsWith("https://hondanews.eu/")) {
      return new Response("Missing or invalid url", { status: 400 });
    }

    // 🔹 הגנה מפני טעינה של דף HTML במקום תמונה
    if (imgUrl.includes("/media/photos/")) {
      // ננסה לחלץ את הכתובת האמיתית של התמונה
      const pageRes = await fetch(imgUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36",
          "Referer": "https://hondanews.eu/",
        },
      });
      const html = await pageRes.text();
      const match = html.match(/https:\/\/hondanews\.eu\/image\/motorcycles\/[^\s"'<>]+/i);
      if (match) {
        console.log(`✅ Redirecting proxy to image: ${match[0]}`);
        return Response.redirect(
          `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.onmotormedia.com"}/api/proxy-honda?url=${encodeURIComponent(match[0])}`,
          302
        );
      }
    }

    const response = await fetch(imgUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36",
        "Referer": "https://hondanews.eu/",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Cache-Control": "no-cache",
      },
      redirect: "follow",
    });

    if (!response.ok)
      return new Response(`Failed to fetch image (${response.status})`, { status: 500 });

    // בדיקה אם באמת מדובר בתמונה
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      console.warn(`⚠️ Non-image response: ${contentType}`);
      return new Response("Not an image", { status: 415 });
    }

    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Cross-Origin-Resource-Policy": "cross-origin",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("❌ proxy-honda error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
