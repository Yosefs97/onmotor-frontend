// /components/LawBookAnswer.jsx
'use client';
import React, { useEffect, useState } from 'react';

export default function LawBookAnswer({ questionId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    // כאן בעתיד תוכל למשוך מה-DB לפי ID – כעת דמה בלבד
    setData({
      question: 'האם מותר לרכב עם מצלמה על הקסדה?',
      answer: 'מותר כל עוד לא חורגים מהוראות תקן 4241. מומלץ לבדוק מול גורמי רישוי.'
    });
  }, [questionId]);

  if (!data) return <p>טוען...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">❓ {data.question}</h1>
      <div className="p-4 bg-gray-100 rounded">
        <p className="leading-relaxed">🧠 {data.answer}</p>
      </div>
    </div>
  );
}