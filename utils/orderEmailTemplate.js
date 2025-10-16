// /utils/orderEmailTemplate.js
import { buildEmailTemplate } from "./emailTemplate.js";

export function buildOrderEmail(customer, cart) {
  const total = cart.reduce(
    (sum, item) => sum + item.price.amount * item.quantity,
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
            <td style="padding:8px; border:1px solid #ddd;">₪${i.price.amount}</td>
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
    "✅ הזמנתך התקבלה – OnMotor Parts",
    `
      <p>שלום ${customer.name},</p>
      <p>תודה על הזמנתך! להלן פרטי ההזמנה:</p>
      ${itemsHtml}
      ${customerHtml}
      <p style="margin-top:20px; font-size:14px; color:#666;">נעדכן אותך ברגע שהמשלוח בדרך 🚚</p>
    `
  );
}
