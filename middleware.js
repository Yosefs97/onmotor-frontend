// middleware.js
import { NextResponse } from 'next/server';

// מגדירים שהחסימה תפעל רק על עמודים שמתחילים ב- /admin
export const config = {
  matcher: ['/admin/:path*'],
};

export function middleware(req) {
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    // מפענחים את שם המשתמש והסיסמה שהוקלדו
    const [user, pwd] = atob(authValue).split(':');

    // מושכים את הפרטים המורשים ממשתני הסביבה (או ברירת מחדל אם לא הוגדר)
    const validUser = process.env.ADMIN_USER || 'admin';
    const validPass = process.env.ADMIN_PASSWORD || 'onmotor2026';

    if (user === validUser && pwd === validPass) {
      return NextResponse.next(); // הכל תקין, תן לו להיכנס
    }
  }

  // אם אין סיסמה או שהיא שגויה, זורקים שגיאת 401 שמקפיצה את חלון ההתחברות
  return new NextResponse('Authentication Required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
    },
  });
}