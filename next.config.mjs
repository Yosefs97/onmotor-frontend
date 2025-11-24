// onmotor-frontend/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 👇 1. הגדרת זיכרון צד-לקוח (Client Router Cache)
  // זה יגרום לכך שגולש שעובר בין דפים לא ישלח בקשה לשרת אם הוא חוזר לדף שביקר בו ב-5 הדקות האחרונות.
  experimental: {
    staleTimes: {
      dynamic: 300, // 5 דקות (עבור דפי כתבות, חדשות וכו')
      static: 600,  // 10 דקות (עבור דפים קבועים כמו אודות, צור קשר)
    },
  },

  images: {
    unoptimized: true, // ✅ ביטול אופטימיזציית תמונות (חוסך עיבוד שרת, אך קבצים כבדים יותר)
    domains: [
      "localhost",
      "cdn.shopify.com",
      "www.onmotormedia.com",
      "i.ytimg.com",
      "img.youtube.com",
      "*.tiktokcdn.com", // הערה: בשימוש עם כוכביות עדיף להשתמש ב-remotePatterns, אבל זה יעבוד
      "*.tiktokcdn-us.com",
      "*.tiktokcdn-va.com",
      "*.cdninstagram.com",
      "*.fbcdn.net",
      "pbs.twimg.com",
      "*.twimg.com",
      "*.googleusercontent.com",
      "lh3.googleusercontent.com",
      "fullgaz.co.il",
      "www.fullgaz.co.il",
      "press.ktm.com",
      "res.cloudinary.com",
      "onmotormedia.com",
      "husqvarna-motorcycles.com",
      "gasgas.com",
      "ducati.com",
      "global.yamaha-motor.com",
      "hondanews.eu",
      "yamaha-motor.eu",
      "honda.com",
      "bmw-motorrad.com",
    ],
  },
};

export default nextConfig;