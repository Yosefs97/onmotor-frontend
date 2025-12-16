//components/header/MegaMenu.jsx
'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export default function MegaMenu({ menuItems }) {
  if (!menuItems || menuItems.length === 0) return null;

  return (
    // hidden md:flex -> מופיע רק בדסקטופ
    <nav className="hidden md:flex items-center gap-6" dir="rtl">
      {menuItems.map((category) => (
        <div key={category.title} className="group relative flex items-center h-10">
          
          <Link 
            href={category.url}
            className="flex items-center gap-1 text-gray-700 font-bold text-sm hover:text-red-600 transition-colors px-2 py-1"
          >
            {category.title}
            <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
          </Link>

          {/* ה-Dropdown */}
          {category.items.length > 0 && (
            <div className="
              absolute top-full right-0 w-[600px] bg-white shadow-xl border border-gray-100 rounded-b-lg
              opacity-0 invisible group-hover:opacity-100 group-hover:visible 
              transition-all duration-200 z-50
            ">
              <div className="p-6">
                <div className="grid grid-cols-3 gap-6">
                  {category.items.map((group, idx) => (
                    <div key={idx} className="space-y-3">
                      <h3 className="font-bold text-red-600 text-sm border-b pb-1">
                        {group.title}
                      </h3>
                      <ul className="space-y-2">
                        {group.items.map((item) => (
                          <li key={item.title}>
                            <Link 
                              href={item.url}
                              className="text-gray-600 hover:text-red-600 text-sm block"
                            >
                              {item.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}