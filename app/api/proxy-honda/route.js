// app/api/proxy-honda/route.js

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const imgUrl = searchParams.get("url");

    if (!imgUrl || !imgUrl.startsWith("https://hondanews.eu/")) {
      return new Response("Missing or invalid url", { status: 400 });
    }

    console.log(`🟢 Proxying Honda image: ${imgUrl}`);

    // 🧭 במקרה של עמוד מדיה (לא תמונה ישירה)
    if (imgUrl.includes("/media/photos/")) {
      const page = await fetch(imgUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36",
          "Referer": "https://hondanews.eu/",
        },
      });
      const html = await page.text();
      const match = html.match(/https:\/\/hondanews\.eu\/image\/motorcycles\/[^\s"'<>]+/i);
      if (match) {
        const realImage = match[0];
        console.log(`✅ Redirecting to image: ${realImage}`);
        return Response.redirect(
          `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.onmotormedia.com"}/api/proxy-honda?url=${encodeURIComponent(realImage)}`,
          302
        );
      }
    }

    // 🖼️ טעינה ישירה של תמונה
    const res = await fetch(imgUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36",
        "Referer": "https://hondanews.eu/",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      console.warn(`⚠️ Failed to fetch image: ${res.status}`);
      return new Response("Fetch failed", { status: 500 });
    }

    const type = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
        "Cross-Origin-Resource-Policy": "cross-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
        "Content-Disposition": "inline",
      },
    });
  } catch (err) {
    console.error("❌ proxy-honda error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
