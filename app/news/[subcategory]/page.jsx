///app\news\[subcategory]\page.jsx
export const revalidate = 180; // ⬅️ ISR במקום force-dynamic
import PageContainer from '@/components/PageContainer';
import CategoryPage from '@/components/CategoryPage';


const labelMap = {
  local: 'חדשות מקומיות',
  global: 'חדשות מהעולם',
  machine: 'מכונות חדשות',
};

export default async function NewsSubcategoryPage({ params }) {
  const subcategory = params.subcategory;
  const subcategoryLabel = labelMap[subcategory] || subcategory;

  return (
    <PageContainer
      title={`חדשות - ${subcategoryLabel}`}
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'חדשות', href: '/news' },
        { label: subcategoryLabel },
      ]}
    > 
        <CategoryPage categoryKey="news" subcategoryKey={subcategory} />
    </PageContainer>
  );
}
