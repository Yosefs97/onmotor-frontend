//app\blog\[subcategory]\page.jsx
export const dynamic = 'force-dynamic'; // ⬅️ מוסיף קוד רנדור דינמי (למנוע בעיות)

import PageContainer from '@/components/PageContainer';
import CategoryPage from '@/components/CategoryPage';

const labelMap = {
  podcast: 'אחד על אחד (פודקאסט)',
  'in-helmet': 'בקסדה',
  paper: 'על הנייר',
  tips: 'טיפים',
  guides: 'מדריכים',
  'guide-tech': 'מדריך טכני ותחזוקה',
  'guide-beginner': 'מדריך לרוכב המתחיל',
  'guide-advanced': 'מדריך לרוכב המתקדם',
};

export default async function BlogSubcategoryPage({ params }) {
  const subcategory = params.subcategory;
  const subcategoryLabel = labelMap[subcategory] || subcategory;

  return (
    <PageContainer
      title={`בלוג - ${subcategoryLabel}`}
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'בלוג', href: '/blog' },
        { label: subcategoryLabel },
      ]}
    >
      <CategoryPage categoryKey="blog" subcategoryKey={subcategory} />
    </PageContainer>
  );
}
