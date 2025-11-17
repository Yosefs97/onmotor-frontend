// app/api/social/route.js
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const results = {};

    // ✅ YouTube
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${process.env.YT_CHANNEL_ID}&key=${process.env.YT_API_KEY}`
    );
    const ytJson = await ytRes.json();
    results.youtube = ytJson.items?.[0]?.statistics?.subscriberCount || "—";

    // ✅ Facebook Page
    const fbRes = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.FB_PAGE_ID}?fields=followers_count&access_token=${process.env.META_ACCESS_TOKEN}`
    );
    const fbJson = await fbRes.json();
    results.facebook = fbJson.followers_count || "—";

    // ✅ Instagram Business
    const igRes = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.IG_BUSINESS_ID}?fields=followers_count&access_token=${process.env.META_ACCESS_TOKEN}`
    );
    const igJson = await igRes.json();
    results.instagram = igJson.followers_count || "—";

    // ✅ Telegram
    const tgRes = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChatMembersCount?chat_id=${process.env.TELEGRAM_CHAT_ID}`
    );
    const tgJson = await tgRes.json();
    results.telegram = tgJson.result || "—";

    // ✅ TikTok (בשלב זה – ידני/צד ג׳)
    results.tiktok = "—"; // לשלב בהמשך עם API חיצוני

    return NextResponse.json({ success: true, data: results });
  } catch (err) {
    console.error("❌ Social API error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
