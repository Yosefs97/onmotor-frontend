'use client';
import { useState, useEffect } from "react";
import PageContainer from "@/components/PageContainer";

export default function ArticlesLayout({ children }) {
  const [pageTitle, setPageTitle] = useState("");
  const [pageBreadcrumbs, setPageBreadcrumbs] = useState([]);

  return (
    <PageContainer title={pageTitle} breadcrumbs={pageBreadcrumbs}>
      {children &&
        // כאן נעטוף את הילדים ונעביר להם setter functions
        // כך שהעמוד הפנימי יכול לעדכן את הכותרת והפירורים
        React.cloneElement(children, {
          setPageTitle,
          setPageBreadcrumbs,
        })}
    </PageContainer>
  );
}
