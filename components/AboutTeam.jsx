'use client';
import React from 'react';
import Image from 'next/image';

const teamMembers = [
  {
    name: 'אסף אפרים',
    role: 'בוחן, רוכב ועורך תוכן',
    bio: 'רוכב על דו גלגלי על שלל סוגיו מגיל 16, במקצועו מכונאי אופנועים. תפקידו באתר - רוכב בוחן , כותב ועורך כתבות במגזין.',
    image: 'https://res.cloudinary.com/ddhq0mwiz/image/upload/v1767614731/IMG_20251218_22192370_em13qp.jpg',
  },
  {
    name: 'יוסף סבג',
    role: 'עורך ראשי',
    bio: 'רוכב על דו-גלגלי על שלל סוגיו מגיל 14. במקצועו מהנדס מכונות. הקים את המגזין מתוך תשוקה להנגיש מידע מקצועי ואיכותי לרוכב הישראלי.',
    image: 'https://res.cloudinary.com/ddhq0mwiz/image/upload/v1767617105/IMG_20260105_144428_jmtnpu.jpg',
  },
];

export default function AboutTeam() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      {teamMembers.map((member, index) => (
        <div 
          key={index} 
          className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col h-full"
        >
          {/* 📸 התאמה לתמונות אופקיות:
             השתמשנו ב-aspect-[4/3] כדי לשמור על פרופורציה רחבה.
             object-top מבטיח שאם יש חיתוך, הוא לא יחתוך את הראש.
          */}
          <div className="relative w-full aspect-[4/3] bg-gray-100">
             <Image 
               src={member.image} 
               alt={member.name}
               fill
               sizes="(max-width: 768px) 100vw, 50vw"
               className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
             />
          </div>

          {/* תוכן הטקסט */}
          <div className="p-6 flex flex-col flex-grow">
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
      ))}
    </div>
  );
}