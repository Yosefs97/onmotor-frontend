// components/SectionWithHeader.jsx
'use client';
import Link from 'next/link';
import { labelMap, linkLabelMap } from '@/utils/labelMap'; // ✅ ייבוא מרוכז

export default function SectionWithHeader({ title, href = '#', variant = 'home', backgroundImage = null }) {
  const titleHeb = labelMap[title] || title;
  const linkLabel = linkLabelMap[title] || 'לכל הכתבות';

  // 👇 ריווח ועיצוב בסיסי שמתאים לתצוגה החדשה
  let containerClass = 'relative flex justify-between items-center px-4 py-3 max-w-screen-xl mx-auto';
  let titleClass = 'font-black uppercase tracking-tightish transition-colors duration-300';

  if (variant === 'main') {
    // 🔴 עיצוב לכותרת ראשית (ללא רקע מלא, רק קו תחתון מודגש)
    containerClass += ' border-b-2 border-om-ember bg-transparent mb-4';
    titleClass += ' text-white text-3xl md:text-5xl';
  } else {
    // 🔘 עיצוב לקטגוריות משניות (פס כהה, כמו בדף הראשי)
    containerClass += ' bg-om-asphalt border-y border-om-steel';
    titleClass += ' text-white text-2xl md:text-3xl';
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
      {backgroundImage && <div className="absolute inset-0 bg-om-void/80 z-0" />}
      
      <div className="relative z-10 w-full flex justify-between items-center">
        <Link href={href} prefetch={false}> 
          <h2 className={`${titleClass} cursor-pointer hover:text-om-ember`}>{titleHeb}</h2>
        </Link>
        
        {href && variant !== 'main' && (
          // 👇 הלינק עודכן לעיצוב ה-Racing של האתר עם הצבעים הנכונים
          <Link 
            href={href} 
            className="text-[10px] md:text-xs font-black tracking-racing uppercase text-om-ember hover:text-om-blaze transition-colors duration-300" 
            prefetch={false}
          >
            {linkLabel}
          </Link>
        )}
      </div>
    </div>
  );
}