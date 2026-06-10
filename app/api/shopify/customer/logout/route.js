// app/api/shopify/customer/logout/route.js
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // מחיקת ה-Cookie על ידי קביעת תוקף פג
  response.cookies.set('shopify_customer_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}