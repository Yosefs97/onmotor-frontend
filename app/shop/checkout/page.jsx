// app/shop/checkout/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState({ amount: 0, currencyCode: "₪" });
  const router = useRouter();
  
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
    const fetchCustomer = async () => {
      try {
        const res = await fetch('/api/shopify/customer/get');
        const json = await res.json();
        
        if (json.isLoggedIn && json.customer) {
          const cust = json.customer;
          const defaultAddr = cust.defaultAddress;
          
          setCustomer(prev => ({
            ...prev,
            name: `${cust.firstName || ''} ${cust.lastName || ''}`.trim(),
            email: cust.email || "",
            phone: cust.phone || "",
            address: defaultAddr 
              ? `${defaultAddr.address1 || ''}, ${defaultAddr.city || ''}`.trim() 
              : "",
          }));
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
      }
    };

    const fetchCart = async () => {
      try {
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
        
        if (json.cart && json.cart.lines?.edges.length > 0) {
          setCartItems(
            json.cart.lines.edges.map((e) => ({
              id: e.node.id,
              title: e.node.merchandise.product.title,
              quantity: e.node.quantity,
              // משיכת מחיר היחידה הספציפי שביקשנו משופיפיי
              price: e.node.cost?.amountPerQuantity || { amount: 0, currencyCode: 'ILS' },
              variantId: e.node.merchandise.id,
            })) || []
          );
          
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

    fetchCustomer();
    fetchCart();
  }, []);

  const handleOrder = async () => {
    if (!customer.name || !customer.email || !customer.phone || !customer.address) {
        alert("נא למלא את כל שדות החובה (שם, אימייל, טלפון, כתובת).");
        return;
    }

    setLoading(true);
    
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, cart: cartItems }),
      });
      
      const data = await res.json();

      if (data.success) {
        // 1. ניסיון מחיקה מקומית של העוגייה (לגיבוי)
        document.cookie = "cartId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // 2. איפוס הסטייט המקומי באותו רגע
        setCartItems([]);
        window.dispatchEvent(new Event('cartUpdated'));
        
        // 3. הפתרון המוחלט: מעבר עמוד קשיח! 
        // מרוקן את הזיכרון של Next.js וטוען את עמוד התודה מאפס בלי העגלה
        window.location.href = `/shop/thank-you?order=${data.orderNumber.replace('#', '')}`;
      } else {
        alert("שגיאה ביצירת ההזמנה: " + (data.error || "נסה שוב מאוחר יותר"));
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("אירעה שגיאה. אנא נסה שוב.");
      setLoading(false);
    }
  };

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

      <div className="text-black space-y-3">
        {["name", "email", "phone", "address"].map((field) => (
          <input
            key={field}
            placeholder={
              field === "name" ? "שם מלא *" : 
              field === "email" ? "אימייל *" : 
              field === "phone" ? "טלפון *" : 
              "כתובת מלאה למשלוח *"
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
                  ₪{((c.price?.amount || 0) * c.quantity).toFixed(2)} {c.price?.currencyCode || "ILS"}
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

      <button
        onClick={handleOrder}
        disabled={loading || cartItems.length === 0}
        className="w-full bg-red-600 text-white px-6 py-4 rounded-xl hover:bg-red-700 transition-all shadow-md font-bold text-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>שולח הזמנה...</span>
          </>
        ) : (
          "סיום הזמנה (ללא חיוב מיידי)"
        )}
      </button>
    </div>
  );
}