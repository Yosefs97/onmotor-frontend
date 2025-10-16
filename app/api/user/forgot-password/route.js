// app/api/user/forgot-password/route.js
import { buildEmailTemplate } from '@/utils/emailTemplate';
import { sendEmail } from '@/utils/mailer';

const { STRAPI_API_URL, STRAPI_ADMIN_TOKEN } = process.env;

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return new Response(JSON.stringify({ error: 'Missing email' }), { status: 400 });
    }

    // שלב 1: חיפוש המשתמש לפי אימייל
    const res = await fetch(`${STRAPI_API_URL}/api/users?filters[email][$eq]=${email}`, {
      headers: {
        Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}`,
      },
    });

    const data = await res.json();
    const user = data?.data?.[0] ?? data?.[0];
    const userId = user?.id ?? user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Email not found' }), { status: 404 });
    }

    // שלב 2: יצירת סיסמה זמנית
    const generateStrongPassword = (length = 10) => {
      const lower = 'abcdefghijklmnopqrstuvwxyz';
      const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';
      const all = lower + upper + numbers;

      let password = '';
      password += lower[Math.floor(Math.random() * lower.length)];
      password += upper[Math.floor(Math.random() * upper.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];

      for (let i = 3; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)];
      }

      return password
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
    };

    const tempPassword = generateStrongPassword();

    // שלב 3: עדכון הסיסמה
    await fetch(`${STRAPI_API_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({ password: tempPassword }),
    });

    // שלב 4: שליחת מייל
    const htmlContent = `
      <p>בקשת לאפס את הסיסמה שלך באתר <strong>OnMotor Media</strong>.</p>
      <p>הנה הסיסמה הזמנית החדשה שלך:</p>
      <p style="font-size:18px; font-weight:bold; color:#d32f2f;">${tempPassword}</p>
      <p>נא להתחבר ולהחליף לסיסמה קבועה בהקדם.</p>
      <a href="https://onmotormedia.com/login" style="
        display:inline-block;
        margin-top:20px;
        background:#d32f2f;
        color:white;
        padding:10px 20px;
        text-decoration:none;
        border-radius:5px;
        font-weight:bold;">כניסה לאתר</a>
    `;

    await sendEmail({
      to: email,
      subject: 'איפוס סיסמה - OnMotor Media',
      html: buildEmailTemplate(email, 'איפוס סיסמה', htmlContent),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Forgot-password error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
