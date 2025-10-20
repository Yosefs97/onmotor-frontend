// app/api/user/login/route.js
import { serialize } from 'cookie';

const { STRAPI_API_URL, NODE_ENV } = process.env;

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'חסר אימייל או סיסמה' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('שליחה ל:', `${STRAPI_API_URL}/api/auth/local`);

    const res = await fetch(`${STRAPI_API_URL}/api/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.jwt) {
      return new Response(
        JSON.stringify({
          error: data?.error?.message || 'שגיאת התחברות',
        }),
        {
          status: res.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // ✅ יצירת עוגייה מאובטחת
    const cookie = serialize('token', data.jwt, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'none', // מאפשר קרוס-דומיין
      domain: '.onmotormedia.com', // עובד עם כל הסאב דומיינים
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 ימים
    });

    return new Response(JSON.stringify({ success: true, user: data.user }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
    });
  } catch (err) {
    console.error('שגיאת התחברות:', err);
    return new Response(JSON.stringify({ error: 'שגיאה פנימית בשרת' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
