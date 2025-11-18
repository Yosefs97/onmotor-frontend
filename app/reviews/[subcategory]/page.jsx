
export const revalidate = 180; // ⬅️ ISR במקום force-dynamic
import PageContainer from '@/components/PageContainer';
import CategoryPage from '@/components/CategoryPage';

const labelMap = {
  gear: 'ציוד',
  motorcycles: 'אופנועים',
  video: 'סקירות וידאו',
};

export default async function ReviewsSubcategoryPage({ params }) {
  const subcategory = params.subcategory;
  const subcategoryLabel = labelMap[subcategory] || subcategory;

  return (
    <PageContainer
      title={`סקירות - ${subcategoryLabel}`}
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'סקירות', href: '/reviews' },
        { label: subcategoryLabel },
      ]}
    >
      <CategoryPage categoryKey="reviews" subcategoryKey={subcategory} />
    </PageContainer>
  );
}
