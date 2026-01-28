// /components/ShopInfoAccordion.jsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { Plus, Minus, MessageCircle, Shield } from 'lucide-react';

function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (open && contentRef.current) {
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
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-[1000px] p-4' : 'max-h-0'
        }`}
      >
        <div className="text-gray-900 text-m leading-relaxed">{children}</div>
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
      <AccordionItem title="משלוחים">
        <p> משלוח רגיל תוך 2-5 ימי עסקים מרגע הטיפול בהזמנה.</p>
        <p> משלוח עם שליח עד הבית - 35 ₪, או חינם בקנייה מעל 500 ₪.</p>
      </AccordionItem>

      <AccordionItem title="החזרות / החלפות">
        <p>
          החזרות והחלפות יתקבלו על כל סוגי החלקים למעט חלקים חשמליים, עד 48 שעות מרגע הרכישה
          ובתנאי שלא נעשה שימוש בחלק.
        </p>
      </AccordionItem>

      <AccordionItem title="אחריות">
        <p>כל המוצרים מגיעים עם אחריות בהתאם לסוג החלק.</p>
      </AccordionItem>

      <AccordionItem title="קצת עלינו">
        <p>
          ב־OnMotor Parts אנחנו מתמחים בשיווק חלקי חילוף לאופנועים וקטנועים - חדשים ומשומשים, כולל חלקים שמגיעים מפירוק.
        </p>
        <p>
          אנחנו עובדים עם מוסכים שאנחנו מכירים וסומכים עליהם, ומקבצים מהם חלקים שעברו בדיקה ואישור לפני מכירה.
        </p>
      </AccordionItem>

      <AccordionItem title="שאלות נפוצות">
        <p><strong>מתי המוצר מגיע אלי?</strong> בדרך כלל תוך 5-2 ימי עסקים.</p>
        <p><strong>יש החזרות/החלפות?</strong> כן, בהתאם למדיניות המפורטת מעלה.</p>
        <p>
          <strong>האם בטוח לרכוש אצלכם?</strong> האתר מאובטח ברמת האבטחה הגבוהה ביותר.
        </p>

        {/* כפתור מידע על אבטחה */}
        <SecurityInfo />

        <p><strong>האם ניתן לאסוף?</strong> כן, בתיאום מראש בלבד.</p>

        {/* כפתור וואטסאפ */}
        <a
          href="https://wa.me/972506129664" // ✅ מספר שלך
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 bg-[#e60000] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition"
        >
          <MessageCircle className="w-5 h-5" />
          לתיאום איסוף או כל שאלה נוספת אנחנו זמינים בוואטסאפ
        </a>
      </AccordionItem>
    </section>
  );
}
