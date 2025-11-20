import { put, head } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    const mediaUrl = req.query.url;

    if (!mediaUrl) {
      return res.status(400).json({ error: "Missing URL" });
    }

    // יצירת שם ייחודי
    const extension = mediaUrl.split(".").pop().split("?")[0] || "jpg";
    const safeExt = extension.replace(/[^a-zA-Z0-9]/g, "");
    const filename =
      "media-" + Buffer.from(mediaUrl).toString("base64") + "." + safeExt;

    // בדיקת קיום ב־Blob
    const exists = await head(filename).catch(() => null);
    if (exists?.url) {
      return res.redirect(302, exists.url);
    }

    // הורדת התמונה
    const response = await fetch(mediaUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "*/*",
      },
    });

    if (!response.ok) {
      return res
        .status(500)
        .json({ error: "Remote fetch failed", status: response.status });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // שמירה ב־Blob
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: response.headers.get("content-type") || "image/jpeg",
    });

    return res.redirect(302, blob.url);
  } catch (err) {
    console.error("proxy-media error:", err);
    return res.status(500).json({ error: err.message });
  }
}
