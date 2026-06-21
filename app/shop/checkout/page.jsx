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
  const [isFetchingCart, setIsFetchingCart] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        // 🔥 התיקון: הוספת פרמטר זמן והדרים שמבטלים לחלוטין את ה-Cache
        const timestamp = new Date().getTime();
        const res = await fetch(`/api/shopify/cart/get?_t=${timestamp}`, { 
            cache: "no-store",
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        });
        
        const json = await res.json();
        
        if (json.cart) {
          setCartItems(
            json.cart.lines?.edges.map((e) => ({
              id: e.node.id,
              title: e.node.merchandise.product.title,
              quantity: e.node.quantity,
              price: e.node.cost.totalAmount,
              variantId: e.node.merchandise.id,
            })) || []
          );
          
          setCheckoutUrl(json.cart.checkoutUrl);
          
          if (json.cart.estimatedCost?.totalAmount) {
            setCartTotal(json.cart.estimatedCost.totalAmount);
          }
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setIsFetchingCart(false);
      }
    };
    fetchCart();
  }, []);

  const handleOrder = async () => {
    setLoading(true);
    
    try {
      try {
        await fetch("/api/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customer, cart: cartItems }),
        });
      } catch (emailError) {
        console.error("Error sending order email:", emailError);
      }

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

  // תצוגת טעינה מונעת הופעה של "עגלה ריקה" לשבריר שנייה
  if (isFetchingCart) {
    return (
      <div dir="rtl" className="max-w-2xl mx-auto space-y-6 px-4 pt-10 text-center">
        <svg className="animate-spin h-10 w-10 text-red-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <h2 className="text-xl font-bold text-gray-800">מושך את נתוני העגלה...</h2>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-2xl mx-auto space-y-6 px-4 pt-6 pb-20">
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
        
        {cartItems.length === 0 ? (
          <div className="text-gray-500 py-2">העגלה שלך ריקה.</div>
        ) : (
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
        )}
        
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