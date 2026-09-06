// components/FeaturedProducts.jsx
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function formatPrice(product) {
  let amount = 
    product.priceRange?.minVariantPrice?.amount || 
    product.price || 
    product.variants?.edges?.[0]?.node?.price?.amount; 

  let currency = 
    product.priceRange?.minVariantPrice?.currencyCode || 
    product.variants?.edges?.[0]?.node?.price?.currencyCode || 
    'ILS';

  if (!amount) return null;

  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function ProductCard({ product, priority = false, className = '' }) {
  if (!product) return null;
  const price = formatPrice(product);

  const imageUrl = 
    product.featuredImage?.url || 
    product.image || 
    product.images?.edges?.[0]?.node?.url || 
    (Array.isArray(product.images) && product.images[0]?.url) || 
    '';

  const imageAlt = 
    product.featuredImage?.altText || 
    product.images?.edges?.[0]?.node?.altText || 
    product.title;

  return (
    <Link
      href={`/shop/${product.handle}`}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl ${className}`}
    >
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-zinc-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            loading={priority ? 'eager' : 'lazy'}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-200 text-zinc-400 text-xs">
            אין תמונה
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-black/75 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          {product.vendor || 'מומלץ'}
        </span>
      </div>
      
      {/* ריווח פנימי עדין יותר במובייל (p-3) */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
        <h3 
          // טקסט קטן יותר במובייל (text-sm)
          className="min-h-10 sm:min-h-12 text-sm sm:text-base font-extrabold leading-snug text-zinc-900 line-clamp-2"
          title={product.title}
        >
          {product.title}
        </h3>
        
        {/* מרווחים מוקטנים בין המחיר לכפתור במובייל (gap-1.5) */}
        <div className="mt-auto flex items-center justify-between gap-1.5 sm:gap-3 pt-3 overflow-hidden">
          <span className="text-base sm:text-lg font-black text-[#e60000] whitespace-nowrap">
            {price || 'לפרטים'}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs sm:text-sm font-bold text-zinc-700 transition group-hover:text-[#e60000] whitespace-nowrap">
            למוצר <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedProducts({ 
  products = [], 
  targetTag, 
  targetVendor, 
  randomize = false, 
  title = 'מוצרים שכדאי להכיר עכשיו',
  subtitle = 'נבחרו בשבילך',
  linkUrl = '/shop/parts',
  linkText = 'לכל החלפים',
  limit = 10 
}) {
  let displayProducts = [...products];

  if (targetTag) {
    displayProducts = displayProducts.filter((product) => product.tags?.includes(targetTag));
  }

  if (targetVendor) {
    const cleanTargetVendor = targetVendor.toLowerCase().replace(/\s+/g, '');

    displayProducts = displayProducts.filter((product) => {
      const cleanProductVendor = product.vendor ? product.vendor.toLowerCase().replace(/\s+/g, '') : '';
      const matchInVendor = cleanProductVendor.includes(cleanTargetVendor);

      const matchInTags = product.tags ? product.tags.some(tag => {
        return tag.toLowerCase().replace(/\s+/g, '').includes(cleanTargetVendor);
      }) : false;

      return matchInVendor || matchInTags;
    });
  }

  if (randomize) {
    displayProducts = displayProducts.sort(() => Math.random() - 0.5);
  }

  displayProducts = displayProducts.slice(0, limit);

  if (displayProducts.length === 0) return null;

  return (
    <section className="scroll-mt-28 w-full">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black tracking-wider text-[#e60000]">{subtitle}</p>
          <h2 className="mt-1 text-3xl font-black text-zinc-950 sm:text-4xl">{title}</h2>
        </div>
        {linkUrl && (
          <Link href={linkUrl} className="inline-flex items-center gap-1 font-bold text-zinc-700 hover:text-[#e60000]">
            {linkText} <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* הקטנו את הרווח בין הכרטיסיות במובייל ל-gap-3 */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-6 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {displayProducts.map((product, index) => (
          <ProductCard 
            key={product.id || index} 
            product={product} 
            priority={index < 2} 
            // שינינו ל-55% כדי שהכרטיסיות יהיו הרבה יותר עדינות במובייל
            className="w-[55%] shrink-0 snap-start sm:w-auto sm:shrink"
          />
        ))}
      </div>
    </section>
  );
}