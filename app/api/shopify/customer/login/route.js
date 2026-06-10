// app/api/shopify/customer/login/route.js
import { NextResponse } from 'next/server';
import { customerAccessTokenCreate } from '@/lib/shopify/customer';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'נא להזין מייל וסיסמה' }, { status: 400 });
    }

    const data = await customerAccessTokenCreate(email, password);

    if (data?.customerUserErrors && data.customerUserErrors.length > 0) {
      return NextResponse.json({ error: data.customerUserErrors[0].message }, { status: 400 });
    }

    const accessToken = data?.customerAccessToken?.accessToken;
    const expiresAt = data?.customerAccessToken?.expiresAt;

    if (!accessToken) {
      return NextResponse.json({ error: 'פרטי התחברות שגויים' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    // שמירת ה-Token בתוך Cookie מאובטח
    response.cookies.set('shopify_customer_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(expiresAt),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login Route Error:', error);
    return NextResponse.json({ error: 'שגיאת שרת פנימית' }, { status: 500 });
  }
}