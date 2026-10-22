// components/PadCompatibility.jsx
'use client';

import { useState, useMemo } from 'react';

export default function PadCompatibility({ modelsData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBrands, setExpandedBrands] = useState({});

  // אם אין נתונים, אל תציג כלום
  if (!modelsData || Object.keys(modelsData).length === 0) return null;

  // פונקציית הסינון שרצה בזמן אמת על בסיס הנתונים המקומי של המוצר
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return modelsData;

    const lowerTerm = searchTerm.toLowerCase();
    const result = {};

    for (const [brand, models] of Object.entries(modelsData)) {
      // חפש התאמה בשם הדגם
      const matchedModels = models.filter(m => m.toLowerCase().includes(lowerTerm));
      
      // אם יש התאמה בדגמים, או ששם היצרן עצמו תואם לחיפוש
      if (matchedModels.length > 0 || brand.toLowerCase().includes(lowerTerm)) {
        result[brand] = matchedModels.length > 0 ? matchedModels : models;
      }
    }
    return result;
  }, [modelsData, searchTerm]);

  const toggleBrand = (brand) => {
    setExpandedBrands(prev => ({ ...prev, [brand]: !prev[brand] }));
  };

  return (
    <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          בדוק התאמה לאופנוע שלך
        </h3>
        
        {/* מנוע חיפוש פנימי */}
        <input
          type="text"
          placeholder="הקלד יצרן או דגם (לדוגמה: KTM או Duke)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
        />
      </div>

      {/* טבלת 2 שכבות */}
      <div className="p-2 max-h-96 overflow-y-auto">
        {Object.keys(filteredData).length === 0 ? (
          <div className="text-center py-6 text-gray-500">לא נמצאו התאמות לחיפוש שלך.</div>
        ) : (
          Object.entries(filteredData).map(([brand, models]) => {
            // אם חיפשנו משהו ומצאנו, נפתח את הטאב אוטומטית
            const isOpen = searchTerm ? true : expandedBrands[brand];

            return (
              <div key={brand} className="mb-2 border rounded-lg border-gray-100">
                <button
                  onClick={() => toggleBrand(brand)}
                  className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg text-right font-bold text-gray-800"
                >
                  <span>{brand} <span className="text-xs font-normal text-gray-500 mr-2">({models.length} דגמים)</span></span>
                  <svg className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                
                {isOpen && (
                  <ul className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 bg-white">
                    {models.map((model, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></span>
                        {model}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}