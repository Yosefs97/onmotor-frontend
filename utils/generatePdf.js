// utils/generatePdf.js
import pdf from 'html-pdf-node';

export async function generateReceiptPdf(orderNumber, customer, cartItems) {
  const total = cartItems.reduce((sum, item) => sum + (item.price?.amount || 0) * item.quantity, 0);
  const vat = (total - (total / 1.17)).toFixed(2);
  const subTotal = (total / 1.17).toFixed(2);
  const dateStr = new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const htmlContent = `
  <!DOCTYPE html>
  <html dir="rtl" lang="he">
  <head>
      <meta charset="utf-8">
      <title>קבלה - OnMotor</title>
      <style>
          @page { size: A4; margin: 20mm 15mm; background-color: #faf8f5; }
          body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; color: #2b2b2b; font-size: 11pt; line-height: 1.6; }
          *, *::before, *::after { box-sizing: border-box; }
          .header-table { width: 100%; border-bottom: 3px solid #d9534f; padding-bottom: 15px; margin-bottom: 25px; }
          .header-table td { vertical-align: bottom; }
          .title { font-size: 26pt; font-weight: bold; color: #1a1a1a; margin: 0; line-height: 1; }
          .subtitle { font-size: 12pt; color: #555; margin-top: 5px; }
          .receipt-info { text-align: left; }
          .receipt-number { font-size: 16pt; font-weight: bold; color: #d9534f; }
          .copy-type { font-size: 11pt; font-weight: bold; padding: 2px 10px; border: 1px solid #2b2b2b; display: inline-block; margin-top: 5px; border-radius: 3px; }
          .section-title { font-size: 13pt; font-weight: bold; margin-top: 25px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 12px; color: #d9534f; }
          .customer-details table { width: 100%; }
          .customer-details td { padding: 4px 0; font-size: 11pt; }
          .customer-details strong { display: inline-block; width: 100px; color: #555; }
          .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
          .data-table th, .data-table td { border: 1px solid #e0e0e0; padding: 10px 12px; text-align: right; }
          .data-table th { background-color: #2b2b2b; color: #ffffff; font-weight: bold; font-size: 10.5pt; }
          .data-table tr:nth-child(even) { background-color: #f5f5f5; }
          .summary-wrapper { width: 100%; }
          .summary-table { width: 45%; border-collapse: collapse; margin-right: auto; margin-left: 0; margin-top: 10px; }
          .summary-table th, .summary-table td { border: 1px solid #e0e0e0; padding: 8px 12px; text-align: right; }
          .summary-table th { background-color: #f0f0f0; color: #555; width: 60%; }
          .summary-total th, .summary-total td { font-weight: bold; background-color: #d9534f !important; color: white; font-size: 12pt; }
          .notes { margin-top: 40px; font-size: 9.5pt; color: #555; background-color: #f0f0f0; padding: 15px; border-radius: 4px; border-right: 4px solid #d9534f; }
          .digital-sig { text-align: center; margin-top: 50px; font-size: 10pt; font-weight: bold; color: #777; }
      </style>
  </head>
  <body>
      <table class="header-table">
          <tr>
              <td style="width: 50%;">
                  <h1 class="title">OnMotor Media</h1>
                  <div class="subtitle">אסף אפריים ויוסף סבג<br>אופקים</div>
              </td>
              <td class="receipt-info" style="width: 50%;">
                  <div class="receipt-number">קבלה מס' ${orderNumber.replace('#', '')}</div>
                  <div class="copy-type">מקור</div>
                  <div style="margin-top: 10px; font-size: 10.5pt; color: #555;">תאריך מסמך: ${dateStr}</div>
              </td>
          </tr>
      </table>

      <div class="section-title">פרטי הלקוח</div>
      <div class="customer-details">
          <table>
              <tr>
                  <td style="width: 50%;"><strong>לכבוד:</strong> ${customer.name}</td>
                  <td><strong>טלפון:</strong> ${customer.phone}</td>
              </tr>
              <tr>
                  <td colspan="2"><strong>כתובת:</strong> ${customer.address}</td>
              </tr>
          </table>
      </div>

      <div class="section-title">פירוט פריטים ושירותים</div>
      <table class="data-table">
          <thead>
              <tr>
                  <th>פירוט</th>
                  <th>כמות</th>
                  <th>מחיר יחידה</th>
                  <th>סה"כ</th>
              </tr>
          </thead>
          <tbody>
              ${cartItems.map(item => `
              <tr>
                  <td>${item.title}</td>
                  <td>${item.quantity}</td>
                  <td>₪${item.price?.amount || 0}</td>
                  <td>₪${((item.price?.amount || 0) * item.quantity).toFixed(2)}</td>
              </tr>
              `).join('')}
          </tbody>
      </table>

      <div class="summary-wrapper">
          <table class="summary-table">
              <tr>
                  <th>סכום ביניים</th>
                  <td>₪${subTotal}</td>
              </tr>
              <tr>
                  <th>מע"מ (17%)</th>
                  <td>₪${vat}</td>
              </tr>
              <tr class="summary-total">
                  <th>סה"כ לתשלום</th>
                  <td>₪${total}</td>
              </tr>
          </table>
      </div>
      
      <div style="clear: both;"></div>
      
      <div class="notes">
          <strong>הערות ותנאים:</strong><br>
          תקופת האחריות למוצר תעבורה תהיה עפ"י הנחיית היצרן ולא תפחת מ-3 חודשים או 6,000 ק"מ, לפי המוקדם.
      </div>
      
      <div class="digital-sig">
          מסמך ממוחשב זה חתום דיגיטלית באופן מאובטח.
      </div>
  </body>
  </html>
  `;

  const options = { format: 'A4', printBackground: true };
  const file = { content: htmlContent };
  
  return await pdf.generatePdf(file, options);
}