// app/laws/page.jsx
import React from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import ServiceProvidersSection from '@/components/ServiceProvidersSection';

export const metadata = {
  title: 'חוקים ומשפט | OnMotor Media',
  description: 'ריכוז מידע בנושאי חוקי תעבורה, ספר החוקים של הרלב"ד וכתבות בנושא חוקיות.',
};

export default function LawsPage() {
  const categories = [
    { title: 'כתבות בנושא חוקיות', href: '/laws/legal-articles', desc: 'מאמרים, עדכונים וחדשות בנושאי חוק ומשפט לרוכבים.' },
    { title: 'שאל את הרלב"ד', href: '/laws/ask-question', desc: 'יש לך שאלה? מומחי הרלב"ד עונים לשאלות הגולשים.' },
    { title: 'ספר החוקים - רלב״ד', href: '/laws/book', desc: 'עיון מלא בספר החוקים ותקנות התעבורה.' },
  ];

  return (
    <PageContainer
      title="חוקים ומשפט"
      breadcrumbs={[{ label: 'דף הבית', href: '/' }, { label: 'חוקים' }]}
    >
      {/* אזור הקטגוריות העליון - מרווחים מצומצמים */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mt-1 mb-1">
        {categories.map((cat, index) => (
          <Link 
            key={index} 
            href={cat.href}
            className="block p-1 border border-gray-200 rounded-xl transition-all group hover:border-[#e60000] hover:shadow-lg bg-white"
          >
            <h2 className="text-xl font-bold mb-1 text-[#e60000] md:text-gray-900 group-hover:text-[#e60000]">
              {cat.title}
            </h2>
            <p className="text-[#e60000] md:text-gray-600 leading-relaxed text-sm">
              {cat.desc}
            </p>
          </Link>
        ))}
      </div>

      {/* אזור נותני השירות (נטען מהרכיב המשותף) */}
      <ServiceProvidersSection />
    </PageContainer>
  );
}