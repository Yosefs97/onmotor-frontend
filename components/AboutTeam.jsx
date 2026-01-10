'use client';
import React from 'react';
import Image from 'next/image';
import { FaFacebook, FaInstagram } from 'react-icons/fa';

const teamMembers = [
  {
    name: 'אסף אפרים',
    age: 29,
    role: 'בוחן, רוכב ועורך תוכן',
    bio: 'רוכב על דו גלגלי על שלל סוגיו מגיל 16, במקצועו מכונאי אופנועים. תפקידו באתר - רוכב בוחן , כותב ועורך כתבות במגזין.',
    image: 'https://res.cloudinary.com/ddhq0mwiz/image/upload/v1767614731/IMG_20251218_22192370_em13qp.jpg',
    social: {
      facebook: 'https://www.facebook.com/asaf.efraim.2025',
      instagram: 'https://www.instagram.com/asaf_efraim/',
    }
  },
  {
    name: 'יוסף סבג',
    age: 28,
    role: 'עורך ראשי',
    bio: 'רוכב על דו-גלגלי על שלל סוגיו מגיל 14. במקצועו מהנדס מכונות. הקים את המגזין מתוך תשוקה להנגיש מידע מקצועי ואיכותי לרוכב הישראלי.',
    image: 'https://res.cloudinary.com/ddhq0mwiz/image/upload/v1767617105/IMG_20260105_144428_jmtnpu.jpg',
    social: {
      facebook: 'https://www.facebook.com/yosef.sabag.552533/',
      instagram: 'https://www.instagram.com/yos.sab97/',
    }
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
          {/* תמונה */}
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
          <div className="p-6 flex flex-col flex-grow relative">
            
            {/* שם + גיל בסוגריים */}
            <h3 className="text-xl font-bold text-gray-900 mb-1">
                {member.name} <span className="font-medium text-gray-500 text-lg">({member.age})</span>
            </h3>

            {/* תפקיד */}
            <span className="text-[#e60000] font-bold text-sm mb-3 block border-b border-gray-100 pb-2 w-fit">
              {member.role}
            </span>

            {/* ביוגרפיה */}
            <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
              {member.bio}
            </p>

            {/* רשתות חברתיות */}
            <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-50">
                {member.social.facebook && (
                    <a 
                        href={member.social.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#1877F2] transition-colors"
                        aria-label={`פייסבוק של ${member.name}`}
                    >
                        <FaFacebook size={20} />
                    </a>
                )}
                {member.social.instagram && (
                    <a 
                        href={member.social.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#E4405F] transition-colors"
                        aria-label={`אינסטגרם של ${member.name}`}
                    >
                        <FaInstagram size={20} />
                    </a>
                )}
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}