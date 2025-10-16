// app/api/user/delete/route.js
import { getTokenFromCookie } from '@/utils/auth-server';
import { serialize } from 'cookie';
import { buildEmailTemplate } from '@/utils/emailTemplate';
import { sendEmail } from '@/utils/mailer';

const { STRAPI_API_URL, STRAPI_ADMIN_TOKEN, NODE_ENV } = process.env;

export async function DELETE(request) {
  const jwt = getTokenFromCookie(request);

  if (!jwt) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // שלב 1: שליפת המשתמש המחובר
    const meRes = await fetch(`${STRAPI_API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    const user = await meRes.json();
    if (!user?.id) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // שלב 2: מחיקת המשתמש
    const deleteRes = await fetch(`${STRAPI_API_URL}/api/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}`,
      },
    });

    if (!deleteRes.ok) {
      const err = await deleteRes.json();
      return new Response(JSON.stringify({ error: err.error?.message || 'Delete failed' }), {
        status: deleteRes.status,
      });
    }

    // שלב 3: שליחת מייל פרידה
    try {
      const htmlContent = `
        
        <p>חשבונך נמחק בהצלחה מאתר <strong>OnMotor Media</strong>.</p>
        <p>נשמח לראות אותך שוב בעתיד – הקהילה שלנו תמיד פתוחה בפניך 🚀</p>
        <p>אם תרצה להישאר מעודכן בחדשות, ציוד ומבצעים – הצטרף לניוזלטר שלנו 👇</p>
        <a href="https://onmotormedia.com#newsletter" style="
          display:inline-block;
          margin-top:20px;
          background:#d32f2f;
          color:white;
          padding:10px 20px;
          text-decoration:none;
          border-radius:5px;
          font-weight:bold;">להרשמה לניוזלטר</a>
      `;

      await sendEmail({
        to: user.email,
        subject: 'נשמח לראות אותך שוב - OnMotor Media',
        html: buildEmailTemplate(user.email, 'להתראות, אבל לא לשלום 🙂', htmlContent),
      });
    } catch (err) {
      console.error('שליחת מייל פרידה נכשלה:', err);
    }

    // שלב 4: מחיקת עוגייה
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
    console.error('Delete user error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
