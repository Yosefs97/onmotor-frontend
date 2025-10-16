export default function PostList(){return null}
'use client';
import Link from 'next/link';

export default function PostList({ posts, categoryId }) {
  if (posts.length === 0) return <p>אין עדיין פוסטים בקטגוריה הזו.</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
  {posts.map((post) => (
    <Link key={post.id} href={`/forum/${categoryId}/${post.id}`}>
      <div className="border rounded p-4 bg-white hover:shadow transition">
        <h2 className="text-lg font-semibold text-red-700 mb-1">{post.title}</h2>
        <p className="text-sm text-gray-600">from: {post.author} | {post.date}</p>
        <p className="text-sm text-gray-500">
           {post.date} | {post.comments?.length || 0} תגובות
        </p>

      </div>
    </Link>
  ))}
</div>
  );
}
