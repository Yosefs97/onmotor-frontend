// app/api/forum/comment/route.js
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "https://onmotor-strapi.onrender.com";

export async function POST(req) {
  try {
    const body = await req.json();
    const { threadSlug, author, text } = body;

    if (!threadSlug || !text) {
      return NextResponse.json(
        { error: "שדות חובה חסרים (threadSlug, text)" },
        { status: 400 }
      );
    }

    // שליפת מזהה הדיון מה־slug
    const threadRes = await fetch(
      `${API_URL}/api/forum-threads?filters[slug][$eq]=${encodeURIComponent(threadSlug)}`
    );
    const threadJson = await threadRes.json();
    const threadId = threadJson?.data?.[0]?.id;

    if (!threadId) {
      return NextResponse.json({ error: "לא נמצא דיון תואם ל-slug" }, { status: 404 });
    }

    // יצירת תגובה חדשה ב־Strapi
    const commentRes = await fetch(`${API_URL}/api/forum-comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { text, author, forum_thread: threadId },
      }),
    });

    const responseText = await commentRes.text();
    console.log("📩 תגובת Strapi להוספת תגובה:", responseText);

    if (!commentRes.ok) {
      return NextResponse.json(
        { error: `שגיאה בשליחת תגובה (${commentRes.status})` },
        { status: commentRes.status }
      );
    }

    const json = JSON.parse(responseText);
    return NextResponse.json({ success: true, data: json.data });
  } catch (err) {
    console.error("❌ שגיאה ב־API לשליחת תגובה:", err);
    return NextResponse.json({ error: "שגיאה פנימית בשרת" }, { status: 500 });
  }
}
