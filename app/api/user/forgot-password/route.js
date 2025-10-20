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

    // חיפוש המשתמש
    const res = await fetch(`${STRAPI_API_URL}/api/users?filters[email][$eq]=${email}`, {
      headers: { Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}` },
    });

    const data = await res.json();
    const user = data?.data?.[0] ?? data?.[0];
    const userId = user?.id;

    // כדי למנוע חשיפת אימיילים, נחזיר תשובה כללית
    if (!userId) {
      console.warn(`⚠️ Password reset requested for unknown email: ${email}`);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // יצירת סיסמה זמנית
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const tempPassword = Array.from({ length: 10 })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('');

    // עדכון הסיסמה ב־Strapi
    await fetch(`${STRAPI_API_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({ password: tempPassword }),
    });

    // שליחת מייל
    const html = `
      <p>התקבלה בקשה לאיפוס סיסמה לאתר <strong>OnMotor Media</strong>.</p>
      <p>הנה הסיסמה הזמנית שלך:</p>
      <p style="font-size:20px;font-weight:bold;color:#e60000;">${tempPassword}</p>
      <p>אנא התחבר והחלף אותה לסיסמה אישית בהקדם.</p>
      <a href="https://onmotormedia.com/login" style="display:inline-block;margin-top:15px;background:#e60000;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">כניסה לאתר</a>
    `;

    await sendEmail({
      to: email,
      subject: 'איפוס סיסמה - OnMotor Media',
      html: buildEmailTemplate(email, 'איפוס סיסמה', html),
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('❌ Forgot-password error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), { status: 500 });
  }
}
