// /app/shop/checkout/page.jsx
"use client";
import { useState, useEffect } from "react";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [cartTotal, setCartTotal] = useState({ amount: 0, currencyCode: "ILS" });
  
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch("/api/shopify/cart/get");
        const json = await res.json();
        
        if (json.cart) {
          // שמירת רשימת המוצרים לתצוגה
          setCartItems(
            json.cart.lines?.edges.map((e) => ({
              id: e.node.id,
              title: e.node.merchandise.product.title,
              quantity: e.node.quantity,
              price: e.node.cost.totalAmount,
              variantId: e.node.merchandise.id,
            })) || []
          );
          
          // 🔥 התיקון הקריטי: שמירת הקישור המקורי לתשלום של שופיפיי
          setCheckoutUrl(json.cart.checkoutUrl);
          
          // שמירת הסכום הכולל
          if (json.cart.estimatedCost?.totalAmount) {
            setCartTotal(json.cart.estimatedCost.totalAmount);
          }
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };
    fetchCart();
  }, []);

  const handleOrder = async () => {
    setLoading(true);
    
    try {
      // 1. שליחת מיילים / שמירת פרטי הלקוח במסד הנתונים
      // עטוף ב-try-catch כדי שגם אם שרת המיילים נופל, הלקוח עדיין יופנה לתשלום
      try {
        await fetch("/api/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customer, cart: cartItems }),
        });
      } catch (emailError) {
        console.error("Error sending order email:", emailError);
      }

      // 2. מעבר ישיר ל-Checkout המקורי והתקין של שופיפיי
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        alert("שגיאה: העגלה ריקה או שלא נמצא קישור לתשלום.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("אירעה שגיאה במעבר לתשלום. אנא נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="max-w-2xl mx-auto space-y-6 px-4 pt-6">
      <h1 className="text-black text-2xl font-bold">סגירת הזמנה</h1>

      {/* פרטי הלקוח */}
      <div className="text-black space-y-3">
        {["name", "email", "phone", "address"].map((field) => (
          <input
            key={field}
            placeholder={
              field === "name" ? "שם מלא" : 
              field === "email" ? "אימייל" : 
              field === "phone" ? "טלפון" : 
              "כתובת מלאה למשלוח"
            }
            className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            value={customer[field]}
            onChange={(e) =>
              setCustomer({ ...customer, [field]: e.target.value })
            }
          />
        ))}
        <textarea
          placeholder="הערות להזמנה או לשליח (אופציונלי)"
          className="border border-gray-300 w-full p-3 rounded-lg h-24 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
          value={customer.notes}
          onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
        />
      </div>

      {/* פרטי עגלה */}
      <div className="border border-gray-200 p-5 rounded-lg bg-gray-50 shadow-sm">
        <h2 className="text-black font-bold mb-4 text-lg border-b pb-2">סיכום הזמנה</h2>
        
        <div className="space-y-3 mb-4">
          {cartItems.map((c, i) => (
            <div key={i} className="flex justify-between items-start text-sm text-gray-800">
              <span className="pe-4">
                {c.title} <span className="text-gray-500">x{c.quantity}</span>
              </span>
              <span className="font-semibold whitespace-nowrap">
                ₪{(c.price?.amount || 0) * c.quantity} {c.price?.currencyCode}
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center text-lg font-black text-red-600 border-t pt-3 mt-2">
          <span>סה"כ לתשלום:</span>
          <span>₪{cartTotal.amount} {cartTotal.currencyCode}</span>
        </div>
      </div>

      {/* כפתור תשלום */}
      <button
        onClick={handleOrder}
        disabled={loading || cartItems.length === 0}
        className="w-full bg-red-600 text-white px-6 py-4 rounded-xl hover:bg-red-700 transition-all shadow-md font-bold text-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>מעבד הזמנה...</span>
          </>
        ) : (
          "מעבר לתשלום מאובטח"
        )}
      </button>
    </div>
  );
}