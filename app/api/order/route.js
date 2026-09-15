// app/api/order/route.js
import { sendMail } from "@/utils/mailer";
import { buildOrderEmail } from "@/utils/orderEmailTemplate";
import { createShopifyOrder } from "@/lib/shopifyAdmin";
import { generateReceiptPdf } from "@/utils/generatePdf";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { customer, cart } = body;

    console.log("📥 נתוני הזמנה התקבלו בשרת:", { customer, cartLength: cart?.length });

    if (!customer?.email || !cart?.length) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. יצירת ההזמנה בשופיפיי
    let orderNumber;
    try {
      orderNumber = await createShopifyOrder(customer, cart);
    } catch (shopifyErr) {
      console.error("❌ שגיאה ביצירת הזמנה בשופיפיי:", shopifyErr.message);
      return NextResponse.json({ error: "Shopify Error: " + shopifyErr.message }, { status: 500 });
    }

    // 2. יצירת ה-PDF עם תפיסת השגיאה!
    let pdfBuffer = null;
    let attachments = [];
    let pdfDebugError = null; // משתנה שומר את השגיאה

    try {
      pdfBuffer = await generateReceiptPdf(orderNumber, customer, cart);
      attachments = [{
        filename: `OnMotor_Order_${orderNumber.replace('#', '')}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }];
    } catch (pdfErr) {
      console.error("❌ שגיאה ביצירת ה-PDF:", pdfErr);
      pdfDebugError = pdfErr.message || String(pdfErr); // שומרים את הטקסט המדויק של השגיאה
    }

    // 3. בניית המיילים המעוצבים (לקוח מול מנהל)
    const customerHtml = buildOrderEmail(customer, cart, orderNumber);
    let adminHtml = customerHtml;

    // אם הייתה שגיאה ב-PDF, נזריק אותה לתחתית המייל של מנהל החנות בלבד!
    if (pdfDebugError) {
      adminHtml += `
      <div dir="ltr" style="margin-top: 40px; padding: 20px; background-color: #ffefef; border: 2px solid #ff4444; border-radius: 8px; font-family: monospace;">
        <h3 style="color: #ff4444; margin-top: 0;">⚠️ Developer Debug: PDF Generation Failed</h3>
        <p style="color: #333;">The server encountered this exact error while generating the PDF:</p>
        <pre style="background: #fff; padding: 10px; overflow-x: auto; color: #000; border: 1px solid #ddd;">${pdfDebugError}</pre>
      </div>`;
    }

    // 4. שליחת מייל ללקוח (נקי לחלוטין)
    try {
      await sendMail({
        to: customer.email,
        subject: `✅ הזמנתך התקבלה – ${orderNumber} – OnMotor Parts`,
        html: customerHtml,
        attachments
      });
    } catch (mailErr) {
      console.error("❌ שגיאה בשליחת מייל ללקוח:", mailErr);
    }

    // 5. שליחת מייל למנהל החנות (כולל קופסת השגיאה אם קיימת)
    if (process.env.ADMIN_EMAIL) {
      try {
        await sendMail({
          to: process.env.ADMIN_EMAIL,
          subject: `📦 הזמנה חדשה ${orderNumber} – ${customer.name}`,
          html: adminHtml,
          attachments // אם ה-PDF נוצר, הוא יצורף. אם לא, יצורף מערך ריק.
        });
      } catch (adminMailErr) {
        console.error("❌ שגיאה בשליחת מייל למנהל:", adminMailErr);
      }
    }

    // 6. הריגת העגלה באגרסיביות
    const response = NextResponse.json({ success: true, orderNumber });
    
    response.cookies.set({
      name: 'cartId',
      value: '',
      maxAge: 0,
      path: '/',
      expires: new Date(0)
    });

    return response;
  } catch (err) {
    console.error("❌ שגיאת מערכת כללית בהזמנה:", err);
    return NextResponse.json({ error: "Order processing failed: " + err.message }, { status: 500 });
  }
}