// components/CategoryGrid.jsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const categoryVideos = {
  parts: '/videos/cat-parts.webm',
  road: '/videos/cat-street.webm',
  offroad: '/videos/cat-offroad.webm',
  oils: '/videos/cat-oils.webm',
  tires: '/videos/cat-tires.webm',
  battery: '/videos/cat-batteries.webm',
};

function CategoryCard({ category, videoUrl }) {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <Link
      href={category.href}
      className="group relative flex w-[45%] shrink-0 snap-center flex-col justify-end overflow-hidden rounded-2xl bg-zinc-900 p-4 text-white shadow-sm transition-all duration-300 hover:shadow-xl aspect-square sm:h-[220px] sm:w-auto sm:shrink sm:aspect-auto"
    >
      {videoUrl && !videoFailed ? (
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onError={() => setVideoFailed(true)}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
        />
      ) : category.image ? (
        <img
          src={category.image}
          alt={category.title}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end">
        <h3 className="mb-2 text-xl font-black">
          {category.title}
        </h3>

        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md transition-all duration-300 group-hover:border-[#e60000] group-hover:bg-[#e60000] group-hover:text-white">
          לגלות מוצרים
          <ArrowLeft className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}

export default function CategoryGrid({ categories = [] }) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-none bg-white py-8 sm:rounded-3xl sm:py-12">
      <div className="mb-6 flex flex-col gap-1 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-0">
        <div>
          <p className="text-sm font-black tracking-wider text-[#e60000]">
            התחילו מכאן
          </p>

          <h2 className="mt-1 text-2xl font-black text-zinc-950 sm:text-3xl">
            בחרו את מה שמתאים לכם
          </h2>
        </div>

        <Link
          href="/shop/parts"
          className="font-bold text-zinc-700 transition-colors hover:text-[#e60000]"
        >
          לאיתור חלף לפי יצרן ודגם
        </Link>
      </div>

      <div className="flex gap-1 overflow-x-auto snap-x snap-mandatory px-4 pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.handle}
            category={category}
            videoUrl={categoryVideos[category.handle]}
          />
        ))}
      </div>
    </section>
  );
}