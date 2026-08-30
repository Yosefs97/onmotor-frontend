//components\ShopHomepage.jsx
import Link from 'next/link';
import { ArrowLeft, Check, Search, ShieldCheck, Truck } from 'lucide-react';

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
      <div className="relative aspect-square overflow-hidden bg-zinc-100">
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
      <div className="flex flex-1 flex-col p-4">
        <h3 className="min-h-12 text-base font-extrabold leading-snug text-zinc-900">{product.title}</h3>
        
        {/* השינוי בוצע כאן: החלפנו את mt-3 ב- mt-auto והוספנו pt-3 לרווח מלמעלה */}
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

export default function ShopHomepage({ categories = [], products = [] }) {
  const heroProduct = products[0];
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-14 px-4 pb-8 pt-3 sm:px-6 lg:px-8" dir="rtl">
      <section className="relative isolate overflow-hidden rounded-3xl bg-zinc-950 px-6 py-10 text-white shadow-2xl sm:px-10 sm:py-14 lg:min-h-[450px] lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(230,0,0,0.55),transparent_28%),radial-gradient(circle_at_10%_90%,rgba(86,18,18,0.55),transparent_38%)]" />
        {heroProduct?.featuredImage?.url && (
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[48%] lg:block">
            <img
              src={heroProduct.featuredImage.url}
              alt=""
              className="h-full w-full object-cover opacity-80 [mask-image:linear-gradient(to_left,black_55%,transparent)]"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-zinc-950/20 to-zinc-950" />
          </div>
        )}

        <div className="relative z-10 max-w-2xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-zinc-100 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#e60000]" />
            OnMotor Parts · עונת 2026
          </span>
          <h1 className="max-w-xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            כל מה שהאופנוע שלך צריך.
            <span className="block text-[#ff3b3b]">במקום אחד.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-300 sm:text-xl">
            חלפים, ציוד רכיבה ושדרוגים שנבחרו לרוכבים שמבינים עניין. מוצאים מהר, מזמינים בביטחון, וחוזרים לכביש.
          </p>
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

      <section className="grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-3">
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

      <section id="featured-products" className="scroll-mt-28">
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

      <section className="overflow-hidden rounded-3xl bg-zinc-100 p-6 sm:p-9">
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black tracking-wider text-[#e60000]">התחילו מכאן</p>
            <h2 className="mt-1 text-3xl font-black text-zinc-950">בחרו את מה שמתאים לכם</h2>
          </div>
          <Link href="/shop/parts" className="font-bold text-zinc-700 hover:text-[#e60000]">לאיתור חלף לפי יצרן ודגם</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.handle} href={category.href} className="group relative min-h-44 overflow-hidden rounded-2xl bg-zinc-900 p-5 text-white">
              {category.image && (
                <img src={category.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover:scale-105 group-hover:opacity-70" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
              <div className="relative flex h-full flex-col justify-end">
                <h3 className="text-2xl font-black">{category.title}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-zinc-200 transition group-hover:text-[#ff5a5a]">לגלות מוצרים <ArrowLeft className="h-4 w-4" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
