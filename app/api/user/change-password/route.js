// app/api/user/change-password/route.js
import { getTokenFromCookie } from '@/utils/auth-server';
import { buildEmailTemplate } from '@/utils/emailTemplate';
import { sendEmail } from '@/utils/mailer';

const { STRAPI_API_URL } = process.env;

export async function POST(request) {
  try {
    const jwt = getTokenFromCookie(request);
    if (!jwt) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return new Response(JSON.stringify({ error: 'Password must contain uppercase, lowercase, and number' }), { status: 400 });
    }

    // 1. שליחת הבקשה ל-Strapi לשינוי סיסמה
    const res = await fetch(`${STRAPI_API_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        currentPassword,
        password: newPassword,
        passwordConfirmation: newPassword,
      }),
    });

    const data = await res.json();

    // 2. ❗ התיקון: טיפול בתגובה כושלת מ-Strapi (למשל, 400 בגלל Invalid credentials)
    if (!res.ok) {
      // אחזור הודעת השגיאה מתוך התגובה של Strapi
      const errorMessage = data?.error?.message || 'Error changing password';

      // החזרת הודעת השגיאה וקוד הסטטוס המקורי של Strapi (כגון 400) ללקוח.
      // זה מונע את קריסת הקוד ל-catch והחזרת 500 שגויה.
      return new Response(JSON.stringify({ error: errorMessage }), { status: res.status });
    }
    // 3. אם res.ok הוא true, ממשיכים לשליחת המייל

    // שליפת המשתמש המחובר
    const meRes = await fetch(`${STRAPI_API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const user = await meRes.json();

    // שליחת מייל אישור
    if (user?.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: 'הסיסמה שלך עודכנה בהצלחה - OnMotor Media',
          html: buildEmailTemplate(
            user.email,
            'הסיסמה שלך שונתה',
            `
              <p>הסיסמה שלך עודכנה בהצלחה במערכת <strong>OnMotor Media</strong>.</p>
              <p>אם לא אתה ביצעת את הפעולה הזו, צור איתנו קשר מיידית.</p>
            `
          ),
        });
      } catch (err) {
        console.warn('⚠️ שליחת מייל שינוי סיסמה נכשלה:', err.message);
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    // בלוק זה מטפל רק בשגיאות שאינן קשורות לתגובה מ-Strapi (למשל, שגיאת רשת, שגיאה בקריאת JSON).
    console.error('❌ Change-password error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), { status: 500 });
  }
}