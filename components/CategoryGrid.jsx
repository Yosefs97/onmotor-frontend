// components/CategoryGrid.jsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CategoryGrid({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-none bg-zinc-100 py-6 sm:rounded-3xl sm:p-9">
      <div className="mb-7 flex flex-col gap-2 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-0">
        <div>
          <p className="text-sm font-black tracking-wider text-[#e60000]">התחילו מכאן</p>
          <h2 className="mt-1 text-3xl font-black text-zinc-950">בחרו את מה שמתאים לכם</h2>
        </div>
        <Link href="/shop/parts" className="font-bold text-zinc-700 hover:text-[#e60000]">
          לאיתור חלף לפי יצרן ודגם
        </Link>
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
  );
}