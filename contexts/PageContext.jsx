//contexts/PageContext.jsx
'use client';
import { createContext, useContext, useState } from 'react';

const PageContext = createContext({
  title: '',
  breadcrumbs: [],
  setTitle: () => {},
  setBreadcrumbs: () => {},
});

export function PageProvider({ children }) {
  const [title, setTitle] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  return (
    <PageContext.Provider value={{ title, breadcrumbs, setTitle, setBreadcrumbs }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  return useContext(PageContext);
}
