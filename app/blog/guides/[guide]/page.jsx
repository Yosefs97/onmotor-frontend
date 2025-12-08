// app/blog/guides/[guide]/page.jsx
export const revalidate = 180;

import PageContainer from '@/components/PageContainer';
import CategoryPage from '@/components/CategoryPage';

const guideLabelMap = {
  'guide-tech': 'מדריך טכני ותחזוקה',
  'guide-beginner': 'מדריך לרוכב המתחיל',
  'guide-advanced': 'מדריך לרוכב המתקדם',
};

// 👇 הוספתי async לפונקציה
export default async function GuideSubcategoryPage({ params }) {
  // 👇 השינוי: מחכים ל-params
  const resolvedParams = await params;
  const guide = resolvedParams.guide;

  const guideLabel = guideLabelMap[guide] || guide;

  return (
    <PageContainer
      title={`מדריכים - ${guideLabel}`}
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
        guideSubKey={guide} 
      />
    </PageContainer>
  );
}