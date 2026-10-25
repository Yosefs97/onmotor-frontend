// components/PadsSearchWidget.jsx
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function SearchableSelect({ options, value, onChange, placeholder, inputClassName, containerClassName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    opt.searchTags.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayValue = isOpen ? searchTerm : (value ? value.label : '');

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
          setSearchTerm(''); 
          setIsOpen(true);
        }}
      />
      
      <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto text-gray-700 m-0 p-0 list-none">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                key={`${option.url}-${index}`}
                className="cursor-pointer select-none py-2 px-3 hover:bg-gray-100 border-b border-gray-50 last:border-0 text-sm transition-colors text-right flex flex-col"
                onMouseDown={(e) => {
                  e.preventDefault(); 
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                <span className="font-bold text-gray-800">{option.modelName}</span>
                <span className="text-xs text-gray-500">{option.productTitle}</span>
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

export default function PadsSearchWidget({ products = [], compact = false }) {
  const [selectedModel, setSelectedModel] = useState(null);
  const router = useRouter();

  // עיבוד כל המוצרים לחילוץ דגמי האופנועים מתוך ה-Metafields
  const options = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    const allModels = [];

    products.forEach(product => {
      // אם זה לא מוצר מסוג רפידות, נדלג עליו (אופציונלי - ליתר ביטחון)
      if (product.productType !== 'רפידות' && !product.title?.includes('רפידות')) return;

      const modelsMetafield = product.metafields?.find(m => m && m.key === 'compatible_models');
      
      if (modelsMetafield?.value) {
        try {
          const data = JSON.parse(modelsMetafield.value);
          
          Object.entries(data).forEach(([brand, models]) => {
            models.forEach(model => {
              allModels.push({
                label: `${brand} ${model} - ${product.title}`, // התצוגה המלאה
                modelName: `${brand} ${model}`, // שם הדגם בלבד
                productTitle: product.title, // שם המוצר (קדמי/אחורי וכו')
                searchTags: `${brand} ${model} ${product.title}`, // מילים לחיפוש
                url: `/shop/${product.handle}` // הקישור למוצר
              });
            });
          });
        } catch (e) {
          console.error("Error parsing pad models for", product.handle, e);
        }
      }
    });

    // מיון אלפביתי של הדגמים
    return allModels.sort((a, b) => a.modelName.localeCompare(b.modelName));
  }, [products]);

  const handleSearch = () => {
    if (selectedModel && selectedModel.url) {
      router.push(selectedModel.url);
    } else {
      alert('אנא בחר דגם מהרשימה.');
    }
  };

  if (options.length === 0) return null; // לא מציג את המנוע אם אין נתונים

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 shadow-sm w-full md:w-auto mt-4">
        <span className="text-sm font-bold text-gray-700 whitespace-nowrap flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          התאמת רפידות:
        </span>
        <SearchableSelect
          options={options}
          value={selectedModel}
          onChange={setSelectedModel}
          placeholder="חפש דגם אופנוע (לדוגמה MT-07)..."
          inputClassName="py-1 px-2 text-sm text-gray-700 border border-gray-300 rounded focus:ring-1 focus:ring-red-600 focus:outline-none"
          containerClassName="flex-grow md:w-64"
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

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg shadow-sm my-6 border border-gray-200">
      <h2 className="text-center font-bold text-xl mb-4 text-gray-800">מצא רפידות בלם לאופנוע שלך</h2>
      
      <div className="flex flex-col md:flex-row justify-center items-center gap-4">
        <label className="font-bold text-gray-700">דגם האופנוע:</label>
        <SearchableSelect
          options={options}
          value={selectedModel}
          onChange={setSelectedModel}
          placeholder="הקלד יצרן או דגם..."
          inputClassName="p-2 border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none"
          containerClassName="w-full md:w-80"
        />
        
        <button 
          onClick={handleSearch}
          className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
        >
          עבור למוצר
        </button>
      </div>
    </div>
  );
}