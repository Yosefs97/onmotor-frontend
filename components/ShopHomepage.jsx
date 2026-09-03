// components/ShopHomepage.jsx
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react'; // הורדנו אייקונים מיותרים שעברו ל-TrustBar
import ShopHeroVideo from '@/components/ShopHeroVideo';
import CategoryGrid from '@/components/CategoryGrid';
import FeaturedProducts from '@/components/FeaturedProducts';
import TrustBar from '@/components/TrustBar'; // ייבוא של בר האבטחה והמשלוחים החדש

export default function ShopHomepage({ categories = [], products = [] }) {
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

      {/* אזור התוכן המרכזי: משלוחים + מוצרים מומלצים */}
      <div className="space-y-4">
        <TrustBar />
        <FeaturedProducts products={products} limit={4} />
      </div>

      {/* קריאה לקומפוננטת קוביות הקטגוריות החיצונית */}
      <CategoryGrid categories={categories} />
      
    </div>
  );
}