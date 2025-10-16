// app/blog/guides/[guide]/page.jsx
export const dynamic = 'force-dynamic';

import PageContainer from '@/components/PageContainer';
import CategoryPage from '@/components/CategoryPage';

const guideLabelMap = {
  'guide-tech': 'מדריך טכני ותחזוקה',
  'guide-beginner': 'מדריך לרוכב המתחיל',
  'guide-buy': 'מדריך קניית אופנוע יד 2',
  'guide-advanced': 'מדריך לרוכב המתקדם',
};

export default function GuideSubcategoryPage({ params }) {
  const guide = params.guide;
  const guideLabel = guideLabelMap[guide] || guide;

  return (
    <PageContainer
      title={`מדריכים  - ${guideLabel}`}
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'בלוג', href: '/blog' },
        { label: 'מדריכים', href: '/blog/guides' },
        { label: guideLabel },
      ]}
    >
      <CategoryPage
        categoryKey="blog"
        subcategoryKey="guides"
        guideSubKey={guide}    // ⬅️ חדש: מעביר תת־תת קטגוריה
      />
    </PageContainer>
  );
}
