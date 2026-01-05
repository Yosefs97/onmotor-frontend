// components/AboutTeam.jsx
'use client';
import React from 'react';
import Image from 'next/image';

const teamMembers = [
  {
    name: 'יוסף סבג',
    role: 'מייסד ועורך ראשי',
    bio: 'רוכב על דו-גלגלי על שלל סוגיו מגיל 14. הקים את המגזין מתוך תשוקה להנגיש מידע מקצועי ואיכותי לרוכב הישראלי ולפתח את תרבות הרכיבה בישראל.',
    image: '/images/team/yosef.jpg', // 📸 דאג להחליף לנתיב תמונה אמיתי
  },
  {
    name: 'אסף אפריים',
    role: 'בוחן, רוכב ועורך תוכן',
    bio: 'חי את עולם האופנועים מגיל 16. מביא איתו ידע טכני מעמיק כמכונאי מקצועי וניסיון עשיר בהדרכה כמדריך רכיבה מוסמך. אחראי על מבחני הדרכים והסקירות הטכניות במגזין.',
    image: '/images/team/asaf.jpg', // 📸 דאג להחליף לנתיב תמונה אמיתי
  },
];

export default function AboutTeam() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      {teamMembers.map((member, index) => (
        <div 
          key={index} 
          className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
        >
          <div className="flex flex-col sm:flex-row h-full">
            {/* תמונת פרופיל */}
            <div className="relative w-full sm:w-1/3 h-64 sm:h-auto bg-gray-200">
              {/* החלף את ה-div הזה ב-Image כשיש לך תמונות */}
               <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                  <Image 
                    src={member.image} 
                    alt={member.name}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                    // במקרה שאין תמונה עדיין, אפשר להשתמש בזה זמנית:
                    onError={(e) => { e.target.style.display = 'none'; }} 
                  />
                  <span className="absolute">תמונה</span>
               </div>
            </div>

            {/* טקסט */}
            <div className="p-6 flex flex-col justify-center sm:w-2/3">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {member.name}
              </h3>
              <span className="text-[#e60000] font-bold text-sm mb-3 block border-b border-gray-100 pb-2 w-fit">
                {member.role}
              </span>
              <p className="text-gray-600 text-sm leading-relaxed">
                {member.bio}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}