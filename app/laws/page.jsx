// app/laws/page.jsx
import React from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';

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
      <div className="text-gray-800 grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 ">
        {categories.map((cat, index) => (
          <Link 
            key={index} 
            href={cat.href}
            className="text-gray-800 block p-6 border border-gray-200 rounded-lg hover:border-[#e60000] hover:shadow-md transition-all group"
          >
            <h2 className="text-xl font-bold mb-2 group-hover:text-[#e60000]">{cat.title}</h2>
            <p className="text-gray-600">{cat.desc}</p>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}