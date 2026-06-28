// app/shop/terms/page.jsx
import React from 'react';

export const metadata = {
  title: 'תקנון חנות ותנאי שימוש | OnMotor Parts',
  description: 'תקנון האתר ותנאי השימוש בחנות חלפי האופנועים OnMotor Parts',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-[#e60000] border-b pb-4">
            תקנון חנות ותנאי שימוש
          </h1>
          
          <div className="text-gray-700 leading-relaxed space-y-8 text-sm sm:text-base">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. מבוא</h2>
              <p>
                ברוכים הבאים לאתר הסחר של OnMotor Parts (להלן: "האתר"). האתר משמש כחנות וירטואלית למכירת חלקי חילוף לאופנועים וקטנועים. השימוש באתר, ובכלל זה ביצוע רכישות בו, מהווה הסכמה מצדך לתנאים הכלולים בתקנון זה. אנא קרא את התקנון בקפידה טרם ביצוע רכישה.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. תנאי רכישה וביצוע הזמנות</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>רשאי לבצע פעולה באתר כל אדם מעל גיל 18, בעל כרטיס אשראי ישראלי או בינלאומי תקף.</li>
                <li>החברה שומרת לעצמה את הזכות לעדכן מחירים, מבצעים ועלויות משלוח מעת לעת ללא הודעה מוקדמת. המחיר הקובע הוא המחיר שהוצג בעת סיום תהליך הרכישה.</li>
                <li>במקרה של טעות חריגה ובתום לב בהזנת מחיר המוצר (לדוגמה, מוצר ששוויו 1,000 ש"ח מוצג ב-10 ש"ח), החברה רשאית לבטל את ההזמנה ותזכה את הלקוח במלוא הסכום ששילם.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. אספקה, משלוחים והחזרות</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>תנאי המשלוח, זמני האספקה ומדיניות ביטול העסקאות וההחזרות כפופים לחוק הגנת הצרכן, התשמ"א-1981, ומפורטים במלואם ב"מדיניות המשלוחים וההחזרות" המופיעה באתר.</li>
                <li>הלקוח מתחייב לאסוף את החבילה בזמן מנקודת החלוקה או מידי השליח. חבילה שתחזור לחברה עקב אי דרישה תגרור חיוב בגין דמי משלוח חוזרים.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. הגבלת אחריות ותנאי התקנה</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>התקנת חלקי חילוף, בין אם מפירוק ובין אם חדשים, דורשת ידע מקצועי. <strong className="text-red-600">תנאי סף למימוש כל אחריות על מוצר הוא התקנתו על ידי מוסך מורשה כדין</strong>.</li>
                <li>במקרה של דרישה למימוש אחריות בגין פגם או תקלה, יידרש הלקוח להציג חשבונית התקנה מהמוסך המורשה בו בוצעה העבודה.</li>
                <li>החברה לא תישא באחריות לכל נזק, ישיר או עקיף, שייגרם ללקוח, לכלי הרכב או לצד ג' כתוצאה מהתקנה לקויה, שימוש בלתי סביר, או אי התאמה של החלק כתוצאה מהזמנה שגויה של הלקוח.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. קניין רוחני וסמכות שיפוט</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>כל זכויות הקניין הרוחני באתר, לרבות תמונות, טקסטים, לוגו ועיצוב, הינן רכושה הבלעדי של OnMotor. אין להעתיק, לשכפל או לעשות בהם שימוש ללא אישור מראש ובכתב.</li>
                <li>על תקנון זה יחולו דיני מדינת ישראל. סמכות השיפוט הבלעדית נתונה לבתי המשפט המוסמכים במחוז תל אביב.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}