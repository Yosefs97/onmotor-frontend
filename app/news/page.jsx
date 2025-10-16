//app\news\page.jsx

import PageContainer from '@/components/PageContainer';
import CategoryPage from '@/components/CategoryPage';



export default function NewsPage() {
  return (
    <PageContainer
      title="חדשות"
      breadcrumbs={[
        { label: 'דף הבית', href: '/' },
        { label: 'חדשות' }
      ]}
    >
      <CategoryPage categoryKey="news" />
    </PageContainer>
  );
}
