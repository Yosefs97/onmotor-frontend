// /app/api/order/route.js
import { sendMail } from "@/lib/mailer";
import { buildOrderEmail } from "@/utils/orderEmailTemplate";

export async function POST(req) {
  try {
    const body = await req.json();
    const { customer, cart } = body;

    if (!customer?.email || !cart?.length) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const html = buildOrderEmail(customer, cart);

    // ללקוח
    await sendMail({
      to: customer.email,
      subject: "✅ הזמנתך התקבלה – OnMotor Parts",
      html,
    });

    // למנהל החנות
    if (process.env.ADMIN_EMAIL) {
      await sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: `📦 הזמנה חדשה – ${customer.name}`,
        html,
      });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("❌ שגיאת מייל:", err);
    return Response.json({ error: "Mail error" }, { status: 500 });
  }
}
