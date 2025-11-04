'use client';
import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/PageContainer';

export default function ArticlesLayout({ children }) {
  const [pageTitle, setPageTitle] = useState('');
  const [pageBreadcrumbs, setPageBreadcrumbs] = useState([]);

  return (
    <PageContainer title={pageTitle} breadcrumbs={pageBreadcrumbs}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          setPageTitle,
          setPageBreadcrumbs,
        })
      )}
    </PageContainer>
  );
}
