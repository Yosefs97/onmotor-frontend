//components\SectionWithHeader.jsx
'use client';
import Link from 'next/link';
import { labelMap, linkLabelMap } from '@/utils/labelMap'; // ✅ ייבוא מרוכז

export default function SectionWithHeader({ title, href = '#', variant = 'home', backgroundImage = null }) {
  const titleHeb = labelMap[title] || title;
  const linkLabel = linkLabelMap[title] || 'לכל הכתבות';

  let containerClass = 'relative flex justify-between items-center px-4 py-2';
  let titleClass = 'text-lg font-bold transition duration-300';

  if (variant === 'main') {
    containerClass += ' border-b-4 border-[#e60000] bg-transparent max-w-screen-xl mx-auto';
    titleClass += ' text-black text-2xl md:text-3xl';
  } else {
    containerClass += ' bg-[#E5E5E5] border border-red-600 rounded max-w-screen-xl mx-auto';
    titleClass += ' text-gray-800 text-xl';
  }

  return (
    <div
      className={containerClass}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {backgroundImage && <div className="absolute inset-0 bg-black/50 z-0 rounded" />}
      <div className="relative z-10 w-full flex justify-between items-center">
        <Link href={href} prefetch={false}> 
          <h2 className={`${titleClass} cursor-pointer hover:text-red-600`}>{titleHeb}</h2>
        </Link>
        {href &&  variant !== 'main' && (
          <Link href={href} className="text-sm text-red-600 hover:underline" prefetch={false}>
            {linkLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
