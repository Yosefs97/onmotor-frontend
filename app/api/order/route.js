// /app/api/order/route.js
import { sendMail } from "@/utils/mailer";
import { buildOrderEmail } from "@/utils/orderEmailTemplate";
import { createShopifyOrder } from "@/lib/shopifyAdmin";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const body = await req.json();
    const { customer, cart } = body;

    console.log("📥 נתוני הזמנה התקבלו בשרת:", { customer, cartLength: cart?.length });

    if (!customer?.email || !cart?.length) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. יצירת ההזמנה בשופיפיי (Admin API)
    let orderNumber;
    try {
      orderNumber = await createShopifyOrder(customer, cart);
      console.log("✅ הזמנה נוצרה בשופיפיי בהצלחה:", orderNumber);
    } catch (shopifyErr) {
      console.error("❌ שגיאה ביצירת הזמנה בשופיפיי:", shopifyErr.message);
      return Response.json({ error: "Shopify Error: " + shopifyErr.message }, { status: 500 });
    }

    // 2. בניית המייל המעוצב בעברית מלאה
    const html = buildOrderEmail(customer, cart, orderNumber);

    // 3. שליחת מייל ללקוח
    try {
      await sendMail({
        to: customer.email,
        subject: `✅ הזמנתך התקבלה – ${orderNumber} – OnMotor Parts`,
        html
      });
      console.log("📧 מייל נשלח בהצלחה ללקוח:", customer.email);
    } catch (mailErr) {
      console.error("❌ שגיאה בשליחת מייל ללקוח:", mailErr);
    }

    // 4. שליחת מייל למנהל החנות
    if (process.env.ADMIN_EMAIL) {
      try {
        await sendMail({
          to: process.env.ADMIN_EMAIL,
          subject: `📦 הזמנה חדשה ${orderNumber} – ${customer.name}`,
          html
        });
        console.log("📧 מייל ניהול נשלח בהצלחה למנהל:", process.env.ADMIN_EMAIL);
      } catch (adminMailErr) {
        console.error("❌ שגיאה בשליחת מייל למנהל:", adminMailErr);
      }
    }

    // 5. מחיקת מזהה העגלה כדי לאפס את העגלה בצד הלקוח
    try {
      cookies().delete('cartId');
    } catch (cookieErr) {
      console.error("⚠️ אזהרה במחיקת עוגיית עגלה:", cookieErr);
    }

    return Response.json({ success: true, orderNumber });
  } catch (err) {
    console.error("❌ שגיאת מערכת כללית בהזמנה:", err);
    return Response.json({ error: "Order processing failed: " + err.message }, { status: 500 });
  }
}