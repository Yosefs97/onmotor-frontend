// components/FeaturedProducts.jsx
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function formatPrice(product) {
  const price = product.priceRange?.minVariantPrice;
  if (!price?.amount) return null;

  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: price.currencyCode || 'ILS',
    maximumFractionDigits: 0,
  }).format(Number(price.amount));
}

export function ProductCard({ product, priority = false }) {
  const price = formatPrice(product);

  return (
    <Link
      href={`/shop/${product.handle}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-100">
        <img
          src={product.featuredImage?.url}
          alt={product.featuredImage?.altText || product.title}
          loading={priority ? 'eager' : 'lazy'}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 rounded-full bg-black/75 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          {product.vendor || 'מומלץ'}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="min-h-12 text-base font-extrabold leading-snug text-zinc-900">{product.title}</h3>
        
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <span className="text-lg font-black text-[#e60000]">{price || 'לפרטים'}</span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-zinc-700 transition group-hover:text-[#e60000]">
            למוצר <ArrowLeft className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedProducts({ 
  products = [], 
  targetTag, // סינון לפי תגית (אופציונלי)
  targetVendor, // סינון לפי יצרן (אופציונלי)
  randomize = false, // האם לערבב רנדומלית? (אופציונלי)
  title = 'מוצרים שכדאי להכיר עכשיו',
  subtitle = 'נבחרו בשבילך',
  linkUrl = '/shop/parts',
  linkText = 'לכל החלפים',
  limit = 4 
}) {
  let displayProducts = [...products];

  // 1. סינון לפי תגית (אם ביקשת)
  if (targetTag) {
    displayProducts = displayProducts.filter((product) => product.tags?.includes(targetTag));
  }

  // 2. סינון לפי יצרן (אם ביקשת בדף של יצרן ספציפי)
  if (targetVendor) {
    displayProducts = displayProducts.filter((product) => {
      if (!product.vendor) return false;
      // הופכים את שני הצדדים לאותיות קטנות כדי שההשוואה תמיד תצליח
      return product.vendor.toLowerCase() === targetVendor.toLowerCase();
    });
  }

  // 3. ערבוב רנדומלי (אם ביקשת בדף כללי)
  if (randomize) {
    displayProducts = displayProducts.sort(() => Math.random() - 0.5);
  }

  // 4. חיתוך לכמות המבוקשת (למשל 4)
  displayProducts = displayProducts.slice(0, limit);

  // 🔴 חכם: אם אחרי כל הסינונים אין מוצרים - אל תציג את הבלוק בכלל!
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

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {displayProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index < 2} />
        ))}
      </div>
    </section>
  );
}