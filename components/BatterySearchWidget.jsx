// /components/BatterySearchWidget.jsx
'use client';

import { useState, useMemo } from 'react';

export default function BatterySearchWidget() {
  const [selectedModel, setSelectedModel] = useState('');

  const tableData = [
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
      }
    } else {
      alert('אנא בחר דגם מצבר מהרשימה.');
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg shadow-sm my-6 border border-gray-200">
      <h2 className="text-center font-bold text-xl mb-4 text-gray-800">מצא את המצבר לאופנוע שלך 🏍️⚡</h2>
      
      <div className="flex flex-col md:flex-row justify-center items-center gap-4">
        <label htmlFor="replacementDropdown" className="font-bold text-gray-700">המצבר הנוכחי שלך</label>
        <select 
          id="replacementDropdown"
          className="p-2 border border-gray-300 rounded-md w-full md:w-64 text-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option value="">בחר דגם...</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        
        <button 
          onClick={handleSearch}
          className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
        >
          חפש
        </button>
      </div>

      <div className="mt-8 text-center">
        <h3 className="font-semibold text-gray-700 mb-3">צריך התייעצות? צור קשר:</h3>
        <div className="flex justify-center gap-4">
          <a href="https://wa.me/972506129664" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
            <img src="https://cdn.shopify.com/s/files/1/0691/9245/0274/files/whatsapp-social.png?v=1722724045" alt="WhatsApp" className="w-10 h-10" />
          </a>
        </div>
      </div>
    </div>
  );
}