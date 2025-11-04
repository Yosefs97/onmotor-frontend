'use client';
import React, { createContext, useState } from 'react';

export const PageContext = createContext({
  pageTitle: '',
  pageBreadcrumbs: [],
  setPageTitle: () => {},
  setPageBreadcrumbs: () => {},
});

export function PageProvider({ children }) {
  const [pageTitle, setPageTitle] = useState('');
  const [pageBreadcrumbs, setPageBreadcrumbs] = useState([]);

  return (
    <PageContext.Provider value={{ pageTitle, setPageTitle, pageBreadcrumbs, setPageBreadcrumbs }}>
      {children}
    </PageContext.Provider>
  );
}
