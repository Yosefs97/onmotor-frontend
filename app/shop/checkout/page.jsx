// /app/shop/checkout/page.jsx
"use client";
import { useState, useEffect } from "react";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
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
      const res = await fetch("/api/shopify/cart/get");
      const json = await res.json();
      setCart(
        json.cart?.lines?.edges.map((e) => ({
          id: e.node.id,
          title: e.node.merchandise.product.title,
          quantity: e.node.quantity,
          price: e.node.cost.totalAmount,
          variantId: e.node.merchandise.id,
        })) || []
      );
    };
    fetchCart();
  }, []);

  const handleOrder = async () => {
    setLoading(true);
    // שליחת מיילים
    await fetch("/api/order", {
      method: "POST",
      body: JSON.stringify({ customer, cart }),
    });

    // יצירת Checkout ב-Shopify
    const res = await fetch("/api/shopify/checkout", {
      method: "POST",
      body: JSON.stringify({
        lines: cart.map((c) => ({
          quantity: c.quantity,
          merchandiseId: c.variantId,
        })),
      }),
    });
    const json = await res.json();
    setLoading(false);

    if (json.cart?.checkoutUrl) {
      window.location.href = json.cart.checkoutUrl;
    } else {
      alert("שגיאה ביצירת ההזמנה");
    }
  };

  return (
    <div dir="rtl" className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">סגירת הזמנה</h1>

      {/* פרטי הלקוח */}
      <div className="space-y-2">
        {["name", "email", "phone", "address"].map((field) => (
          <input
            key={field}
            placeholder={
              field === "name"
                ? "שם מלא"
                : field === "email"
                ? "אימייל"
                : field === "phone"
                ? "טלפון"
                : "כתובת"
            }
            className="border w-full p-2 rounded"
            value={customer[field]}
            onChange={(e) =>
              setCustomer({ ...customer, [field]: e.target.value })
            }
          />
        ))}
        <textarea
          placeholder="הערות"
          className="border w-full p-2 rounded"
          value={customer.notes}
          onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
        />
      </div>

      {/* פרטי עגלה */}
      <div className="border p-4 rounded bg-gray-50">
        <h2 className="font-bold mb-2">סיכום הזמנה</h2>
        {cart.map((c, i) => (
          <div key={i} className="flex justify-between text-sm py-1">
            <span>
              {c.title} ({c.quantity})
            </span>
            <span>
              ₪{(c.price?.amount || 0) * c.quantity} {c.price?.currencyCode}
            </span>
          </div>
        ))}
      </div>

      {/* כפתור תשלום */}
      <button
        onClick={handleOrder}
        disabled={loading}
        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
      >
        {loading ? "מעבד הזמנה..." : "לתשלום"}
      </button>
    </div>
  );
}
