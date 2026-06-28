// app/shop/privacy/page.jsx
import React from 'react';

export const metadata = {
  title: 'מדיניות פרטיות | OnMotor Parts',
  description: 'כיצד אנו שומרים על המידע האישי שלך מאובטח ב-OnMotor Parts',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-[#e60000] border-b pb-4">
            מדיניות פרטיות
          </h1>
          
          <div className="text-gray-700 leading-relaxed space-y-8 text-sm sm:text-base">
            <section>
              <p className="font-semibold text-lg">
                אנו ב-OnMotor Parts מכבדים את פרטיותך ומחויבים להגן על המידע האישי שאתה חולק עמנו. מטרת מסמך זה היא לפרט כיצד אנו אוספים, שומרים ומשתמשים במידע.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. איסוף מידע אישי</h2>
              <p>
                בעת ביצוע הזמנה באתר, אנו אוספים את המידע הנחוץ להשלמת הרכישה, הטיפול בה ואספקתה אליך: שם מלא, כתובת למשלוח, מספר טלפון נייד וכתובת דואר אלקטרוני.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. אבטחת מידע וסליקת אשראי</h2>
              <p>
                האתר פועל על גבי פלטפורמת Shopify ומאובטח ברמה הגבוהה ביותר. 
                <strong className="text-green-600 block mt-2">
                  פרטי כרטיס האשראי שלכם אינם נשמרים במאגרי המידע שלנו בשום שלב.
                </strong>
                הסליקה מתבצעת באופן מוצפן בהתאם לתקן המחמיר PCI DSS Level 1, ופרטי התשלום מועברים ישירות אל חברות הסליקה.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. שיתוף מידע עם צדדים שלישיים</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>המידע המוזן באתר משמש אך ורק למטרת השלמת ההזמנה ושירות הלקוחות.</li>
                <li>אנו לא נעביר, נמכור או נשתף את פרטיך לצדדים שלישיים, למעט חברות המשלוחים לצורך אספקת החבילה.</li>
                <li>חריג לכך הוא מקרה של דרישה על פי חוק, צו שיפוטי, או צורך להגן על זכויותיה המשפטיות של החברה.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. שימוש בעוגיות (Cookies)</h2>
              <p>
                האתר משתמש ב"עוגיות" (Cookies) לצורך תפעולו השוטף, שמירת מוצרים בעגלת הקניות, איסוף נתונים סטטיסטיים אנונימיים (כגון Google Analytics) והתאמת חוויית הגלישה למשתמש. באפשרותך לשנות את הגדרות הדפדפן שלך כדי לחסום עוגיות, אך פעולה זו עלולה לפגוע ביכולת לבצע רכישה באתר.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. דיוור ישיר (ניוזלטר)</h2>
              <p>
                לקוח שיבחר להצטרף לרשימת התפוצה שלנו בעת הרכישה או בהרשמה לאתר, עשוי לקבל מעת לעת הודעות שיווקיות, מבצעים ועדכונים לכתובת הדוא"ל או לטלפון הנייד. ניתן להסיר את עצמך מרשימת התפוצה בכל עת ובקלות, על ידי לחיצה על כפתור "הסר" בתחתית המייל או פנייה לשירות הלקוחות שלנו.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}