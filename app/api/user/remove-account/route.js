// app/api/user/remove-account/route.js
import { getTokenFromCookie } from '@/utils/auth-server';
import { serialize } from 'cookie';
import { buildEmailTemplate } from '@/utils/emailTemplate';
import { sendEmail } from '@/utils/mailer';

const { STRAPI_API_URL, NODE_ENV } = process.env;

export async function DELETE(request) {
  console.log('🟢 delete-account route reached!');

  // 🟩 שלב 1: שליפת הטוקן
  let jwt = getTokenFromCookie(request);
  if (!jwt) {
    // במידה והעוגייה לא קיימת (למשל במצב פיתוח או קרוס-דומיין)
    const tokenFromHeader = request.headers.get('authorization');
    jwt = tokenFromHeader?.replace('Bearer ', '') || null;
  }

  if (!jwt) {
    console.warn('❌ No JWT found in cookies or headers');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 🟦 שלב 2: שליפת פרטי המשתמש
    const meRes = await fetch(`${STRAPI_API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    if (!meRes.ok) {
      console.warn('⚠️ Failed to fetch user info:', meRes.status);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await meRes.json();
    if (!user?.email) {
      console.warn('⚠️ Missing email in user data:', user);
    }

    // 🟥 שלב 3: מחיקה עצמית ב־Strapi
    const deleteRes = await fetch(`${STRAPI_API_URL}/api/users/me`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!deleteRes.ok) {
      const err = await deleteRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Delete failed (${deleteRes.status})`);
    }

    console.log('✅ User deleted successfully in Strapi');

    // 🟨 שלב 4: שליחת מייל פרידה (לא חובה להצלחה)
    try {
      if (user?.email) {
        const html = `
          <p>חשבונך נמחק בהצלחה מאתר <strong>OnMotor Media</strong>.</p>
          <p>נשמח לראות אותך שוב בעתיד – הקהילה שלנו תמיד פתוחה בפניך 🏍️</p>
          <p>רוצה להישאר בעניינים? הצטרף לניוזלטר שלנו:</p>
          <a href="https://onmotormedia.com#newsletter" style="display:inline-block;margin-top:15px;background:#d32f2f;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">להרשמה לניוזלטר</a>
        `;
        await sendEmail({
          to: user.email,
          subject: 'נשמח לראות אותך שוב - OnMotor Media',
          html: buildEmailTemplate(user.email, 'להתראות, אבל לא לשלום 🙂', html),
        });
      }
    } catch (err) {
      console.warn('⚠️ שליחת מייל פרידה נכשלה:', err.message);
    }

    // 🟩 שלב 5: ניקוי העוגייה
    const cookie = serialize('token', '', {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
    });
  } catch (err) {
    console.error('❌ Delete user error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
// ✅ רק לצורכי בדיקה שהנתיב מזוהה
export async function GET() {
  return new Response(
    JSON.stringify({ message: 'Route exists, use DELETE instead' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
