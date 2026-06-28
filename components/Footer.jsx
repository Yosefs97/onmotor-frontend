// components/Footer.jsx
'use client';
import React from "react";
import { usePathname } from "next/navigation";
import SocialIcons from "@/components/SocialIcons";
import LegalLinks from "@/components/LegalLinks";
import { ShieldCheck, Truck, CreditCard } from "lucide-react"; // הוספת אייקונים חנותיים

export default function Footer() {
  const pathname = usePathname();
  
  // בדיקה אוטומטית האם הלקוח נמצא בדפי החנות (למשל: onmotor.co.il/shop/...)
  const isShop = pathname ? pathname.startsWith('/shop') : false;

  return (
    <footer
      id="footer"
      className="bg-black text-[#C0C0C0] px-6 pt-8 pb-4 shadow-md border-t border-gray-800 w-full text-right"
      dir="rtl"
    >
      {/* 🌟 במידה ונמצאים בחנות - מציגים פוטר חנותי עשיר ומקצועי (Multi-Column) */}
      {isShop ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-gray-800 max-w-6xl mx-auto">
          
          {/* עמודה 1: קצת עלינו חנות */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-lg border-b border-[#e60000] pb-2 inline-block">OnMotor Parts</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              הבית שלך לחלקי חילוף לאופנועים וקטנועים. חלקים חדשים ומשומשים מפירוק שעברו בדיקות איכות קפדניות כדי להבטיח לכם רכיבה בטוחה בראש שקט.
            </p>
            <div className="pt-2">
              <SocialIcons size="text-xl" />
            </div>
          </div>

          {/* עמודה 2: קישורים ומדיניות חנות */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-lg border-b border-[#e60000] pb-2 inline-block">מידע ושירות לקוחות</h3>
            {/* תצוגת מחשב ומובייל מותאמת */}
            <div className="hidden md:block">
              <LegalLinks isShop={true} layout="vertical" />
            </div>
            <div className="block md:hidden">
              <LegalLinks isShop={true} isMobile={true} />
            </div>
          </div>

          {/* עמודה 3: אבטחה ומשלוחים (סטנדרט חנות חובה לבניית אמון) */}
          <div className="space-y-4 text-sm text-gray-400">
            <h3 className="text-white font-bold text-lg border-b border-[#e60000] pb-2 inline-block">קנייה בטוחה</h3>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#00FF00] shrink-0" />
              <span>תשלום מאובטח בתקן PCI-DSS המחמיר ביותר.</span>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-[#e60000] shrink-0" />
              <span>משלוחים מהירים לכל חלקי הארץ (2-5 ימי עסקים).</span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-400 shrink-0" />
              <span>אפשרות פריסה לתשלומים נוחים באשראי.</span>
            </div>
          </div>

        </div>
      ) : (
        /* 📰 במידה ונמצאים במגזין - משאירים את המבנה המקורי והנקי שלך */
        <div className="lg:flex lg:justify-between lg:items-center pb-4">
          {/* 🔹 אייקונים חברתיים */}
          <div className="w-full lg:w-auto">
            <SocialIcons size="text-2xl" />
          </div>

          {/* 🔹 כפתורי מדיניות מגזין */}
          <div className="hidden lg:block mt-2 lg:mt-0">
            <LegalLinks isShop={false} layout="horizontal" />
          </div>
          <div className="block lg:hidden">
            <LegalLinks isShop={false} isMobile={true} />
          </div>
        </div>
      )}

      {/* 🔹 שורת זכויות יוצרים דינמית */}
      <div className={`text-center text-xs md:text-sm pt-4 ${!isShop ? 'border-t border-gray-700 mt-3' : ''}`}>
        &copy; {new Date().getFullYear()} {isShop ? "OnMotor Parts" : "OnMotor Media"} - כל הזכויות שמורות.
      </div>
    </footer>
  );
}