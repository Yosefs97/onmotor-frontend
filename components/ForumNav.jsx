// components/ForumNav.jsx
'use client';
import Link from 'next/link';

export default function ForumNav({ categories = [], current = '' }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((cat) => (
        <Link key={cat.id} href={`/forum/${cat.id}`}>
          <button
            className={`px-4 py-2 rounded-full border text-sm transition ${
              cat.id === current
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
