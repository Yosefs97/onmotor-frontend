//components/product/ProductForm.jsx
'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Check } from 'lucide-react'; // אייקונים (אופציונלי)

export default function ProductForm({ product }) {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [adding, setAdding] = useState(false);

  // 1. אתחול בחירה ראשונית (הוריאציה הראשונה הזמינה)
  useEffect(() => {
    if (!product?.variants?.edges?.length) return;

    // אם עדיין לא נבחרו אופציות, נבחר את הראשונה
    if (Object.keys(selectedOptions).length === 0) {
       const firstVariant = product.variants.edges[0].node;
       const defaultOpts = {};
       
       firstVariant.selectedOptions.forEach(opt => {
           defaultOpts[opt.name] = opt.value;
       });
       
       setSelectedOptions(defaultOpts);
       setSelectedVariant(firstVariant);
    }
  }, [product, selectedOptions]);

  // 2. עדכון הוריאציה שנבחרה בכל שינוי באופציות
  useEffect(() => {
    if (!product?.variants?.edges || Object.keys(selectedOptions).length === 0) return;

    const variant = product.variants.edges.find(({ node }) => {
      return node.selectedOptions.every(option => {
        return selectedOptions[option.name] === option.value;
      });
    })?.node;

    setSelectedVariant(variant || null);
  }, [selectedOptions, product]);

  const handleOptionChange = (name, value) => {
    setSelectedOptions(prev => ({ ...prev, [name]: value }));
  };

  // 3. לוגיקת הוספה לסל (הועתקה ושופרה מהקוד הישן שלך)
  const addToCart = async () => {
    if (!selectedVariant) return;
    if (!selectedVariant.availableForSale) return;

    setAdding(true);
    try {
      const res = await fetch('/api/shopify/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          quantity: 1,
        }),
      });
      
      const json = await res.json();
      
      if (json.cart) {
        // אירוע לעדכון העגלה באתר
        window.dispatchEvent(new Event('cartUpdated')); 
        // אופציונלי: פתיחת ה-Drawer של העגלה או הודעת הצלחה
      } else {
        alert('שגיאה בהוספת המוצר לעגלה');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAdding(false);
    }
  };

  // מחיר להצגה
  const price = selectedVariant 
    ? parseFloat(selectedVariant.price.amount) 
    : parseFloat(product.priceRange?.minVariantPrice?.amount || 0);

  const isAvailable = selectedVariant?.availableForSale && selectedVariant?.quantityAvailable > 0;

  return (
    <div className="space-y-6">
      
      {/* מחיר */}
      <div className="text-3xl font-bold text-gray-900">
        ₪{price.toLocaleString()}
      </div>

      {/* לולאת אפשרויות (מידה / צבע) */}
      {product.options?.map((option) => {
        // זיהוי אם זה צבע (לפי השם)
        const isColor = ['Color', 'צבע', 'Colour'].includes(option.name);

        return (
          <div key={option.id}>
            <div className="flex justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">
                {option.name}: <span className="text-gray-500 font-normal">{selectedOptions[option.name]}</span>
                </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected = selectedOptions[option.name] === value;
                
                // עיצוב לצבעים
                if (isColor) {
                    return (
                        <button
                            key={value}
                            onClick={() => handleOptionChange(option.name, value)}
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all ${
                                isSelected ? 'border-red-600 ring-2 ring-red-100' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            title={value}
                        >
                            {/* אם תרצה בעתיד למשוך תמונה קטנה של הצבע, זה המקום */}
                            <span className="sr-only">{value}</span>
                            <div className="w-full h-full" style={{ backgroundColor: value.toLowerCase() }}></div> 
                            {/* fallback טקסט אם הצבע לא CSS valid */}
                            <span className="text-[10px] text-gray-600 font-bold">{value.slice(0,2)}</span>
                        </button>
                    );
                }

                // עיצוב למידות (כפתורים)
                return (
                  <button
                    key={value}
                    onClick={() => handleOptionChange(option.name, value)}
                    className={`min-w-[3rem] px-3 py-2 text-sm border rounded-lg transition-all ${
                      isSelected
                        ? 'border-red-600 bg-red-600 text-white font-bold shadow-md'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* כפתור הוספה לסל */}
      <div className="pt-4">
        <button
            onClick={addToCart}
            disabled={adding || !isAvailable}
            className={`w-full py-4 px-8 flex items-center justify-center gap-3 text-lg font-bold rounded-xl transition-all ${
                isAvailable 
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 hover:-translate-y-1' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
            {adding ? (
                <span className="animate-pulse">מוסיף...</span>
            ) : !isAvailable ? (
                'אזל מהמלאי'
            ) : (
                <>
                    <ShoppingCart className="w-5 h-5" />
                    הוסף לעגלה
                </>
            )}
        </button>
      </div>

      {/* אזור דביק למובייל (Sticky Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden z-50 flex items-center gap-3">
          <div className="flex-1">
              <div className="text-xs text-gray-500 truncate">{product.title}</div>
              <div className="font-bold text-red-600">₪{price.toLocaleString()}</div>
          </div>
          <button
            onClick={addToCart}
            disabled={adding || !isAvailable}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm text-white ${
                 isAvailable ? 'bg-red-600' : 'bg-gray-400'
            }`}
          >
             {isAvailable ? 'הוסף לסל' : 'חסר'}
          </button>
      </div>

    </div>
  );
}