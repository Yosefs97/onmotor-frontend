//app\blog\[subcategory]\page.jsx
export const revalidate = 180;
import PageContainer from '@/components/PageContainer';
import CategoryPage from '@/components/CategoryPage';

const labelMap = {
  podcast: 'אחד על אחד (אנשים)',
  'in-helmet': 'בקסדה',
  paper: 'על הנייר',
  tips: 'טיפים',
  guides: 'מדריכים',
  'guide-tech': 'מדריך טכני ותחזוקה',
  'guide-beginner': 'מדריך לרוכב המתחיל',
  'guide-advanced': 'מדריך לרוכב המתקדם',
};

export default async function BlogSubcategoryPage({ params }) {
  // 👇 השינוי: מחכים ל-params
  const resolvedParams = await params;
  const subcategory = resolvedParams.subcategory;

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