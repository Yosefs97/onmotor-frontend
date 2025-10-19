// components/ForumNav.jsx
'use client';
import Link from 'next/link';

export default function ForumNav({ categories = [], current = '' }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((cat) => (
        // ✅ מעבר ל-slug במקום id
        <Link key={cat.id} href={`/forum/${cat.slug}`}>
          <button
            className={`px-4 py-2 rounded-full border text-sm transition ${
              cat.slug === current
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            {cat.name}
          </button>
        </Link>
      ))}
    </div>
  );
}
