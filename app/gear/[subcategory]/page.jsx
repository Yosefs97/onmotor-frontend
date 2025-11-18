//app\gear\[subcategory]\page.jsx

export const revalidate = 180; // ⬅️ ISR במקום force-dynamic
import PageContainer from '@/components/PageContainer';
import CategoryPage from '@/components/CategoryPage';

const labelMap = {
  offroad: 'שטח',
  road: 'כביש',
  adventure: "אדוונצ'ר",
  custom: 'קסטום',
};

export default async function GearSubcategoryPage({ params }) {
  const subcategory = params.subcategory;
  const subcategoryLabel = labelMap[subcategory] || subcategory;

  return (
    <PageContainer
      title={`ציוד - ${subcategoryLabel}`}
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'ציוד', href: '/gear' },
        { label: subcategoryLabel },
      ]}
    >
      <CategoryPage categoryKey="gear" subcategoryKey={subcategory} />
    </PageContainer>
  );
}
