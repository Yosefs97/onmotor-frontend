//app/layout.js

import './globals.css';
import { AuthModalProvider } from '@/contexts/AuthModalProvider';
import ClientLayout from '@/components/ClientLayout';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import Script from 'next/script';
import { Heebo } from 'next/font/google';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

//  ========= ⬇️ התיקון כאן ⬇️ =========
// החזרנו את אובייקט המטא-דאטה הראשי.
// זה ישמש כברירת מחדל, והכתבות ידרסו אותו נקודתית.
export const metadata = {
  metadataBase: new URL("https://www.onmotormedia.com"),
  title: {
    default: "OnMotor Media - מגזין הרוכבים של ישראל",
    template: "%s | OnMotor Media",
  },
  description: "מגזין הרוכבים של ישראל – חדשות, סקירות, מדריכים וקהילה",
  openGraph: {
    title: "OnMotor Media",
    description: "מגזין הרוכבים של ישראל – חדשות, סקירות, מדריכים וקהילה",
    url: "https://www.onmotormedia.com",
    siteName: "OnMotor Media",
    images: [
      {
        url: "https://www.onmotormedia.com/full_Logo.jpg", // שימוש בלוגו הגדול
        width: 1200,
        height: 630,
        alt: "OnMotor Media Logo"
      },
    ],
    locale: "he_IL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OnMotor Media",
    description: "מגזין הרוכבים של ישראל – חדשות, סקירות, מדריכים וקהילה",
    images: ["https://www.onmotormedia.com/full_Logo.jpg"],
  },
};
//  ========= ⬆️ התיקון כאן ⬆️ =========


export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl" className={heebo.className}>
      <head>
        {/* Structured Data - עוזר לגוגל לזהות את הלוגו שלך */}
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

      <body className="flex flex-col min-h-screen">
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