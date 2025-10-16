// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // 🔹 Strapi (לוקאל)
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },

      // 🔹 Shopify
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },

      // 🔹 YouTube (רגיל + Shorts)
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },

      // 🔹 TikTok
      {
        protocol: "https",
        hostname: "*.tiktokcdn.com",
      },
      {
        protocol: "https",
        hostname: "*.tiktokcdn-us.com",
      },
      {
        protocol: "https",
        hostname: "*.tiktokcdn-va.com",
      },

      // 🔹 Instagram / Facebook
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
      },

      // 🔹 Twitter (X)
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "*.twimg.com",
      },

      // 🔹 Googleusercontent
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },

      // 🔹 Fullgaz
      {
        protocol: "https",
        hostname: "fullgaz.co.il",
      },
      {
        protocol: "https",
        hostname: "www.fullgaz.co.il",
      },

      // 🔹 כללית – לכל דומיין https
      {
        protocol: "https",
        hostname: "**",
      },
      // 🔹 כללית – לכל דומיין http
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
