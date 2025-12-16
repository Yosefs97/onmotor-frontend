//components/header/MobileMenu.jsx
'use client';

import { useState } from 'react';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export default function MobileMenu({ menuItems }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // ניהול מצב פתיחה לכל קטגוריה בנפרד (כדי שאפשר יהיה לפתוח כמה במקביל או אחת אחת)
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = (title) => {
    setExpandedCategories(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      {/* כפתור המבורגר לפתיחת התפריט */}
      <button onClick={() => setIsOpen(true)} className="p-2 text-gray-700">
        <Menu className="w-7 h-7" />
      </button>

      {/* רקע כהה כשפתוח */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity" 
          onClick={closeMenu}
        />
      )}

      {/* גוף התפריט */}
      <div className={`
        fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white z-[60] 
        transform transition-transform duration-300 shadow-2xl overflow-y-auto
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `} dir="rtl">
        
        {/* כותרת וכפתור סגירה */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
          <span className="font-bold text-lg text-gray-900">תפריט</span>
          <button onClick={closeMenu} className="p-2 bg-white rounded-full border shadow-sm text-red-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-2 pb-20">
          {menuItems.map((category) => {
            const isExpanded = expandedCategories[category.title];
            const hasChildren = category.items && category.items.length > 0;

            return (
              <div key={category.title} className="border-b border-gray-100 last:border-0 pb-2">
                
                <div className="flex justify-between items-center w-full">
                    {/* שם הקטגוריה הראשית */}
                    <Link 
                        href={category.url} 
                        onClick={closeMenu}
                        className="py-3 font-bold text-gray-800 text-lg flex-grow text-right"
                    >
                        {category.title}
                    </Link>

                    {/* חץ לפתיחה/סגירה */}
                    {hasChildren && (
                        <button 
                            onClick={() => toggleCategory(category.title)}
                            className="p-3 text-gray-500"
                        >
                             {isExpanded ? <ChevronUp className="w-5 h-5 text-red-600" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                    )}
                </div>

                {/* תוכן האקורדיון (תתי-קטגוריות) */}
                <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-6 mb-2">
                    {category.items.map((group, idx) => (
                      <div key={idx}>
                        <h4 className="font-bold text-red-600 mb-2 border-b border-gray-200 pb-1 text-base">
                          {group.title}
                        </h4>
                        <ul className="space-y-3 pr-2 border-r-2 border-gray-200 mr-1">
                          {group.items.map((item) => (
                            <li key={item.title}>
                              <Link 
                                href={item.url}
                                onClick={closeMenu}
                                className="block text-gray-600 hover:text-red-600 font-medium pr-2"
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
            );
          })}
        </div>
      </div>
    </div>
  );
}