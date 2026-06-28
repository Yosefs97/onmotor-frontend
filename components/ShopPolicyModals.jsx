// components/ShopPolicyModals.jsx
'use client';
import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity text-right"
      onClick={onClose} 
      dir="rtl"
    >
      <div 
        className="relative w-full max-w-lg max-h-[80vh] sm:max-h-[85vh] bg-white rounded-xl sm:rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 my-auto"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 shrink-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 pr-1">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
            aria-label="סגור חלון"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto text-gray-700 leading-relaxed space-y-3 sm:space-y-4 text-sm sm:text-base">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function ShopPolicyModals({ activeModal, onClose }) {
  return (
    <>
      {/* 1. מודל משלוחים */}
      <Modal isOpen={activeModal === 'shipping'} onClose={onClose} title="מדיניות משלוחים">
        <p className="font-bold">אנו ב־OnMotor Parts עושים הכל כדי שההזמנה תגיע אליכם במהירות ובבטחה.</p>
        <h4 className="font-bold text-gray-900 mt-4 border-b pb-1">עלויות וזמנים:</h4>
        <ul className="list-disc list-inside space-y-1.5 pr-1">
          <li>זמן טיפול והכנת הזמנה: עד 2 ימי עסקים.</li>
          <li>זמן אספקה עם שליח עד הבית: <strong>2-5 ימי עסקים</strong> מרגע יציאת המשלוח.</li>
          <li>עלות משלוח: 35 ₪ | <strong>משלוח חינם</strong> בהזמנות מעל 299 ₪.</li>
          <li>לאזורים חריגים/מרוחקים זמן האספקה עשוי להתארך עד 10 ימי עסקים.</li>
          <li>איסוף עצמי זמין בתיאום מראש בלבד ללא עלות.</li>
        </ul>
      </Modal>

      {/* 2. מודל החזרות (מעודכן לחוק הגנת הצרכן) */}
      <Modal isOpen={activeModal === 'returns'} onClose={onClose} title="החזרות והחלפות">
        <p className="font-bold">הזמנתם חלק והוא לא מתאים? הכל בסדר.</p>
        <p>בהתאם לחוק הגנת הצרכן (עסקת מכר מרחוק), ניתן לבטל עסקה ולהחזיר מוצר תוך <strong>14 ימים</strong> מיום קבלתו.</p>
        <h4 className="font-bold text-gray-900 mt-4 border-b pb-1">דגשים חשובים להחזרה:</h4>
        <ul className="list-disc list-inside space-y-1.5 pr-1">
          <li>המוצר יוחזר באריזתו המקורית בלבד, כשהוא תקין ושלא נעשה בו שימוש.</li>
          <li><strong>חלקים חשמליים:</strong> לא תתאפשר החזרה של חלק חשמלי שחובר למתח או הותקן בכלי (עקב סכנת קצר ונזק בלתי הפיך).</li>
          <li>ביטול עסקה שלא עקב פגם כרוך בדמי ביטול של 5% או 100 ₪ (הנמוך מביניהם).</li>
          <li>החלפת מידה ראשונה תתבצע בסיוע שליח מטעמנו ללא עלות משלוח נוספת.</li>
        </ul>
      </Modal>

      {/* 3. מודל אחריות (הסעיף שמציל מוסכים תביעות) */}
      <Modal isOpen={activeModal === 'warranty'} onClose={onClose} title="אחריות ותנאי התקנה">
        <p className="font-bold">אנו עומדים מאחורי איכות החלפים שאנו מספקים.</p>
        <ul className="list-disc list-inside space-y-1.5 pr-1 mt-2">
          <li><strong>חלקים חדשים:</strong> מגיעים עם אחריות יצרן/יבואן רשמית.</li>
          <li><strong>חלקים מפירוק (משומשים):</strong> נבדקו תפעולית ונמכרים עם אחריות תקינות בהרכבה ראשונית.</li>
          <li><span className="text-red-600 font-bold">תנאי סף למימוש אחריות:</span> האחריות תקפה אך ורק אם החלק הותקן על ידי <strong>מוסך מורשה כדין</strong>. במקרה של תביעת אחריות יש להציג חשבונית התקנה מאותו מוסך. האחריות אינה מכסה נזק שנגרם כתוצאה מהתקנה חובבנית עצמאית.</li>
        </ul>
      </Modal>

      {/* 4. מודל אבטחה */}
      <Modal isOpen={activeModal === 'security'} onClose={onClose} title="קנייה ותשלום מאובטח">
        <p className="font-bold text-center mb-3">הרכישה ב־OnMotor Parts מאובטחת ברמה הגבוהה ביותר</p>
        <div className="space-y-3">
          <p>✔️ פלטפורמת Shopify עומדת בתקן <strong>PCI DSS Level 1</strong> – התקן המחמיר בעולם לסליקת אשראי.</p>
          <p>✔️ כל המידע באתר מוצפן בפרוטוקול SSL/TLS מתקדם.</p>
          <p>✔️ פרטי כרטיסי האשראי אינם נשמרים בשרתי החנות בשום שלב.</p>
          <p>✔️ תמיכה בפרוטוקול 3D Secure לאימות מוגן מול חברת האשראי שלכם.</p>
        </div>
      </Modal>
    </>
  );
}