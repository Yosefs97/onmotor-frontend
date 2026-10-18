// app/api/send-receipt/route.js
import { sendMail } from "@/utils/mailer";
import { generateOfficialReceiptPdf } from "@/utils/generateOfficialReceiptPdf";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { receiptNumber, orderNumber, customer, items, paymentMethod } = body;

    if (!customer?.email || !items?.length || !receiptNumber) {
      return NextResponse.json({ error: "חסרים נתונים לשליחת הקבלה" }, { status: 400 });
    }

    // 1. יצירת ה-PDF של הקבלה
    let pdfBuffer = null;
    try {
      pdfBuffer = await generateOfficialReceiptPdf(receiptNumber, orderNumber, customer, items, paymentMethod);
    } catch (pdfErr) {
      console.error("❌ שגיאה ביצירת ה-PDF של הקבלה:", pdfErr);
      return NextResponse.json({ error: "שגיאה ביצירת מסמך ה-PDF" }, { status: 500 });
    }

    // 2. בניית גוף המייל (HTML פשוט ונקי)
    const emailHtml = `
      <div dir="rtl" style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #d9534f; text-align: center;">היי ${customer.name}, התשלום התקבל בהצלחה!</h2>
        <p style="font-size: 16px;">תודה רבה על הרכישה מ-OnMotor Parts.</p>
        <p style="font-size: 16px;">מצורפת למייל זה קבלה דיגיטלית רשמית (מספר ${receiptNumber}) עבור התשלום שביצעת (באמצעות ${paymentMethod}).</p>
        <p style="font-size: 16px;">נשמח לעמוד לשירותך תמיד,</p>
        <p style="font-size: 16px; font-weight: bold;">צוות OnMotor Parts</p>
      </div>
    `;

    // 3. שליחה ללקוח עם הקובץ מצורף
    const attachments = [{
      filename: `OnMotor_Receipt_${receiptNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }];

    await sendMail({
      to: customer.email,
      subject: `✅ קבלה מס' ${receiptNumber} מ-OnMotor Parts`,
      html: emailHtml,
      attachments
    });

    return NextResponse.json({ success: true, message: "הקבלה נשלחה בהצלחה ללקוח!" });
  } catch (err) {
    console.error("❌ שגיאה כללית בשליחת קבלה:", err);
    return NextResponse.json({ error: "מערכת המיילים קרסה: " + err.message }, { status: 500 });
  }
}