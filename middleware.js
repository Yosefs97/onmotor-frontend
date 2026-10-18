// middleware.js
import { NextResponse } from 'next/server';

export const config = {
  // עדכנו את ה-matcher כך שיגן גם על /shop/admin וגם על /admin רגיל
  matcher: ['/admin/:path*', '/shop/admin/:path*'],
};

export function middleware(req) {
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // משיכת הנתונים המאובטחים מ-Vercel
    const validUser = process.env.ADMIN_USER;
    const validPass = process.env.ADMIN_PASSWORD;

    // מוודא שהמשתנים קיימים ושהמשתמש הקליד אותם נכון (ללא רווחים)
    if (validUser && validPass && user.trim() === validUser && pwd.trim() === validPass) {
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