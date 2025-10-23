// /app/layout.js
import './globals.css';
import { AuthModalProvider } from '@/contexts/AuthModalProvider';
import ClientLayout from '@/components/ClientLayout';
import ZoomWrapper from '@/components/ZoomWrapper';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import Script from 'next/script';

export const metadata = {
  title: 'OnMotor Media',
  description: 'מגזין הדו-גלגלי',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="pt-[0px] flex flex-col min-h-screen">
        <AuthModalProvider>
          <ScrollToTopButton />
          <ZoomWrapper>
            <ClientLayout>{children}</ClientLayout>
          </ZoomWrapper>
        </AuthModalProvider>

        {/* 🟦 תוסף נגיש לי - גרסה 2.3 */}
        <Script src="/nagishli/nagishli.js" strategy="afterInteractive" />
        <Script id="nagishli-init" strategy="afterInteractive">
          {`
            window.addEventListener("load", function() {
              window.NagishLiConfig = {
                version: "2.3",
                language: "he",
                // הגדרת מיקום משתנה: שמאל למטה + קיזוז למעלה
                position: "bl", // Bottom Left - המיקום הדיפולטי
                bottomOffset: "50px", // שינוי: קיזוז של 50 פיקסלים מהתחתית
                
                color: "blue",
                compact: false,
                accordion: false,
                closeButton: true, // שינוי: הוספת כפתור סגירה (X)
                
                declarationLink: "https://www.onmotormedia.com/accessibility-statement.html",
                declarationName: "סבג יוסף",
                declarationPhone: "0522304604",
                declarationEmail: "onmotormedia@gmail.com",
                declarationFax: "",
                assetsFolder: "https://www.onmotormedia.com/nagishli/"
              };
              if (typeof window.nagishliInit === "function") {
                window.nagishliInit(window.NagishLiConfig);
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
}