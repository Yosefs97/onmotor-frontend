//components\ArticlePageClientBridge.jsx
'use client';
import { useContext, useEffect } from 'react';
import { PageContext } from '@/contexts/PageContext'; // אם אין לך את זה, נעדכן עוד רגע

export default function ArticlePageClientBridge({ title, breadcrumbs }) {
  const { setPageTitle, setPageBreadcrumbs } = useContext(PageContext);

  useEffect(() => {
    if (setPageTitle) setPageTitle(title);
    if (setPageBreadcrumbs) setPageBreadcrumbs(breadcrumbs);
  }, [title, breadcrumbs, setPageTitle, setPageBreadcrumbs]);

  return null;
}
