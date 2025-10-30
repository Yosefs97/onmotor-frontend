// /app/layout.js
import './globals.css';
import { AuthModalProvider } from '@/contexts/AuthModalProvider';
import ClientLayout from '@/components/ClientLayout';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import Script from 'next/script';
import { Heebo } from 'next/font/google';

// הגדרת הפונט לפי הכללים של Next.js
const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

// 🧩 מידע שמסייע לגוגל להציג את הלוגו שלך
export const metadata = {
  title: 'OnMotor Media',
  description: 'מגזין הרוכבים של ישראל – חדשות, סקירות, מדריכים וקהילה',
  icons: {
    icon: '/OnMotorLogonoback.png',
    shortcut: '/OnMotorLogonoback.png',
    apple: '/OnMotorLogonoback.png',
  },
  openGraph: {
    title: 'OnMotor Media',
    description: 'מגזין הרוכבים של ישראל',
    url: 'https://www.onmotormedia.com',
    siteName: 'OnMotor Media',
    images: [
      {
        url: 'https://www.onmotormedia.com/OnMotorLogonoback.png',
        width: 800,
        height: 800,
        alt: 'OnMotor Media Logo',
      },
    ],
    locale: 'he_IL',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl" className={heebo.className}>
      <head>
        {/* 🧠 Structured Data - עוזר לגוגל לזהות את הלוגו שלך */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "OnMotor Media",
              "url": "https://www.onmotormedia.com",
              "logo": "https://www.onmotormedia.com/OnMotorLogonoback.png",
            }),
          }}
        />
      </head>

      <body className="pt-[0px] flex flex-col min-h-screen">
        <AuthModalProvider>
          <ScrollToTopButton />
          <ClientLayout>{children}</ClientLayout>
        </AuthModalProvider>

        {/* תוסף הנגישות */}
        <Script src="https://cdn.enable.co.il/licenses/enable-L491236ornf8p4x2-1025-75004/init.js" />
      </body>
    </html>
  );
}
