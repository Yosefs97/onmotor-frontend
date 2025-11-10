//app/api/forum-thread/views/route.js
import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export async function POST(req) {
  try {
    const { threadId } = await req.json();
    if (!threadId) {
      return NextResponse.json({ error: 'threadId נדרש' }, { status: 400 });
    }

    // שליפה נוכחית
    const resGet = await fetch(`${STRAPI_URL}/api/forum-threads/${threadId}?fields[0]=views`);
    const data = await resGet.json();
    const currentViews = data?.data?.attributes?.views || 0;

    // עדכון מונה צפיות
    const resUpdate = await fetch(`${STRAPI_URL}/api/forum-threads/${threadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { views: currentViews + 1 },
      }),
    });

    const updated = await resUpdate.json();
    return NextResponse.json({ success: true, views: updated.data.attributes.views });
  } catch (err) {
    console.error('View update error:', err);
    return NextResponse.json({ error: 'שגיאה בעדכון צפיות' }, { status: 500 });
  }
}
