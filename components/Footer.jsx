// components/Footer.jsx
'use client';
import React from "react";
import SocialIcons from "@/components/SocialIcons";
import LegalLinks from "@/components/LegalLinks";

export default function Footer() {
  return (
    <footer
      id="footer"
      className="bg-black text-[#C0C0C0] px-6 pt-1 pb-2 shadow-md border-t border-gray-800 w-full"
    >
      {/* ✅ הקונטיינר הראשי: 
        1. 'lg:flex' - הופך ל-flexbox רק במסך גדול ומעלה.
        2. 'lg:justify-between' - מפזר את הפריטים לצדדים במסך גדול.
        3. 'lg:items-center' - ממקם את הפריטים במרכז אנכית.
      */}
      <div className="lg:flex lg:justify-between lg:items-center">
        
        {/* 🔹 אייקונים חברתיים */}
        {/* במובייל: נשאר במרכז כי הוא בתוך div רגיל. */}
        {/* במחשב: עובר לצד ימין (dir="rtl") */}
        <div className="w-full lg:w-auto">
           <SocialIcons size="text-2xl" />
        </div>

        {/* 🔹 כפתורי מדיניות */}
        {/* 'hidden lg:block' - מוסתר במובייל, מוצג כ-block (כדי שיהפוך לפריט flex) במחשב. */}
        {/* 'mt-2 lg:mt-0' - מוריד את המרווח העליון במסך גדול. */}
        <div className="hidden lg:block mt-2 lg:mt-0">
          <LegalLinks layout="horizontal" />
        </div>
      </div>


      {/* 🔹 זכויות יוצרים */}
      {/* הזזנו את ה-border-t לתוך ה-div הזה כדי שיפריד רק את שורת זכויות היוצרים
        מהתוכן שלמעלה, וכל זאת במסך גדול ומעלה בלבד.
      */}
      <div className="text-center text-xs md:text-sm border-t border-gray-700 pt-3 mt-3">
        &copy; {new Date().getFullYear()} OnMotor Media - כל הזכויות שמורות.
      </div>
      
    </footer>
  );
}