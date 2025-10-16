// /app/api/contact-for-ad/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mailer';
import { buildEmailTemplate } from '@/components/utils/emailTemplate';

export async function POST(req) {
  try {
    const { name, phone, email, notes } = await req.json();

    // בדיקה בסיסית של שדות חובה
    if (!name || !phone || !email) {
      console.error('❌ חסרים שדות');
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    // --- מייל למנהל האתר ---
    const adminHtml = buildEmailTemplate(
      'צוות OnMotor Media',
      'פנייה חדשה לפרסום באתר',
      `
      <div dir="rtl" style="direction:rtl;text-align:right;">
        <p>נשלחה פנייה חדשה לפרסום באתר:</p>
        <ul style="list-style:none;padding:0;">
          <li><strong>שם:</strong> ${name}</li>
          <li><strong>טלפון:</strong> ${phone}</li>
          <li><strong>אימייל:</strong> ${email}</li>
          ${notes ? `<li><strong>פירוט נוסף:</strong> ${notes}</li>` : ''}
        </ul>
      </div>
      `
    );

    await sendMail({
      to: process.env.SITE_ADMIN_EMAIL || 'onmotormedia@gmail.com',
      subject: 'פנייה חדשה לפרסום באתר',
      html: adminHtml,
    });
    console.log('📤 נשלח מייל למנהל האתר בהצלחה.');

    // --- מייל חזרה למשתמש ---
    const userHtml = buildEmailTemplate(
      name,
      'פנייתך התקבלה',
      `
      <div dir="rtl" style="direction:rtl;text-align:right;">
        <p>נציג פרסום יצור איתך קשר בהקדם.</p>
        ${notes ? `<p><strong>פירוט נוסף:</strong> ${notes}</p>` : ''}
        <p>בברכה,<br/>OnMotor Media</p>
      </div>
      `
    );

    await sendMail({
      to: email,
      subject: 'פנייתך התקבלה - OnMotor Media',
      html: userHtml,
    });
    console.log('📤 נשלח מייל למשתמש בהצלחה.');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ שגיאה בשליחת מייל:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
