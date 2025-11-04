//app\articles\layout.js
'use client';
import PageContainer from "@/components/PageContainer";
import { PageProvider, usePage } from "@/contexts/PageContext";

export default function ArticlesLayout({ children }) {
  return (
    <PageProvider>
      <PageContainerWrapper>{children}</PageContainerWrapper>
    </PageProvider>
  );
}

function PageContainerWrapper({ children }) {
  const { title, breadcrumbs } = usePage();

  return (
    <PageContainer title={title} breadcrumbs={breadcrumbs}>
      {children}
    </PageContainer>
  );
}
