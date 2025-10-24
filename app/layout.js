// /app/layout.js
import './globals.css';
import { AuthModalProvider } from '@/contexts/AuthModalProvider';
import ClientLayout from '@/components/ClientLayout';

import ScrollToTopButton from '@/components/ScrollToTopButton';
import Script from 'next/script'; // הייבוא הזה כבר היה קיים וטוב
import { Heebo } from 'next/font/google'; // ייבוא חדש לפונט

// הגדרת הפונט לפי הכללים של Next.js
const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'OnMotor Media',
  description: 'מגזין הדו-גלגלי',
};

export default function RootLayout({ children }) {
  return (
    // הוספנו את הפונט ל-className של ה-html
    <html lang="he" dir="rtl" className={heebo.className}>
      {/* מחקנו את התג <head>... </head> שהיה פה. 
        Next.js מנהל את ה-head בעצמו. 
      */}
      <body className="pt-[0px] flex flex-col min-h-screen">
        <AuthModalProvider>
          <ScrollToTopButton />
          
            <ClientLayout>{children}</ClientLayout>
          
        </AuthModalProvider>

        {/* זה התיקון הקריטי: 
          החלפנו את <script>... ב- <Script>... (אות גדולה)
          וסגרנו את התג כמו רכיב ריאקט.
        */}
        <Script src="https://cdn.enable.co.il/licenses/enable-L491236ornf8p4x2-1025-75004/init.js" />
      </body>
    </html>
  );
}