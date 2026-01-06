//C:\Users\yosef\onmotor-media - Copy\utils\emailTemplate.js
import fs from 'fs';
import path from 'path';

const socialIconsHtml = fs.readFileSync(
  path.join(process.cwd(), 'public', 'email-social-icons.html'),
  'utf-8'
);

export function buildEmailTemplate(email, title, contentHtml) {
  return `
<!DOCTYPE html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
        direction: rtl;
        text-align: center;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        direction: rtl;
        text-align: center;
      }
      .logo {
        margin-bottom: 20px;
      }
      .logo img {
        width: 180px;
      }
      h1 {
        color: #d32f2f;
        font-size: 22px;
        margin-bottom: 20px;
      }
      p {
        font-size: 16px;
        line-height: 1.6;
        color: #333333;
        margin: 10px 0;
      }
      .footer {
        margin-top: 40px;
        font-size: 13px;
        color: #888888;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo" dir="ltr">
        <img src="https://onmotormedia.com/full_Logo.jpg" alt="OnMotor Media" />
      </div>
      <h1>${title}</h1>
      <p>שלום ${email},</p>
      ${contentHtml}
      <hr style="margin: 30px 0;" />
      <p style="font-size:13px; color:#888888;">אם אינך מזהה את הפעולה הזו, פשוט התעלם מהמייל.</p>
      <div class="footer">
        OnMotor Media גם ברשתות החברתיות:
        <div style="margin-top:10px;">
          ${socialIconsHtml}
        </div>
      </div>
    </div>
  </body>
</html>
`;
}
