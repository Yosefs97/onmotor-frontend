// /components/ShopInfoAccordion.jsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { Plus, Minus, MessageCircle, Shield } from 'lucide-react';
// ייבוא קומפוננטת ההמלצות. ודא שהקובץ Testimonials.jsx קיים באותה תיקייה.
import Testimonials from './Testimonials'; 

function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (open && contentRef.current) {
      // גלילה עדינה אל הפריט שנפתח
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [open]);

  return (
    <div className="border-b" ref={contentRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full py-4 px-3 text-right transition hover:bg-red-50"
      >
        <span className="text-lg font-bold text-[#e60000]">{title}</span>
        {open ? (
          <Minus className="w-7 h-7 text-[#e60000]" />
        ) : (
          <Plus className="w-7 h-7 text-[#e60000]" />
        )}
      </button>
      {/* אנימציית פתיחה/סגירה. max-h גבוה מספיק כדי להכיל את הגובה של הטאב הכי ארוך */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-[2000px] p-4' : 'max-h-0'
        }`}
      >
        <div className="text-gray-900 text-m leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  );
}

function SecurityInfo() {
  const [show, setShow] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setShow(!show)}
        className="inline-flex items-center gap-2 bg-[#00FF00] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition"
      >
        <Shield className="w-5 h-5" />
        מידע על אבטחת תשלומים
      </button>

      {show && (
        <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
          <p>✔️ Shopify עומדת בתקן PCI DSS Level 1 – התקן המחמיר ביותר לאבטחת מידע בכרטיסי אשראי.</p>
          <p>✔️ כל העסקאות מוצפנות ב־SSL/TLS, כך שהמידע נשלח בצורה מאובטחת.</p>
          <p>✔️ מנגנוני זיהוי הונאות (Fraud Analysis) בודקים עסקאות חשודות.</p>
          <p>✔️ פרטי כרטיסי האשראי לא נשמרים באתר, אלא בשרתי Shopify המאובטחים.</p>
          <p>✔️ תמיכה ב־3D Secure (Verified by Visa / MasterCard SecureCode) להוספת שכבת אימות.</p>
          <p>✔️ ניטור ובקרה 24/7 לאיתור פעילות חריגה או ניסיונות פריצה.</p>
        </div>
      )}
    </div>
  );
}

export default function ShopInfoAccordion() {
  return (
    <section className="mt-10 border rounded-lg bg-white shadow-md overflow-hidden">
      {/* טאב חדש: לקוחות מרוצים */}
      <AccordionItem title="לקוחות מרוצים">
        {/* קריאה לקומפוננטה המציגה את הקרוסלה */}
        <Testimonials />
      </AccordionItem>

      <AccordionItem title="משלוחים">
        <ul className="list-disc list-inside space-y-1">
          <li>זמן טיפול בהזמנה: עד 2 ימי עסקים.</li>
          <li>זמן אספקה (משלוח רגיל): 2-5 ימי עסקים מרגע יציאת המשלוח.</li>
          <li>עלות משלוח עם שליח עד הבית: 39 ₪.</li>
          <li><strong>משלוח חינם</strong> בהזמנות מעל 499 ₪ (לא כולל חלקי חילוף).</li>
        </ul>
      </AccordionItem>

      <AccordionItem title="החזרות והחלפות">
        <p>
          בהתאם לחוק הגנת הצרכן (עסקת מכר מרחוק), ניתן לבטל עסקה ולהחזיר מוצרים תוך <strong>14 ימים</strong> מיום קבלת המוצר.
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>ההחזרה תתאפשר אך ורק למוצרים שלא נעשה בהם שימוש והם נמצאים באריזתם המקורית.</li>
          <li><strong>חלקים חשמליים:</strong> לא ניתן להחזיר חלק חשמלי שחובר לחשמל או הותקן בכלי (בשל סכנת קצר/נזק בלתי הפיך). החזרה תתאפשר רק אם המוצר סגור באריזתו.</li>
          <li>ביטול עסקה כרוך בדמי ביטול כדין בשיעור של 5% ממחיר המוצר או 100 ₪ (הנמוך מביניהם).</li>
        </ul>
      </AccordionItem>

      <AccordionItem title="אחריות">
        <p>אנו עומדים מאחורי איכות החלקים שאנו מספקים. עם זאת, תחום החלפים דורש מקצועיות בהתקנה:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li><strong>חלקים חדשים:</strong> כוללים אחריות יצרן/יבואן בהתאם לסוג החלק.</li>
          <li><strong>חלקים מפירוק (משומשים):</strong> נבדקו בקפידה ונמכרים עם אחריות מוגבלת להרכבה ותקינותראשונית, אלא אם צוין אחרת.</li>
          <li><strong>שימו לב:</strong> האחריות תקפה <u>אך ורק</u> אם החלק הותקן על ידי מוסך מורשה כדין (יש להציג חשבונית התקנה ממוסך במקרה של תביעת אחריות). האחריות אינה מכסה נזק שנגרם מהתקנה לקויה או שימוש בלתי סביר.</li>
        </ul>
      </AccordionItem>

      <AccordionItem title="קצת עלינו">
        <p>
          ב־<strong>OnMotor Parts</strong> אנחנו מתמחים בשיווק חלקי חילוף לאופנועים וקטנועים - חדשים ומשומשים, כולל חלקים מפירוק באיכות גבוהה.
        </p>
        <p>
          אנחנו עובדים בשיתוף פעולה הדוק עם מוסכים שאנחנו מכירים וסומכים עליהם. כל חלק שמגיע מפירוק עובר בדיקה מקיפה ואישור מקצועי לפני שהוא מגיע אליכם, כדי להבטיח נסיעה בטוחה וראש שקט.
        </p>
      </AccordionItem>

      <AccordionItem title="שאלות נפוצות (FAQ)">
        <p><strong>מתי המוצר מגיע אליי?</strong><br/> לרוב תוך 2-5 ימי עסקים מרגע סיום הטיפול בהזמנה.</p>
        <p><strong>האם אפשר להחזיר או להחליף מוצר?</strong><br/> בהחלט. ניתן להחזיר מוצר שלא נעשה בו שימוש תוך 14 ימים, בהתאם למדיניות ההחזרות.</p>
        <p><strong>האם בטוח לרכוש אצלכם באתר?</strong><br/> האתר מאובטח ברמת האבטחה הגבוהה ביותר וללא פשרות.</p>
        
        {/* כפתור מידע על אבטחה */}
        <div className="my-3">
          <SecurityInfo />
        </div>

        <p><strong>האם ניתן לאסוף את ההזמנה עצמאית?</strong><br/> כן, בתיאום מראש בלבד.</p>

        {/* כפתור וואטסאפ */}
        <a
          href="https://wa.me/972506129664"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 bg-[#e60000] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition"
        >
          <MessageCircle className="w-5 h-5" />
          לתיאום איסוף או כל שאלה נוספת, אנחנו בוואטסאפ
        </a>
      </AccordionItem>
    </section>
  );
}