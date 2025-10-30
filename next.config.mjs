/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // ✅ ביטול מוחלט של Next.js Image Optimization
    domains: [
      "localhost",
      "cdn.shopify.com",
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
      "yamaha-motor.eu",
      "honda.com",
      "bmw-motorrad.com",
    ],
  },
};

export default nextConfig;
