// /app/layout.js
import './globals.css';
import { AuthModalProvider } from '@/contexts/AuthModalProvider';
import ClientLayout from '@/components/ClientLayout';
import ZoomWrapper from '@/components/ZoomWrapper';
import ScrollToTopButton from '@/components/ScrollToTopButton';

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
            <ClientLayout>
              {children}
            </ClientLayout>
          </ZoomWrapper>
        </AuthModalProvider>
      </body>
    </html>
  );
}
