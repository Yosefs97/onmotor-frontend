// components/Breadcrumbs.jsx
import Link from "next/link";

export default function Breadcrumbs({ items }) {
  return (
    <nav className="text-l py-0 px-0 rtl">
      {items.map((item, index) => (
        <span key={index}>
          {index > 0 && <span className="mx-1 text-black">/</span>}
          {index < items.length - 1 ? (
            <Link href={item.href} className="hover:underline text-black" prefetch={false}>
              {item.label}
            </Link>
          ) : (
            <span className="text-[#e60000] font-semibold">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}