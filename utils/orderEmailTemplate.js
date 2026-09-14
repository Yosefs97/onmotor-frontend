// utils/orderEmailTemplate.js
import { buildEmailTemplate } from "./emailTemplate.js";

export function buildOrderEmail(customer, cart, orderNumber) {
  const total = cart.reduce(
    (sum, item) => sum + (item.price?.amount || 0) * item.quantity,
    0
  );

  const itemsHtml = `
    <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr style="background:#f4f4f4; text-align:right;">
          <th style="padding:8px; border:1px solid #ddd;">מוצר</th>
          <th style="padding:8px; border:1px solid #ddd;">כמות</th>
          <th style="padding:8px; border:1px solid #ddd;">מחיר</th>
        </tr>
      </thead>
      <tbody>
        ${cart
          .map(
            (i) => `
          <tr>
            <td style="padding:8px; border:1px solid #ddd;">${i.title}</td>
            <td style="padding:8px; border:1px solid #ddd;">${i.quantity}</td>
            <td style="padding:8px; border:1px solid #ddd;">₪${i.price?.amount || 0}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
      <tfoot>
        <tr style="background:#f9f9f9;">
          <td colspan="2" style="padding:8px; border:1px solid #ddd; text-align:left; font-weight:bold;">סה״כ</td>
          <td style="padding:8px; border:1px solid #ddd; font-weight:bold;">₪${total}</td>
        </tr>
      </tfoot>
    </table>
  `;

  const customerHtml = `
    <div style="margin-top:20px; text-align:right;">
      <p><b>שם:</b> ${customer.name}</p>
      <p><b>טלפון:</b> ${customer.phone}</p>
      <p><b>אימייל:</b> ${customer.email}</p>
      <p><b>כתובת:</b> ${customer.address}</p>
      ${customer.notes ? `<p><b>הערות:</b> ${customer.notes}</p>` : ""}
    </div>
  `;

  return buildEmailTemplate(
    customer.name,
    `✅ הזמנתך התקבלה – ${orderNumber} – OnMotor Parts`,
    `
      <p>חשבון מייל: ${customer.email},</p>
      <p>תודה על הזמנתך! מספר ההזמנה שלך הוא <strong>${orderNumber}</strong>.</p>
      <p>מצורף למייל זה סיכום ההזמנה שלך (PDF).</p>
      <p>להלן פרטי ההזמנה:</p>
      ${itemsHtml}
      ${customerHtml}
      <p style="margin-top:20px; font-size:14px; color:#666;">ניצור איתך קשר בהקדם להשלמת התשלום ולתיאום המשלוח 🚚</p>
    `
  );
}