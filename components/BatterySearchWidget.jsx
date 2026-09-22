// /components/BatterySearchWidget.jsx
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';

// רכיב פנימי ששומר על העיצוב שלך אבל מאפשר הקלדה וחיפוש
function SearchableSelect({ options, value, onChange, placeholder, inputClassName, containerClassName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  // סגירת הרשימה בעת לחיצה מחוץ לאזור
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // סינון האופציות לפי מה שהוקלד
  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // מה שמוצג בשדה: אם פתוח מציגים את טקסט החיפוש, אחרת את הערך שנבחר
  const displayValue = isOpen ? searchTerm : (value || '');

  return (
    <div ref={wrapperRef} className={`relative ${containerClassName}`}>
      <input
        type="text"
        className={`${inputClassName} w-full pl-8 bg-white cursor-text transition-none`}
        placeholder={placeholder}
        value={displayValue}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onClick={() => {
          setSearchTerm(''); // מנקה את טקסט החיפוש כדי שיהיה נוח להקליד מחדש
          setIsOpen(true);
        }}
      />
      
      {/* חץ קטן כמו ב-Select רגיל (ממוקם בצד שמאל עבור עברית RTL) */}
      <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* תפריט התוצאות הקופץ */}
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto text-gray-700 m-0 p-0 list-none">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <li
                key={option}
                className="cursor-pointer select-none py-2 px-3 hover:bg-gray-100 text-sm transition-colors text-right"
                onMouseDown={(e) => {
                  e.preventDefault(); // מונע איבוד פוקוס לפני הבחירה
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </li>
            ))
          ) : (
            <li className="py-2 px-3 text-gray-500 text-sm text-right">
              לא נמצאו תוצאות
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function BatterySearchWidget({ compact = false }) {
  const [selectedModel, setSelectedModel] = useState('');

  const tableData = [
    // --- מוצרים קיימים ---
    {
      model: 'PLFP-30L',
      replacement: '12N24-3, 12N24-3A, Y60-N24AL-B',
      productUrl: '/shop/poweroad-lithium-lifepo4-plfp-30l'
    },
    {
      model: 'PLFP-20L',
      replacement: 'YTX20L-BS, YTX20HL-BS, YTX24HL-BS, Y50-N18L-A-CX, Y50-N18L-A, Y50-N18L-A2, Y50-N18L-A3, Y50-N18L-AT',
      productUrl: '/shop/poweroad-lithium-lifepo4-plfp-20l'
    },
    {
      model: 'PLFP-9R',
      replacement: '12N9-4B-1, YB9-B, YTX7A-BS, YTX9-BS',
      productUrl: '/shop/poweroad-lithium-lifepo4-plfp-9r'
    },
    {
      model: 'PLFP-14R',
      replacement: 'YTX12-BS, YTX12A-BS, YTX14-BS, YTX14H-BS, YTZ12S, YTZ14S, KMX14-BS',
      productUrl: '/shop/poweroad-lithium-lifepo4-plfp-14r'
    },
    {
      model: 'PLFP-7L',
      replacement: '12N5-3B, 12N7-3B, 12N7A-3A, YB5L-B, YB6.5L-B, YB7L-B, YB4L-A/B, YTX4L-BS, YTX5L-BS, YTX7L-BS, YTZ5S, YTZ7S',
      productUrl: '/shop/poweroad-lithium-lifepo4-plfp-7l'
    },
    {
      model: 'PLFP-14BR',
      replacement: 'YT7B-BS, YT9B-BS, YT14B-BS, YT12B-BS, YTZ10S, 12N12A-4A-1, YTX14AH-BS',
      productUrl: '/shop/poweroad-lithium-lifepo4-plfp-14br'
    },
    // --- מוצרים חדשים שהתווספו ---
    {
      model: 'PLFP-14BL',
      replacement: '12N10-3A-2, 12N14-3A, YB10L-A2, YB10L-B, YB12AL-A/A2, YB14L-A1/2, YB16AL-A2, YTX14AHL-BS',
      productUrl: '/shop/poweroad-lithium-lifepo4-plfp-14bl'
    },
    {
      model: 'PLFP-18R',
      replacement: 'YTX16-BS, YTX16-BS-1, YB16B-A/A1, HYB16A-AB, YB16-B, YB16-B-CX, YB16C-B, YB18-A',
      productUrl: '/shop/poweroad-lithium-lifepo4-plfp-18r'
    },
    {
      model: 'PLFP-20R',
      replacement: 'YTX20H-BS, YTX20CH-BS, GYZ16, Y50-N18A-A',
      productUrl: '/shop/poweroad-lithium-lifepo4-plfp-20r'
    },
    {
      model: 'PLFP-30R',
      replacement: 'YHD-12H, Y60-N24-A, 53034',
      productUrl: '/shop/poweroad-lithium-lifepo4-plfp-30r'
    },
    {
      model: 'PLFE-8V',
      replacement: 'YTZ-8V',
      productUrl: '/shop/poweroad-lithium-lifepo4-plfe-8v'
    },
    {
      model: 'LP7',
      replacement: 'YTX4L, YTZ7S, YTX5L, YTZ8V, YTX7L',
      productUrl: '/shop/liyon-battery-lp7'
    },
    {
      model: 'LP16',
      replacement: 'YTZ10S, YT12S, YTZ14S, YTX14, YTX20H',
      productUrl: '/shop/liyon-battery-lp16'
    }
  ];

  // שולף את כל הדגמים הייחודיים וממיין לפי ABC
  const options = useMemo(() => {
    const uniqueReplacements = new Set();
    tableData.forEach(row => {
      row.replacement.split(', ').forEach(model => {
        uniqueReplacements.add(model.trim());
      });
    });
    return Array.from(uniqueReplacements).sort();
  }, []);

  const handleSearch = () => {
    if (selectedModel) {
      const product = tableData.find(row => row.replacement.includes(selectedModel));
      if (product) {
        // מפנה לעמוד המוצר
        window.location.href = product.productUrl; 
      } else {
        alert('אנא בחר דגם מצבר מהרשימה.');
      }
    } else {
      alert('אנא בחר דגם מצבר מהרשימה.');
    }
  };

  // === תצוגה מינימליסטית (עבור דף מוצרים קשורים) ===
  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 shadow-sm w-full md:w-auto">
        <span className="text-sm font-bold text-gray-700 whitespace-nowrap">התאמת מצבר:</span>
        <SearchableSelect
          options={options}
          value={selectedModel}
          onChange={setSelectedModel}
          placeholder="בחר דגם..."
          // העיצוב המקורי שלך לתצוגה המינימלית פוצל לכאן:
          inputClassName="py-1 px-2 text-sm text-gray-700 border border-gray-300 rounded focus:ring-1 focus:ring-red-600 focus:outline-none"
          containerClassName="flex-grow md:w-48"
        />
        <button 
          onClick={handleSearch}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm transition-colors"
        >
          חפש
        </button>
      </div>
    );
  }

  // === התצוגה המלאה ===
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg shadow-sm my-6 border border-gray-200">
      <h2 className="text-center font-bold text-xl mb-4 text-gray-800">מצא את המצבר לאופנוע שלך</h2>
      
      <div className="flex flex-col md:flex-row justify-center items-center gap-4">
        <label htmlFor="replacementDropdown" className="font-bold text-gray-700">המצבר הנוכחי שלך</label>
        <SearchableSelect
          options={options}
          value={selectedModel}
          onChange={setSelectedModel}
          placeholder="בחר דגם..."
          // העיצוב המקורי שלך לתצוגה המלאה פוצל לכאן:
          inputClassName="p-2 border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none"
          containerClassName="w-full md:w-64"
        />
        
        <button 
          onClick={handleSearch}
          className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
        >
          חפש
        </button>
      </div>

      <div className="mt-2 text-center">
        <h3 className="font-semibold text-gray-700 mb-2">לכל שאלה, צור קשר:</h3>
        <div className="flex justify-center gap-2">
          <a href="https://wa.me/972506129664" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
            <img src="https://cdn.shopify.com/s/files/1/0691/9245/0274/files/whatsapp-social.png?v=1722724045" alt="WhatsApp" className="w-10 h-10" />
          </a>
        </div>
      </div>
    </div>
  );
}