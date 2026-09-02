// components/ShopHomepage.jsx
import Link from 'next/link';
import { ArrowLeft, Check, Search, ShieldCheck, Truck } from 'lucide-react';
import ShopHeroVideo from '@/components/ShopHeroVideo';

function formatPrice(product) {
  const price = product.priceRange?.minVariantPrice;
  if (!price?.amount) return null;

  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: price.currencyCode || 'ILS',
    maximumFractionDigits: 0,
  }).format(Number(price.amount));
}

function ProductCard({ product, priority = false }) {
  const price = formatPrice(product);

  return (
    <Link
      href={`/shop/${product.handle}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl"
    >
      {/* הוספנו shrink-0 כדי שהתמונה תמיד תישאר ריבועית ולא תתכווץ */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-zinc-100">
        <img
          src={product.featuredImage.url}
          alt={product.featuredImage.altText || product.title}
          loading={priority ? 'eager' : 'lazy'}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 rounded-full bg-black/75 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          {product.vendor || 'מומלץ'}
        </span>
      </div>
      
      {/* הוספנו justify-between לפיזור מדויק בין הכותרת למחיר */}
      <div className="flex flex-1 flex-col justify-between p-4">
        
        {/* הוספנו line-clamp-2 כדי למנוע גלישה ל-3 שורות שתשבור את העיצוב */}
        <h3 
          className="min-h-12 text-base font-extrabold leading-snug text-zinc-900 line-clamp-2"
          title={product.title}
        >
          {product.title}
        </h3>
        
        {/* שינינו ל-items-center ליישור הכתב, והורדנו כפילות של mt-auto */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="text-lg font-black text-[#e60000]">{price || 'לפרטים'}</span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-zinc-700 transition group-hover:text-[#e60000]">
            למוצר <ArrowLeft className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ShopHomepage({ categories = [], products = [] }) {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-0 pb-8 pt-0 sm:px-6 sm:pt-3 lg:px-8" dir="rtl">
      
      {/* סקשן הירו */}
      <section className="relative isolate overflow-hidden rounded-none bg-zinc-950 px-6 py-10 text-white shadow-2xl sm:rounded-3xl sm:px-10 sm:py-14 lg:min-h-[450px] lg:px-14">
        <ShopHeroVideo />

        <div className="relative z-10 max-w-2xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-zinc-100 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#e60000]" />
            OnMotor Parts · עונת 2026
          </span>
          <h1 className="max-w-xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          הכל לרוכב ולרוכבת,
            <span className="block text-[#ff3b3b]">במקום אחד.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-300 sm:text-xl">
            חלקי חילוף, ציוד רכיבה - כביש ושטח. הכל במקום אחד.
          </p>
          
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-extrabold text-zinc-100 sm:text-sm">
            {categories.map((category) => (
              <Link 
                key={category.handle || category.title} 
                href={category.href || `/collections/${category.handle}`}
                className="rounded-full border border-white/20 bg-black/30 px-3 py-1.5 backdrop-blur transition hover:bg-[#e60000] hover:border-[#e60000]"
              >
                {category.title}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="#featured-products" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e60000] px-6 py-3.5 text-base font-extrabold text-white transition hover:bg-red-700">
              לראות מוצרים מומלצים <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href="/shop/parts" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-base font-extrabold text-white transition hover:bg-white/10">
              <Search className="h-5 w-5" />
              מצאו חלף לפי האופנוע
            </Link>
          </div>
        </div>
      </section>

      {/* בלוק אבטחה ומשלוחים */}
      <div className="space-y-4">
        <section className="grid gap-px overflow-hidden rounded-none border-y border-zinc-200 bg-zinc-200 sm:grid-cols-3 sm:rounded-2xl sm:border-x">
          <div className="flex items-center gap-3 bg-white px-5 py-4">
            <Truck className="h-6 w-6 shrink-0 text-[#e60000]" />
            <p className="text-sm font-bold text-zinc-800">משלוח חינם מעל ₪499 <span className="font-normal text-zinc-500">למעט חלקי חילוף</span></p>
          </div>
          <div className="flex items-center gap-3 bg-white px-5 py-4">
            <ShieldCheck className="h-6 w-6 shrink-0 text-[#e60000]" />
            <p className="text-sm font-bold text-zinc-800">תשלום מאובטח וקנייה בראש שקט</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-5 py-4">
            <Check className="h-6 w-6 shrink-0 text-[#e60000]" />
            <p className="text-sm font-bold text-zinc-800">חלפים חדשים ומשומשים שנבדקו</p>
          </div>
        </section>

        {/* מוצרים מומלצים */}
        <section id="featured-products" className="scroll-mt-28 px-4 sm:px-0">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black tracking-wider text-[#e60000]">נבחרו בשבילך</p>
              <h2 className="mt-1 text-3xl font-black text-zinc-950 sm:text-4xl">מוצרים שכדאי להכיר עכשיו</h2>
            </div>
            <Link href="/shop/parts" className="inline-flex items-center gap-1 font-bold text-zinc-700 hover:text-[#e60000]">
              לכל החלפים <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 2} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-600">
              המוצרים המומלצים יופיעו כאן מיד לאחר שהקטלוג זמין.
            </div>
          )}
        </section>
      </div>

      {/* סקשן קטגוריות */}
      <section className="overflow-hidden rounded-none bg-zinc-100 py-6 sm:rounded-3xl sm:p-9">
        <div className="mb-7 flex flex-col gap-2 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-0">
          <div>
            <p className="text-sm font-black tracking-wider text-[#e60000]">התחילו מכאן</p>
            <h2 className="mt-1 text-3xl font-black text-zinc-950">בחרו את מה שמתאים לכם</h2>
          </div>
          <Link href="/shop/parts" className="font-bold text-zinc-700 hover:text-[#e60000]">לאיתור חלף לפי יצרן ודגם</Link>
        </div>
        
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {categories.map((category) => (
            <Link 
              key={category.handle} 
              href={category.href} 
              className="group relative flex w-[60%] shrink-0 snap-center flex-col justify-end aspect-square overflow-hidden rounded-2xl bg-zinc-900 p-5 text-white sm:w-auto sm:shrink sm:aspect-auto sm:min-h-44"
            >
              {category.image && (
                <img src={category.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover:scale-105 group-hover:opacity-70" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
              <div className="relative flex h-full flex-col justify-end">
                <h3 className="text-xl font-black sm:text-2xl">{category.title}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-zinc-200 transition group-hover:text-[#ff5a5a] sm:text-sm">
                  לגלות מוצרים <ArrowLeft className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
    </div>
  );
}