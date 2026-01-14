
export const revalidate = 180; // ⬅️ ISR במקום force-dynamic
import PageContainer from '@/components/PageContainer';
import CategoryPage from '@/components/CategoryPage';

const labelMap = {
  gear: 'ציוד',
  motorcycles: 'אופנועי מערכת',
  video: 'סקירות וידאו',
  motorcyclestests : 'מבחני דרכים',

};

export default async function ReviewsSubcategoryPage({ params }) {
  // 👇 השינוי: חייבים לעשות await ל-params בגרסה 15
  const resolvedParams = await params;
  const subcategory = resolvedParams.subcategory;
  
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