// app/shop/account/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, ShoppingBag, MapPin, LogOut, Loader2, Mail, Lock } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customer, setCustomer] = useState(null);

  // סטייט לטפסים
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // 1. בדיקת סטטוס חיבור בטעינת העמוד
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/shopify/customer/get');
      const json = await res.json();
      if (json.isLoggedIn && json.customer) {
        setIsLoggedIn(true);
        setCustomer(json.customer);
      } else {
        setIsLoggedIn(false);
        setCustomer(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // 2. לוגיקת התחברות
  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);

    try {
      const res = await fetch('/api/shopify/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'שגיאה בתהליך ההתחברות');

      await checkAuth(); // רענון הנתונים
    } catch (err) {
      setFormError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. לוגיקת הרשמה
  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setActionLoading(true);

    try {
      const res = await fetch('/api/shopify/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'שגיאה בתהליך ההרשמה');

      setFormSuccess('החשבון נוצר בהצלחה! מבצע התחברות...');
      
      // התחברות אוטומטית לאחר הרשמה
      const loginRes = await fetch('/api/shopify/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      
      if (loginRes.ok) {
        await checkAuth();
      } else {
        setIsLoginView(true);
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 4. לוגיקת התנתקות
  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/shopify/customer/logout', { method: 'POST' });
      setIsLoggedIn(false);
      setCustomer(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // מסך טעינה גלובלי (בדיקת סשן)
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-zinc-600">
        <Loader2 className="w-10 h-10 animate-spin text-[#e60000]" />
        <span className="font-bold">טוען נתוני חשבון...</span>
      </div>
    );
  }

  // === מבט 1: מסך התחברות / הרשמה ===
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border border-gray-200 shadow-sm rounded-none" dir="rtl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-black">
            {isLoginView ? 'התחברות לחשבון' : 'יצירת חשבון חדש'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {isLoginView ? 'צפה בהיסטוריית ההזמנות ועקוב אחר משלוחים' : 'הירשם כדי לנהל את הרכישות שלך בקלות'}
          </p>
        </div>

        {formError && <div className="mb-4 p-3 bg-red-50 border-r-4 border-red-600 text-red-700 font-bold text-sm">{formError}</div>}
        {formSuccess && <div className="mb-4 p-3 bg-green-50 border-r-4 border-green-600 text-green-700 font-bold text-sm">{formSuccess}</div>}

        <form onSubmit={isLoginView ? handleLogin : handleRegister} className="space-y-4">
          {!isLoginView && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">שם פרטי</label>
                <input type="text" name="firstName" required onChange={handleInputChange} className="w-full border p-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 rounded-none text-black" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">שם משפחה</label>
                <input type="text" name="lastName" required onChange={handleInputChange} className="w-full border p-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 rounded-none text-black" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-1 text-gray-700">כתובת אימייל</label>
            <div className="relative">
              <input type="email" name="email" required onChange={handleInputChange} className="w-full border p-2.5 pr-10 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 rounded-none text-black" />
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 text-gray-700">סיסמה</label>
            <div className="relative">
              <input type="password" name="password" required onChange={handleInputChange} className="w-full border p-2.5 pr-10 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 rounded-none text-black" />
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full bg-[#e60000] text-white py-3 font-bold uppercase tracking-wider hover:bg-red-700 transition disabled:bg-red-400 flex items-center justify-center gap-2 rounded-none shadow-md"
          >
            {actionLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isLoginView ? 'התחבר' : 'צור חשבון'}
          </button>
        </form>

        <div className="mt-6 text-center border-t pt-4 text-sm text-gray-600">
          {isLoginView ? (
            <p>
              אורח חדש?{' '}
              <button onClick={() => { setIsLoginView(false); setFormError(''); }} className="text-[#e60000] font-bold hover:underline">
                צור חשבון חדש כאן
              </button>
            </p>
          ) : (
            <p>
              כבר יש לך חשבון?{' '}
              <button onClick={() => { setIsLoginView(true); setFormError(''); }} className="text-[#e60000] font-bold hover:underline">
                התחבר כאן
              </button>
            </p>
          )}
        </div>
      </div>
    );
  }

  // === מבט 2: דאשבורד אזור אישי (מחובר) ===
  const orders = customer.orders?.edges || [];

  return (
    <div className="max-w-7xl mx-auto my-8 px-4" dir="rtl">
      {/* כותרת עמוד וברכת שלום */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-gray-900 pb-4 mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-black flex items-center gap-2">
            <User className="w-8 h-8 text-[#e60000]" />
            החשבון שלי
          </h2>
          <p className="text-gray-600 mt-1">שלום, <span className="font-bold text-black">{customer.firstName} {customer.lastName}</span></p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 bg-zinc-950 text-white px-4 py-2 hover:bg-[#e60000] transition text-sm font-bold shadow rounded-none"
        >
          <LogOut className="w-4 h-4" />
          התנתק מהחשבון
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* צד ימין (רחב): היסטוריית הזמנות */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-black flex items-center gap-2 border-b pb-2">
            <ShoppingBag className="w-5 h-5 text-gray-500" />
            היסטוריית הזמנות ({orders.length})
          </h3>

          {orders.length === 0 ? (
            <div className="p-8 border border-dashed border-gray-300 bg-white text-center text-gray-500 font-medium">
              טרם ביצעת הזמנות בחנות שלנו.
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 shadow-sm bg-white">
              <table className="w-full text-right border-collapse text-sm text-black">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                    <th className="p-3">מספר הזמנה</th>
                    <th className="p-3">תאריך</th>
                    <th className="p-3">סטטוס תשלום</th>
                    <th className="p-3">סטטוס משלוח</th>
                    <th className="p-3">סה"כ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(({ node: order }) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-bold text-gray-900">#{order.orderNumber}</td>
                      <td className="p-3 text-gray-600">{new Date(order.processedAt).toLocaleDateString('he-IL')}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2.5 py-0.5 font-bold text-xs rounded-full ${
                          order.financialStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.financialStatus === 'PAID' ? 'שולם' : order.financialStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-2.5 py-0.5 font-bold text-xs rounded-full ${
                          order.fulfillmentStatus === 'FULFILLED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.fulfillmentStatus === 'FULFILLED' ? 'נשלח' : 'בטיפול'}
                        </span>
                      </td>
                      <td className="p-3 font-black text-gray-900">
                        {order.totalPrice.amount} {order.totalPrice.currencyCode === 'ILS' ? '₪' : order.totalPrice.currencyCode}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* צד שמאל (צר): פרטי פרופיל וכתובת */}
        <div className="space-y-6">
          {/* כרטיס פרטים אישיים */}
          <div className="bg-white border border-gray-200 p-5 shadow-sm rounded-none">
            <h3 className="text-lg font-bold text-black border-b pb-2 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              פרטי החשבון
            </h3>
            <div className="space-y-2 text-sm text-black">
              <p><span className="text-gray-500 font-medium">שם מלא:</span> {customer.firstName} {customer.lastName}</p>
              <p><span className="text-gray-500 font-medium">אימייל:</span> {customer.email}</p>
              {customer.phone && <p><span className="text-gray-500 font-medium">טלפון:</span> {customer.phone}</p>}
            </div>
          </div>

          {/* כרטיס כתובת למשלוח */}
          <div className="bg-white border border-gray-200 p-5 shadow-sm rounded-none">
            <h3 className="text-lg font-bold text-black border-b pb-2 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              כתובת ברירת מחדל
            </h3>
            {customer.defaultAddress ? (
              <div className="space-y-1 text-sm text-black">
                <p className="font-bold">{customer.defaultAddress.address1}</p>
                <p>{customer.defaultAddress.city}, {customer.defaultAddress.zip}</p>
                <p>{customer.defaultAddress.country}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">לא הגדרת עדיין כתובת למשלוח בשופיפיי.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}