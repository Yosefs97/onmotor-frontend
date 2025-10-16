// /app/api/views/route.js
import { NextResponse } from 'next/server';

// ⚠️ תצטרך להכניס API Keys מתאימים לקובץ .env.local
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  try {
    let views = null;

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('v=')
        ? new URL(url).searchParams.get('v')
        : url.split('/').pop();
      const ytRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
      );
      const ytJson = await ytRes.json();
      views = ytJson.items?.[0]?.statistics?.viewCount || null;
    }

    // TikTok / Instagram / Facebook / Twitter
    // ⚠️ דורשים OAuth API Keys רשמיים → אחרת אין גישה ישירה
    // כאן אפשר לשים future support, או לשמור views ידני ב-Strapi

    return NextResponse.json({ views });
  } catch (err) {
    console.error('Error fetching views:', err);
    return NextResponse.json({ views: null });
  }
}
