// app/api/shopify/customer/register/route.js
import { NextResponse } from 'next/server';
import { customerCreate } from '@/lib/shopify/customer';

export async function POST(request) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'נא למלא את כל שדות החובה' }, { status: 400 });
    }

    const data = await customerCreate(firstName, lastName, email, password);

    if (data?.customerUserErrors && data.customerUserErrors.length > 0) {
      return NextResponse.json({ error: data.customerUserErrors[0].message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Register Route Error:', error);
    return NextResponse.json({ error: 'שגיאת שרת פנימית' }, { status: 500 });
  }
}