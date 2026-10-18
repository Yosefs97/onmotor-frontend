"use client";
import { useState } from "react";

export default function AdminReceiptPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    receiptNumber: "",
    orderNumber: "",
    paymentMethod: "ביט",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
  });

  const [items, setItems] = useState([{ title: "", quantity: 1, price: "" }]);

  const handleAddItem = () => {
    setItems([...items, { title: "", quantity: 1, price: "" }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // הפונקציה החדשה להסרת שורת פריט
  const handleRemoveItem = (indexToRemove) => {
    // לא נאפשר למחוק אם יש רק שורה אחת בטופס
    if (items.length === 1) return;
    setItems(items.filter((_, index) => index !== indexToRemove));
  };

  const handleSend = async () => {
    if (!formData.receiptNumber || !formData.customerEmail || !items[0].title || !items[0].price) {
      alert("נא למלא לפחות מספר קבלה, מייל לקוח, ופריט אחד עם מחיר.");
      return;
    }

    setLoading(true);

    const payload = {
      receiptNumber: formData.receiptNumber,
      orderNumber: formData.orderNumber,
      paymentMethod: formData.paymentMethod,
      customer: {
        name: formData.customerName,
        email: formData.customerEmail,
        phone: formData.customerPhone,
        address: formData.customerAddress,
      },
      items: items.map(item => ({
        ...item,
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0
      }))
    };

    try {
      const res = await fetch("/api/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        alert("🎉 הקבלה נשלחה בהצלחה ללקוח!");
        setFormData({ ...formData, receiptNumber: "", orderNumber: "" });
        setItems([{ title: "", quantity: 1, price: "" }]); // איפוס גם של שורות הפריטים
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      alert("שגיאת רשת בשליחה.");
    }
    setLoading(false);
  };

  return (
    <div dir="rtl" className="max-w-3xl mx-auto p-6 bg-white shadow-lg mt-10 rounded-xl text-black">
      <h1 className="text-2xl font-bold text-red-600 mb-6 border-b pb-2">מערכת הפקת קבלות - OnMotor Parts</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <input placeholder="מספר קבלה *" className="border p-2 rounded" value={formData.receiptNumber} onChange={e => setFormData({...formData, receiptNumber: e.target.value})} />
        <input placeholder="עבור הזמנה מס' (אופציונלי)" className="border p-2 rounded" value={formData.orderNumber} onChange={e => setFormData({...formData, orderNumber: e.target.value})} />
        <select className="border p-2 rounded col-span-2" value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
          <option value="ביט">ביט</option>
          <option value="פייבוקס">פייבוקס</option>
          <option value="כרטיס אשראי טלפוני">כרטיס אשראי טלפוני</option>
          <option value="העברה בנקאית">העברה בנקאית</option>
          <option value="מזומן">מזומן</option>
        </select>
      </div>

      <h2 className="font-bold mb-3 text-gray-700">פרטי לקוח</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <input placeholder="שם מלא *" className="border p-2 rounded" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
        <input placeholder="אימייל *" type="email" className="border p-2 rounded" value={formData.customerEmail} onChange={e => setFormData({...formData, customerEmail: e.target.value})} />
        <input placeholder="טלפון" className="border p-2 rounded" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} />
        <input placeholder="כתובת (אופציונלי)" className="border p-2 rounded" value={formData.customerAddress} onChange={e => setFormData({...formData, customerAddress: e.target.value})} />
      </div>

      <h2 className="font-bold mb-3 text-gray-700">פירוט פריטים</h2>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 mb-2 items-center">
          <input placeholder="שם הפריט *" className="border p-2 rounded flex-1" value={item.title} onChange={e => handleItemChange(index, "title", e.target.value)} />
          <input placeholder="כמות" type="number" min="1" className="border p-2 rounded w-20 text-center" value={item.quantity} onChange={e => handleItemChange(index, "quantity", e.target.value)} />
          <input placeholder="מחיר יחידה (₪) *" type="number" className="border p-2 rounded w-32" value={item.price} onChange={e => handleItemChange(index, "price", e.target.value)} />
          
          {/* כפתור ההסרה (פח אשפה) - מופיע רק אם יש יותר מפריט אחד */}
          {items.length > 1 && (
            <button 
              onClick={() => handleRemoveItem(index)} 
              className="text-red-500 hover:text-red-700 p-2 text-xl transition-colors"
              title="הסר פריט"
            >
              🗑️
            </button>
          )}
        </div>
      ))}
      <button onClick={handleAddItem} className="text-sm text-blue-600 mb-8 font-semibold hover:text-blue-800 transition-colors">+ הוסף פריט נוסף לקבלה</button>

      <button onClick={handleSend} disabled={loading} className="w-full bg-red-600 text-white font-bold py-4 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400">
        {loading ? "מייצר ושולח קבלה..." : "הפק קבלה ושלח ללקוח"}
      </button>
    </div>
  );
}