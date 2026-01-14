///app\news\[subcategory]\page.jsx
export const revalidate = 180; 
import PageContainer from '@/components/PageContainer';
import CategoryPage from '@/components/CategoryPage';

const labelMap = {
  local: 'חדשות מקומיות',
  global: 'חדשות מהעולם',
  machine: 'מכונות חדשות',
  sport: 'חדשות ספורט',
};

export default async function NewsSubcategoryPage({ params }) {
  // 👇 השינוי: מחכים ל-params
  const resolvedParams = await params;
  const subcategory = resolvedParams.subcategory;
  
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