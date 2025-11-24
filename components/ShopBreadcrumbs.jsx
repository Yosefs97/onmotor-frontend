//components\ShopBreadcrumbs.jsx
import Link from 'next/link';

export default function ShopBreadcrumbs({ parts=[] }) {
  return (
    <nav dir="rtl" className="text-sm mb-4">
      {parts.map((p, idx) => (
        <span key={idx}>
          <Link href={p.href} className="text-blue-600 hover:underline">{p.label} prefetch={false}</Link>
          {idx < parts.length - 1 && <span className="mx-2">/</span>}
        </span>
      ))}
    </nav>
  );
}
