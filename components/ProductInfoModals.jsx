// components/ProductInfoModals.jsx
'use client';

import { useState, useEffect } from 'react';

// קומפוננטה פנימית שמציירת את הפופ-אפ (המודל)
const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    // סגירת החלון בלחיצה על Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose} // סגירה בלחיצה על הרקע (מחוץ לחלון)
      dir="rtl"
    >
      <div 
        className="relative w-full max-w-lg max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()} // מניעת סגירה בעת לחיצה בתוך החלון עצמו
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            aria-label="סגור חלון"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto text-gray-700 leading-relaxed space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function ProductInfoModals() {
  const [activeModal, setActiveModal] = useState(null);

  const closeModal = () => setActiveModal(null);

  return (
    <div className="flex flex-col gap-3 mt-5 border-t border-gray-100 pt-5">
      
      {/* 1. כפתור משלוחים */}
      <button 
        onClick={() => setActiveModal('shipping')}
        className="flex items-center justify-between w-full p-3 hover:bg-gray-50 rounded-lg transition-colors text-right group border border-transparent hover:border-gray-100"
      >
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-gray-600 group-hover:text-red-600 transition-colors" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
          <span className="font-semibold text-gray-800 text-sm md:text-base">משלוח מהיר עד 5 ימי עסקים! חינם מעל 299₪</span>
        </div>
        <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>

      {/* 2. כפתור החזרות */}
      <button 
        onClick={() => setActiveModal('returns')}
        className="flex items-center justify-between w-full p-3 hover:bg-gray-50 rounded-lg transition-colors text-right group border border-transparent hover:border-gray-100"
      >
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-gray-600 group-hover:text-red-600 transition-colors" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          <span className="font-semibold text-gray-800 text-sm md:text-base">אפשרות החזרה והחלפה ללא עלות</span>
        </div>
        <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>

      {/* 3. כפתור תשלום מאובטח */}
      <button 
        onClick={() => setActiveModal('security')}
        className="flex items-center justify-between w-full p-3 hover:bg-gray-50 rounded-lg transition-colors text-right group border border-transparent hover:border-gray-100"
      >
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-gray-600 group-hover:text-red-600 transition-colors" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <span className="font-semibold text-gray-800 text-sm md:text-base">תשלום מאובטח עד 12 תשלומים ללא ריבית</span>
        </div>
        <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>

      {/* ================= המודלים עצמם (החלונות הקופצים) ================= */}

      {/* מודל משלוחים */}
      <Modal isOpen={activeModal === 'shipping'} onClose={closeModal} title="מדיניות משלוחים">
        <p className="font-bold">אנחנו ב-OnMotor עושים הכל כדי שההזמנה שלכם תגיע במהירות המרבית לכל מקום בארץ!</p>
        
        <h4 className="font-bold text-gray-900 mt-6 border-b pb-1">עלויות משלוחים:</h4>
        <ul className="list-disc list-inside space-y-2 mt-2">
          <li><strong>משלוח חינם</strong> עד הבית באמצעות שליח בקנייה מעל 299 ₪.</li>
          <li>בקנייה מתחת ל-299 ₪, עלות המשלוח הינה 35 ₪.</li>
          <li>החלפות מידה עם שליח יתבצעו <strong>ללא עלות</strong> (לאחר פניית הלקוח לחנות ותיאום).</li>
        </ul>

        <h4 className="font-bold text-gray-900 mt-6 border-b pb-1">זמני אספקה:</h4>
        <ul className="list-disc list-inside space-y-2 mt-2">
          <li>שירות משלוחי אקספרס מתבצע על ידי חברת משלוחים חיצונית.</li>
          <li>אספקה לכתובת שהוזנה בעת הרכישה תוך <strong>עד 5 ימי עסקים</strong>.</li>
          <li>לאזורים מרוחקים (יישובי הערבה, אילת, רמת הגולן ועוד) זמן האספקה עשוי להגיע עד 10 ימי עסקים.</li>
          <li>בתקופות עומס (חגים, מבצעים מיוחדים) ייתכנו עיכובים של עד 7 ימי עסקים (ובאזורים מרוחקים עד 12).</li>
          <li>ניתן לבחור באפשרות של <strong>איסוף עצמי</strong> ללא עלות, בהתאם לאפשרויות המוצגות בתהליך התשלום.</li>
        </ul>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="font-semibold text-gray-900">לשאלות ובירורים לגבי סטטוס הזמנה:</p>
          <p className="flex items-center gap-2 mt-1">
            <svg className="w-4 h-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            <a href="https://wa.me/972522304604" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">שלחו לנו הודעה בוואטסאפ: 052-2304604</a>
          </p>
        </div>
      </Modal>

      {/* מודל החזרות */}
      <Modal isOpen={activeModal === 'returns'} onClose={closeModal} title="החזרות והחלפות">
        <p className="font-bold">הזמנתם חלק והמידה לא מתאימה? אל דאגה!</p>
        <p>אנו ב-OnMotor מאפשרים <strong>החלפת מידה ללא עלות נוספת או דמי משלוח</strong>, כדי שתקבלו בדיוק את מה שהאופנוע שלכם צריך.</p>

        <h4 className="font-bold text-gray-900 mt-6 border-b pb-1">תנאי החזרה וביטול:</h4>
        <ul className="list-disc list-inside space-y-2 mt-2">
          <li>ניתן לבטל עסקה או להחזיר מוצר בתוך 14 ימים מתאריך קבלתו.</li>
          <li>על מנת לקבל זיכוי, יש להשיב את המוצר לחברה כשהוא <strong>באריזתו המקורית, ללא פגמים ושלא נעשה בו כל שימוש</strong>, בצירוף חשבונית הרכישה המקורית.</li>
          <li>בקשת ביטול/החלפה תתבצע באמצעות פנייה טלפונית, דוא"ל או ווצאפ לשירות הלקוחות שלנו, ותאושר על ידי נציג.</li>
          <li>במקרה של החזרת מוצר (שאינה עקב פגם או החלפת מידה ראשונה), העלויות הכרוכות בהחזרת המוצר באמצעות שליח יחולו על הלקוח. האיסוף יבוצע על ידי חברת שליחויות מטעמנו מבית הלקוח.</li>
        </ul>

        <h4 className="font-bold text-gray-900 mt-6 border-b pb-1">קבלת הזיכוי הכספי:</h4>
        <p>לאחר שהמוצר יגיע למחסני החברה וייבדק כי עמד בתנאי ההחזרה (אריזה מקורית, ללא שימוש/נזק), יבוצע זיכוי על ידי נציג החברה.</p>
        <p className="mt-2">ההחזר הכספי יועבר לכרטיס האשראי או לאמצעי התשלום בו בוצעה ההזמנה המקורית תוך עד 14 ימי עסקים ממועד קבלת המוצר במחסנינו. בעסקאות ששולמו באמצעות כרטיס "דיירקט", ייתכן שזמן הזיכוי יתארך בהתאם למדיניות חברת האשראי.</p>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="font-semibold text-gray-900">צריכים הכוונה או רוצים להחליף? אנחנו כאן:</p>
          <p className="flex items-center gap-4 mt-2">
            <span>📞 טלפון: <a href="tel:088585046" className="text-red-600 hover:underline">08-858-5046</a></span>
            <span className="flex items-center gap-1"><svg className="w-4 h-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg> <a href="https://wa.me/972507424942" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">050-742-4942</a></span>
          </p>
        </div>
      </Modal>

      {/* מודל אבטחה */}
      <Modal isOpen={activeModal === 'security'} onClose={closeModal} title="קנייה ותשלום מאובטח">
        <p className="font-bold text-lg mb-4 text-center">לקוח/ה יקר/ה, ברוכים הבאים ל-OnMotor Parts.</p>
        <p className="mb-4">אנו משקיעים מאמצים ומשאבים רבים על מנת להבטיח עבורכם את חוויית הרכישה המאובטחת, האמינה והשקטה ביותר ברשת:</p>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 bg-green-100 text-green-700 p-1 rounded-full"><svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <p><strong>פרטיות מלאה:</strong> פרטי כרטיס האשראי שלכם <strong>אינם נשמרים בשרתי האתר בשום שלב</strong>. הם מועברים בצורה מוצפנת ישירות לחברות הסליקה.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 bg-green-100 text-green-700 p-1 rounded-full"><svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <p><strong>הצפנת נתונים:</strong> כל המידע האישי שאתם מזינים באתר מוצפן ומוגן בעזרת פרוטוקול אבטחה מחמיר מסוג SSL (Secure Sockets Layer).</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 bg-green-100 text-green-700 p-1 rounded-full"><svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <p><strong>תקנים בינלאומיים:</strong> החנות שלנו עומדת בדרישות האבטחה המחמירות ביותר של חברות האשראי הבינלאומיות (תקן PCI DSS Level 1).</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 bg-green-100 text-green-700 p-1 rounded-full"><svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <p><strong>קוד אבטחה חסוי:</strong> אנו לא שומרים את קוד ה‑CVV (3 הספרות בגב הכרטיס); נתון זה נדרש טרנזקציונלית בלבד לצורך זיהוי חד-פעמי, כחלק מעמידה בתקני הבטיחות.</p>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 font-medium">
          <svg className="w-12 h-12 mx-auto text-green-600 mb-2 opacity-80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
          קנייה נעימה ובטוחה!<br/>צוות OnMotor
        </div>
      </Modal>

    </div>
  );
}