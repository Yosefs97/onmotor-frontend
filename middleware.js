// middleware.js
import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/admin/:path*'],
};

export function middleware(req) {
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // הגדרה קשיחה ובטוחה שעוקפת את המשתנים של Vercel זמנית
    const validUser = 'admin';
    const validPass = '123456';

    // נוודא שאין רווחים בטעות בהקלדה
    if (user.trim() === validUser && pwd.trim() === validPass) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Authentication Required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
    },
  });
}