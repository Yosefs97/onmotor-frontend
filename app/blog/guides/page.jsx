// app/blog/guides/page.jsx
export const dynamic = 'force-dynamic';

import PageContainer from '@/components/PageContainer';
import CategoryPage from '@/components/CategoryPage';

export default function GuidesPage() {
  return (
    <PageContainer
      title="בלוג - מדריכים"
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'בלוג', href: '/blog' },
        { label: 'מדריכים' },
      ]}
    >
      {/* יציג את כל המדריכים; אתה יכול בתוך CategoryPage לקבץ/לסנן/להציג לפי תתי־תת */}
      <CategoryPage categoryKey="blog" subcategoryKey="guides" />
    </PageContainer>
  );
}
