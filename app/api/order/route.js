// app/api/order/route.js
import { sendMail } from "@/utils/mailer";
import { buildOrderEmail } from "@/utils/orderEmailTemplate";
import { createShopifyOrder } from "@/lib/shopifyAdmin";
import { generateReceiptPdf } from "@/utils/generatePdf";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const body = await req.json();
    const { customer, cart } = body;

    if (!customer?.email || !cart?.length) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. יצירת ההזמנה בשופיפיי (Admin API)
    const orderNumber = await createShopifyOrder(customer, cart);

    // 2. יצירת קובץ ה-PDF בזיכרון השרת
    const pdfBuffer = await generateReceiptPdf(orderNumber, customer, cart);

    // 3. בניית המייל עם ה-PDF המצורף
    const html = buildOrderEmail(customer, cart, orderNumber);
    const attachments = [{
      filename: `OnMotor_Order_${orderNumber.replace('#', '')}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }];

    // 4. שליחת מייל ללקוח
    await sendMail({
      to: customer.email,
      subject: `✅ הזמנתך התקבלה – ${orderNumber} – OnMotor Parts`,
      html,
      attachments
    });

    // 5. שליחת מייל למנהל החנות
    if (process.env.ADMIN_EMAIL) {
      await sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: `📦 הזמנה חדשה ${orderNumber} – ${customer.name}`,
        html,
        attachments
      });
    }

    // 6. מחיקת מזהה העגלה כדי לאפס את העגלה בצד הלקוח
    cookies().delete('cartId');

    return Response.json({ success: true, orderNumber });
  } catch (err) {
    console.error("❌ שגיאת מערכת בהזמנה:", err);
    return Response.json({ error: "Order processing failed: " + err.message }, { status: 500 });
  }
}