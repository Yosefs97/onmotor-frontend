// app/articles/layout.js
import PageContainer from "@/components/PageContainer";

export default function ArticlesLayout({ children }) {
  return (
    <PageContainer
      title=""          // נשלט מדפי הכתבה
      breadcrumbs={[]}  // הכתבה עצמה תציג פירורי לחם משלה
    >
      {children}
    </PageContainer>
  );
}
