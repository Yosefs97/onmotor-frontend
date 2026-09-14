// app/shop/checkout/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState({ amount: 0, currencyCode: "₪" });
  const router = useRouter();
  
  // פיצול הכתובת לשדות נפרדים
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    street: "",
    house: "",
    apartment: "",
    notes: "",
  });
  
  // רשימות להשלמה אוטומטית מהמאגר הממשלתי
  const [citiesList, setCitiesList] = useState([]);
  const [streetsList, setStreetsList] = useState([]);
  
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
            // אם יש לו כתובת שמורה, ננסה לשים את העיר מראש
            city: defaultAddr?.city || "",
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

  // --- פונקציות חיפוש מול המאגר הממשלתי (data.gov.il) --- //
  
  const handleCityChange = async (e) => {
    const val = e.target.value;
    // איפוס רחוב כשמחליפים עיר
    setCustomer(prev => ({ ...prev, city: val, street: '' }));
    
    // חיפוש רק אם הוקלדו לפחות 2 אותיות
    if (val.length < 2) {
        setCitiesList([]);
        return;
    }
    
    try {
        const res = await fetch(`https://data.gov.il/api/3/action/datastore_search?resource_id=5c78e9fa-c2e2-4771-93ff-7f400a12f7ba&q=${val}&limit=15`);
        const data = await res.json();
        // משיכת שם היישוב וסינון כפילויות או "לא רשום"
        const results = data.result.records.map(r => r['שם_ישוב'].trim()).filter(c => c !== 'לא רשום');
        setCitiesList([...new Set(results)]);
    } catch(err) {
        console.error("שגיאה במשיכת ערים:", err);
    }
  };

  const handleStreetChange = async (e) => {
    const val = e.target.value;
    setCustomer(prev => ({ ...prev, street: val }));
    
    if (val.length < 2 || !customer.city) {
        setStreetsList([]);
        return;
    }
    
    try {
        // חיפוש שמשלב את העיר והרחוב כדי למצוא תוצאות מדויקות
        const res = await fetch(`https://data.gov.il/api/3/action/datastore_search?resource_id=a7296d1a-f8c9-4b70-96c2-6ebb4352f8e3&q=${customer.city} ${val}&limit=15`);
        const data = await res.json();
        const results = data.result.records.map(r => r['שם_רחוב'].trim());
        setStreetsList([...new Set(results)]);
    } catch(err) {
        console.error("שגיאה במשיכת רחובות:", err);
    }
  };

  // --- סיום הזמנה --- //

  const handleOrder = async () => {
    if (!customer.name || !customer.email || !customer.phone || !customer.city || !customer.street || !customer.house) {
        alert("נא למלא את כל שדות החובה (שם, אימייל, טלפון, עיר, רחוב ומספר בית).");
        return;
    }

    setLoading(true);
    
    const fullAddress = `${customer.street} ${customer.house}${customer.apartment ? ', דירה ' + customer.apartment : ''}, ${customer.city}`;
    const payloadCustomer = { ...customer, address: fullAddress };

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: payloadCustomer, cart: cartItems }),
      });
      
      const data = await res.json();

      if (data.success) {
        // 1. מחיקת עוגיית שופיפיי (לגיבוי)
        document.cookie = "cartId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // 2. התיקון הקריטי: מחיקת העגלה מה-LocalStorage של CartContext!
        localStorage.removeItem("cart");
        
        // 3. איפוס ממשק
        setCartItems([]);
        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new Event('storage')); // מעדכן את הקונטקסט מיד
        
        // 4. מעבר עמוד קשיח
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
        {/* פרטים אישיים */}
        <input
            placeholder="שם מלא *"
            className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
                placeholder="אימייל *"
                type="email"
                className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            />
            <input
                placeholder="טלפון *"
                type="tel"
                className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            />
        </div>

        {/* --- אזור הכתובת החדש --- */}
        <div className="grid grid-cols-2 gap-3 mt-4">
            
            {/* עיר עם חיפוש מובנה */}
            <div className="col-span-2 sm:col-span-1">
                <input
                    list="cities-list"
                    placeholder="עיר / יישוב *"
                    autoComplete="off"
                    className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    value={customer.city}
                    onChange={handleCityChange}
                />
                <datalist id="cities-list">
                    {citiesList.map((c, i) => <option key={i} value={c} />)}
                </datalist>
            </div>

            {/* רחוב עם חיפוש מובנה */}
            <div className="col-span-2 sm:col-span-1">
                <input
                    list="streets-list"
                    placeholder="רחוב *"
                    autoComplete="off"
                    disabled={!customer.city}
                    className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={customer.street}
                    onChange={handleStreetChange}
                />
                <datalist id="streets-list">
                    {streetsList.map((s, i) => <option key={i} value={s} />)}
                </datalist>
            </div>

            {/* מספר בית ודירה */}
            <div className="col-span-1">
                <input
                    placeholder="מספר בית *"
                    className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    value={customer.house}
                    onChange={(e) => setCustomer({ ...customer, house: e.target.value })}
                />
            </div>
            <div className="col-span-1">
                <input
                    placeholder="דירה (אופציונלי)"
                    className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    value={customer.apartment}
                    onChange={(e) => setCustomer({ ...customer, apartment: e.target.value })}
                />
            </div>
        </div>
        {/* --- סוף אזור הכתובת --- */}

        <textarea
          placeholder="הערות להזמנה או לשליח (אופציונלי)"
          className="border border-gray-300 w-full p-3 rounded-lg h-24 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all mt-2"
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