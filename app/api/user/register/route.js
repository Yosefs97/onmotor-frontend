// app/api/user/register/route.js
import { serialize } from 'cookie';
import { buildEmailTemplate } from '@/utils/emailTemplate';
import { sendEmail } from '@/utils/mailer';

const { STRAPI_API_URL, STRAPI_ADMIN_TOKEN, NODE_ENV } = process.env;

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'חסר אימייל או סיסמה' }), { status: 400 });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (!passwordRegex.test(password)) {
    return new Response(JSON.stringify({
      error: 'הסיסמה חייבת להכיל לפחות 6 תווים, כולל אות גדולה, אות קטנה ומספר'
    }), { status: 400 });
  }

  try {
    // בדיקת אם האימייל כבר קיים
    const checkRes = await fetch(`${STRAPI_API_URL}/api/users?filters[email][$eq]=${email}`, {
      headers: { Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}` },
    });
    const existing = await checkRes.json();
    if (existing?.data?.length > 0 || existing?.length > 0) {
      return new Response(JSON.stringify({ error: 'אימייל כבר רשום' }), { status: 409 });
    }

    // יצירת המשתמש
    const createRes = await fetch(`${STRAPI_API_URL}/api/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, email, password }),
    });

    const result = await createRes.json();
    if (!createRes.ok) {
      return new Response(JSON.stringify({ error: result?.error?.message || 'שגיאה ביצירת המשתמש' }), {
        status: createRes.status || 500,
      });
    }

    // התחברות מיידית
    const loginRes = await fetch(`${STRAPI_API_URL}/api/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: email, password }),
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.jwt) {
      return new Response(JSON.stringify({ error: 'המשתמש נוצר אך לא הצלחנו לחבר אותו אוטומטית' }), { status: 200 });
    }

    // ✅ עוגייה מאובטחת
    const cookie = serialize('token', loginData.jwt, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'none',
      domain: '.onmotormedia.com',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    // שליחת מייל ברכה
    try {
      await sendEmail({
        to: email,
        subject: 'ברוך הבא ל־OnMotor Media',
        html: buildEmailTemplate(email, 'ברוך הבא ל־OnMotor Media', `
          <p>תודה שנרשמת לאתר <strong>OnMotor Media</strong>!</p>
          <p>שמחים שהצטרפת למשפחת הרוכבים שלנו 🏍️</p>
          <a href="https://onmotormedia.com/login" style="display:inline-block;margin-top:20px;background:#d32f2f;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;font-weight:bold;">כניסה לאתר</a>
        `)
      });
    } catch (err) {
      console.error('שליחת מייל נכשלה:', err);
    }

    return new Response(JSON.stringify({ success: true, user: loginData.user }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
    });

  } catch (err) {
    console.error('שגיאה כללית ברישום:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
