// components/CategoryGrid.jsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const categoryVideos = {
  'spare-parts': '/videos/cat-parts.webm',
  'street': '/videos/cat-street.webm',
  'off-road': '/videos/cat-offroad.webm',
  'oils-and-fluids': '/videos/cat-oils.webm',
  'tires': '/videos/cat-tires.webm',
  'batteries': '/videos/cat-batteries.webm'
};

export default function CategoryGrid({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  return (
    // שינוי הרקע ללבן נקי (bg-white) כדי שהקוביות הכהות יבלטו יותר
    <section className="overflow-hidden rounded-none bg-white py-8 sm:rounded-3xl sm:py-12">
      <div className="mb-8 flex flex-col gap-2 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-0">
        <div>
          <p className="text-sm font-black tracking-wider text-[#e60000]">התחילו מכאן</p>
          <h2 className="mt-1 text-3xl font-black text-zinc-950">בחרו את מה שמתאים לכם</h2>
        </div>
        <Link href="/shop/parts" className="font-bold text-zinc-700 hover:text-[#e60000] transition-colors">
          לאיתור חלף לפי יצרן ודגם
        </Link>
      </div>
      
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
        {categories.map((category) => {
          const videoUrl = categoryVideos[category.handle];

          return (
            <Link 
              key={category.handle} 
              href={category.href} 
              // הגדלת הרוחב במובייל (75%) והגובה במחשב (min-h-[280px])
              className="group relative flex w-[75%] shrink-0 snap-center flex-col justify-end overflow-hidden rounded-2xl bg-zinc-900 p-5 sm:p-6 text-white sm:w-auto sm:shrink sm:min-h-[280px] aspect-[4/5] sm:aspect-auto shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {videoUrl ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
                >
                  <source src={videoUrl} type="video/webm" />
                </video>
              ) : category.image ? (
                <img 
                  src={category.image} 
                  alt="" 
                  className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110" 
                />
              ) : null}

              {/* גראדיינט מעט יותר עדין שמאפשר לווידאו לבלוט בחלק העליון */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              <div className="relative flex h-full flex-col justify-end">
                <h3 className="text-2xl font-black sm:text-3xl mb-3">{category.title}</h3>
                
                {/* כפתור "צף" אפקט זכוכית, ושימוש באדום חזק במעבר עכבר */}
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 group-hover:bg-[#e60000] group-hover:text-white border border-white/10 group-hover:border-[#e60000]">
                  לגלות מוצרים <ArrowLeft className="h-4 w-4" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}