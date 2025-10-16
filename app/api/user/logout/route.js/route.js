// app/api/user/logout/route.js
import { serialize } from 'cookie';

export async function POST() {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookie = serialize('token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 ימים

  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie,
    },
  });
}
console.log('נשלחה עוגייה למחיקה:', cookie);
