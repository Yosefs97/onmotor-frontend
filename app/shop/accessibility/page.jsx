// app/shop/accessibility/page.jsx
import React from 'react';

export const metadata = {
  title: 'הצהרת נגישות | OnMotor Parts',
  description: 'הצהרת הנגישות של אתר OnMotor Parts',
};

export default function AccessibilityPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-[#e60000] border-b pb-4">
            הצהרת נגישות
          </h1>
          
          <div className="text-gray-700 leading-relaxed space-y-8 text-sm sm:text-base">
            <section>
              <p className="font-semibold text-lg">
                אנו ב-OnMotor רואים חשיבות עליונה במתן שירות שוויוני, מכבד ונגיש לכלל הלקוחות, לרבות אנשים עם מוגבלויות.
              </p>
              <p className="mt-2">
                אנו פועלים רבות ומקצים משאבים כדי להנגיש את האתר שלנו, בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), תשע"ג-2013, מתוך אמונה כי לכל אדם מגיעה הזכות ליהנות מגישה מלאה למידע ולשירותים שאנו מציעים ברשת.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">פעולות ההנגשה שבוצעו באתר:</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>האתר מותאם לתצוגה בכל הדפדפנים הנפוצים ולשימוש בטלפונים סלולריים.</li>
                <li>הניווט באתר תוכנן להיות פשוט, ברור ונוח לשימוש.</li>
                <li>תוכני האתר נכתבו בשפה פשוטה וברורה ככל הניתן.</li>
                <li>מבנה האתר מאפשר ניווט באמצעות מקלדת.</li>
                <li>האתר מאפשר שינוי גודל גופן באמצעות המקלדת (לחיצה על Ctrl ו- + להגדלה).</li>
                <li>אנו משתדלים להוסיף חלופות טקסטואליות (Alt Text) לתמונות משמעותיות באתר.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">סייגים לנגישות:</h2>
              <p>
                יש לציין כי למרות מאמצינו הרבים להנגיש את כלל הדפים והרכיבים באתר, ייתכן שיתגלו חלקים ספציפיים (כגון מסמכי PDF חיצוניים, באנרים מסוימים או תמונות מוצר ישנות) שטרם הונגשו במלואם או שהטכנולוגיה להנגשתם טרם נמצאה. אנו ממשיכים במאמצים תמידיים לשפר ולשדרג את הנגישות, כחלק ממחויבותנו לאפשר שימוש שוטף באתר לכלל האוכלוסייה.
              </p>
            </section>

            <section className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">יצירת קשר בנושא נגישות</h2>
              <p className="mb-4">
                אם במהלך הגלישה באתר נתקלתם בבעיית נגישות כלשהי, נשמח מאוד אם תפנו אלינו כדי שנוכל לטפל בבעיה במהירות האפשרית ולשפר את החוויה עבורכם ועבור שאר הגולשים.
              </p>
              
              <div className="space-y-2 font-medium">
                <p><strong>פרטי רכז/ת נגישות:</strong></p>
                <p>שם: [יוסף סבג]</p>
                <p>טלפון / וואטסאפ: <a href="https://wa.me/972506129664" dir="ltr" className="text-red-600 hover:underline">050-612-9664</a></p>
                <p>דוא"ל: <a href="mailto:onmotorparts@gmail.com" className="text-red-600 hover:underline">onmotorparts@gmail.com</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}