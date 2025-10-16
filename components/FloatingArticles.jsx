//מקושר  ל(pagecontabt layout) לא נבדק לא בשימוש
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const articles = [
  {
    title: 'מבצע קסדה + מעיל',
    description: 'המבצע הכי שווה של העונה לרוכבים מתחילים – לא לפספס!',
    image: '/images/deal1.jpg',
    link: '/articles/deal-helmet-jacket',
  },
  {
    title: 'מה עדיף לנסיעה עירונית?',
    description: '125 סמק מול 300 – ההבדלים, היתרונות והחסרונות.',
    image: '/images/comparison.jpg',
    link: '/articles/125-vs-300',
  },
  {
    title: 'אביזרים חדשים ל־2025',
    description: 'מהפכה בתחום המראות, הגריפים והכפפות – סקירה חמה.',
    image: '/images/accessories.jpg',
    link: '/articles/accessories-2025',
  },
];

export default function FloatingArticles() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % articles.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (i) => setIndex(i);
  const current = articles[index];

  return (
    <div className="w-72 p-4 bg-white rounded shadow-md transition-all duration-700 ease-in-out">
      <Link href={current.link}>
        <div className="cursor-pointer">
          <Image
            src={current.image}
            alt={current.title}
            width={288} height={160}
            className="w-full h-40 object-cover rounded mb-3"
          />
          <h3 className="text-lg font-bold text-[#e60000]">{current.title}</h3>
          <p className="text-sm text-gray-700 mt-1">{current.description}</p>
        </div>
      </Link>
      <div className="flex justify-center gap-2 mt-3">
        {articles.map((_, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`w-2.5 h-2.5 rounded-full ${i === index ? 'bg-[#e60000]' : 'bg-gray-300'}`}
          ></button>
        ))}
      </div>
    </div>
  );
}
