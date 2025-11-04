'use client';
import React, { useState } from 'react';
import PageContainer from '@/components/PageContainer';

export default function ArticlesLayout({ children }) {
  const [pageTitle, setPageTitle] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  return (
    <PageContainer title={pageTitle} breadcrumbs={breadcrumbs}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { setPageTitle, setBreadcrumbs })
      )}
    </PageContainer>
  );
}
