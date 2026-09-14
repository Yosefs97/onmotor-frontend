// app/api/order/route.js
import { sendMail } from "@/utils/mailer";
import { buildOrderEmail } from "@/utils/orderEmailTemplate";
import { createShopifyOrder } from "@/lib/shopifyAdmin";
import { generateReceiptPdf } from "@/utils/generatePdf";
import { NextResponse } from "next/server"; // הוספנו את זה!

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
      console.log("✅ הזמנה נוצרה בשופיפיי בהצלחה:", orderNumber);
    } catch (shopifyErr) {
      console.error("❌ שגיאה ביצירת הזמנה בשופיפיי:", shopifyErr.message);
      return NextResponse.json({ error: "Shopify Error: " + shopifyErr.message }, { status: 500 });
    }

    // 2. יצירת ה-PDF
    let pdfBuffer = null;
    let attachments = [];
    try {
      pdfBuffer = await generateReceiptPdf(orderNumber, customer, cart);
      attachments = [{
        filename: `OnMotor_Order_${orderNumber.replace('#', '')}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }];
    } catch (pdfErr) {
      console.error("❌ שגיאה ביצירת ה-PDF (המייל ישלח ללא הקובץ):", pdfErr);
    }

    // 3. בניית המייל המעוצב
    const html = buildOrderEmail(customer, cart, orderNumber);

    // 4. שליחת מייל ללקוח
    try {
      await sendMail({
        to: customer.email,
        subject: `✅ הזמנתך התקבלה – ${orderNumber} – OnMotor Parts`,
        html,
        attachments
      });
    } catch (mailErr) {
      console.error("❌ שגיאה בשליחת מייל ללקוח:", mailErr);
    }

    // 5. שליחת מייל למנהל החנות
    if (process.env.ADMIN_EMAIL) {
      try {
        await sendMail({
          to: process.env.ADMIN_EMAIL,
          subject: `📦 הזמנה חדשה ${orderNumber} – ${customer.name}`,
          html,
          attachments
        });
      } catch (adminMailErr) {
        console.error("❌ שגיאה בשליחת מייל למנהל:", adminMailErr);
      }
    }

    // 6. הריגת העגלה באגרסיביות דרך NextResponse
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