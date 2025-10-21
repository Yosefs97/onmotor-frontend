//app\api\user\delete-account\route.js
import { getTokenFromCookie } from '@/utils/auth-server';
import { serialize } from 'cookie';
import { buildEmailTemplate } from '@/utils/emailTemplate';
import { sendEmail } from '@/utils/mailer';

const { STRAPI_API_URL, STRAPI_ADMIN_TOKEN, NODE_ENV } = process.env;

export async function DELETE(request) {
  console.log('🟢 delete-account route reached!');
  const jwt = getTokenFromCookie(request);

  if (!jwt) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // שלב 1: שליפת פרטי המשתמש
    const meRes = await fetch(`${STRAPI_API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const user = await meRes.json();

    if (!user?.id) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // שלב 2: מחיקה ע"י אדמין
    const deleteRes = await fetch(`${STRAPI_API_URL}/api/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}`,
      },
    });

    if (!deleteRes.ok) {
      const err = await deleteRes.json();
      throw new Error(err?.error?.message || 'Delete failed');
    }

    // שלב 3: מייל פרידה
    try {
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
    } catch (err) {
      console.warn('⚠️ שליחת מייל פרידה נכשלה:', err.message);
    }

    // שלב 4: ניקוי העוגייה
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
