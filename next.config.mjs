// onmotor-frontend/next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 👇 1. הגדרת זיכרון צד-לקוח (Client Router Cache)
  experimental: {
    staleTimes: {
      dynamic: 300, // 5 דקות
      static: 600,  // 10 דקות
    },
  },

  images: {
    unoptimized: true, // ביטול אופטימיזציה (חוסך מעבד)
    
    // 👇 2. תוספת חשובה: מכריח את Next.js להגדיר זמן חיים ארוך לתמונות
    minimumCacheTTL: 31536000, 

    domains: [
      "localhost",
      "cdn.shopify.com",
      "www.onmotormedia.com",
      "i.ytimg.com",
      "img.youtube.com",
      "*.tiktokcdn.com", 
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

  // 👇 3. חומת המגן: כותרות Cache אגרסיביות
  // זה ימנע מהדפדפן לשלוח בקשות "בדיקה" (304) על תמונות וקבצים סטטיים
  async headers() {
    return [
      {
        // חל על כל סוגי התמונות והפונטים
        source: '/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico|woff|woff2|ttf|eot)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // שמור לשנה!
          },
        ],
      },
      {
        // חל על סקריפטים ועיצוב (אם הם בתיקיית public)
        source: '/:all*(js|css)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;