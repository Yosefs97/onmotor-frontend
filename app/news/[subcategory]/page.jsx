///app\news\[subcategory]\page.jsx
export const dynamic = 'force-dynamic'; // ✅ רינדור דינמי
import PageContainer from '@/components/PageContainer';
import CategoryPage from '@/components/CategoryPage';


const labelMap = {
  local: 'חדשות מקומיות',
  global: 'חדשות מהעולם',
  mechine: 'מכונות חדשות',
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
