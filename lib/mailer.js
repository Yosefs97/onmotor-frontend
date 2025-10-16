// /lib/mailer.js
import nodemailer from "nodemailer";

export async function sendMail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // למשל smtp.gmail.com
    port: process.env.SMTP_PORT || 587,
    secure: false, // TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"OnMotor Media" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
