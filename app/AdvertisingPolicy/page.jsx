// app/AdvertisingPolicy/page.jsx
import React from 'react';

export const metadata = {
  title: 'מדיניות פרסום | OnMotor Media',
  robots: 'noindex', // מומלץ אם זה דף משפטי פנימי שלא רוצים שיאונדקס כתוכן ראשי
};

export default function AdvertisingPolicyPage() {
  return (
    <div dir="rtl" className="max-w-3xl mx-auto p-6 bg-white min-h-screen text-gray-800">
      <h1 className="text-3xl font-bold text-[#e60000] mb-6">מדיניות פרסום והטבות</h1>
      
      <div className="space-y-4 text-sm md:text-base leading-relaxed">
        <section>
          <h2 className="font-bold text-lg mb-2">1. כללי</h2>
          <p>
            מדיניות זו חלה על כל מפרסם או בעל עסק המבקש לקבל שירותי פרסום, בין אם בתשלום ובין אם כהטבה ללא עלות ("חינם"), באתר OnMotor Media.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2">2. הטבת פרסום ללא עלות</h2>
          <p>
            האתר מציע מעת לעת הטבות פרסום לבעלי עסקים בתחום הדו-גלגלי. הנהלת האתר שומרת לעצמה את הזכות הבלעדית:
          </p>
          <ul className="list-disc list-inside pr-4">
            <li>להחליט אילו עסקים יאושרו לפרסום.</li>
            <li>לקבוע את משך תקופת הפרסום החינמי.</li>
            <li>להסיר כל פרסום בכל עת וללא הודעה מוקדמת, לפי שיקול דעתה הבלעדי.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2">3. אחריות המפרסם</h2>
          <p>
            בעל העסק מצהיר כי כל המידע שהוא מוסר לאתר הינו נכון, מדויק ואינו מפר זכויות יוצרים או סימני מסחר של צד שלישי. האחריות הבלעדית על תוכן המודעה חלה על המפרסם בלבד.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2">4. השארת פרטים</h2>
          <p>
            בהשארת פרטים בטופס הפרסום, הנך מאשר לנציגי האתר ליצור עמך קשר טלפוני, בוואטסאפ או במייל לצורך תיאום הפרסום או הצעות שיווקיות רלוונטיות.
          </p>
        </section>
      </div>
    </div>
  );
}