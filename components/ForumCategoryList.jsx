// components/ForumCategoryList.jsx
'use client';
import Link from 'next/link';

export default function ForumCategoryList({ categories }) {
  return (
    <ul className="space-y-4">
      {categories.map((cat) => (
        <li key={cat.id} className="border p-4 rounded shadow">
          <Link href={`/forum/${cat.id}`}>
            <span className="text-lg font-semibold hover:underline">
              {cat.name}
            </span>
          </Link>
          {cat.description && (
            <p className="text-sm text-gray-600 mt-1">{cat.description}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
