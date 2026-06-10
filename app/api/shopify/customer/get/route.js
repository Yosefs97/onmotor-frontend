// app/api/shopify/customer/get/route.js
import { NextResponse } from 'next/server';
import { getCustomer } from '@/lib/shopify/customer';

export async function GET(request) {
  try {
    const token = request.cookies.get('shopify_customer_token')?.value;

    if (!token) {
      return NextResponse.json({ isLoggedIn: false, customer: null });
    }

    const customerData = await getCustomer(token);

    if (!customerData) {
      // אם הטוקן לא תקף יותר בשופיפיי, ננקה את ה-Cookie
      const response = NextResponse.json({ isLoggedIn: false, customer: null });
      response.cookies.set('shopify_customer_token', '', { httpOnly: true, expires: new Date(0), path: '/' });
      return response;
    }

    return NextResponse.json({ isLoggedIn: true, customer: customerData });
  } catch (error) {
    console.error('Get Customer Route Error:', error);
    return NextResponse.json({ error: 'שגיאת שרת פנימית' }, { status: 500 });
  }
}