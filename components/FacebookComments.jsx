//components\FacebookComments.jsx
'use client';
import { useEffect } from 'react';

export default function FacebookComments({ url }) {
  useEffect(() => {
    // אם ה-SDK כבר קיים, מנסה לעבד מחדש את האלמנטים
    if (window.FB && window.FB.XFBML) {
      window.FB.XFBML.parse();
    } else {
      // מאזין לטעינה של פייסבוק אם עדיין לא נטען
      const checkFB = setInterval(() => {
        if (window.FB && window.FB.XFBML) {
          window.FB.XFBML.parse();
          clearInterval(checkFB);
        }
      }, 500);

      // ביטול במקרה שהרכיב הוסר לפני שה-SDK נטען
      return () => clearInterval(checkFB);
    }
  }, [url]); // רינדור מחדש אם הכתובת משתנה

  return (
    <div className="mt-8">
      <div
        className="fb-comments"
        data-href={url}
        data-width="100%"
        data-numposts="5"
        data-order-by="reverse_time"
      />
    </div>
  );
}
