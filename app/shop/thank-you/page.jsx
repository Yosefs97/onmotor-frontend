// app/shop/thank-you/page.jsx
"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <div dir="rtl" className="max-w-2xl mx-auto text-center py-20 px-4">
      <div className="bg-green-100 text-green-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
        ✓
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-4">תודה רבה על הזמנתך!</h1>
      <p className="text-lg text-gray-600 mb-2">
        הזמנה מספר <strong>#{orderNumber}</strong> התקבלה בהצלחה במערכת.
      </p>
      <p className="text-gray-600 mb-8">
        שלחנו אליך עותק של סיכום ההזמנה (PDF) לאימייל. ניצור איתך קשר בהקדם לתיאום המשלוח והשלמת התשלום.
      </p>
      <Link 
        href="/shop" 
        className="inline-block bg-[#e60000] text-white px-8 py-3 font-bold rounded-lg hover:bg-red-700 transition"
      >
        חזרה לחנות
      </Link>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div dir="rtl" className="text-center py-20 font-bold">טוען פרטי הזמנה...</div>}>
      <ThankYouContent />
    </Suspense>
  );
}