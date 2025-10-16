// /app/api/drive-proxy/route.js
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");

    if (!fileId) {
      return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
    }

    // התחברות עם Service Account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    // מביאים את המידע על הקובץ
    const file = await drive.files.get({
      fileId,
      alt: "media",
    }, { responseType: "stream" });

    // מחזירים כ־Stream ללקוח
    return new Response(file.data, {
      headers: {
        "Content-Type": "image/jpeg", // אם זה תמיד תמונות; אפשר גם לזהות לפי mimeType
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("שגיאה ב־drive-proxy:", err.message);
    return NextResponse.json({ error: "שגיאה בשליפת קובץ" }, { status: 500 });
  }
}
