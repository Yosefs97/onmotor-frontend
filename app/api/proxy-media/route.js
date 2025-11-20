//app/api/proxy-media/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { put, head } from "@vercel/blob";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaUrl = searchParams.get("url");

    if (!mediaUrl) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    // יצירת שם קובץ ייחודי לפי URL
    const extension = mediaUrl.split('.').pop().split('?')[0];
    const filename =
      "media-" + Buffer.from(mediaUrl).toString("base64") + "." + extension;

    // בדיקה האם קיים ב־Blob
    const exists = await head(filename).catch(() => null);
    if (exists?.url) return NextResponse.redirect(exists.url);

    // משיכת התוכן החיצוני
    const res = await fetch(mediaUrl, { next: { revalidate: 3600 } });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch remote media" },
        { status: 500 }
      );
    }

    const buffer = await res.arrayBuffer();

    // שמירה ב־Blob
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: res.headers.get("content-type") || "application/octet-stream",
    });

    return NextResponse.redirect(blob.url);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
