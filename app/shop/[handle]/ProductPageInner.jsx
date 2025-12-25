// /app/shop/[handle]/ProductPageInner.jsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ProductGrid from '@/components/ProductGrid';
import ProductGallery from '@/components/ProductGallery';
import RelatedProducts from '@/components/RelatedProducts';
import RelatedArticles from '@/components/RelatedArticles';
import WhatsAppButton from '@/components/WhatsAppButton';
import AutoShopBreadcrumbs from '@/components/AutoShopBreadcrumbs';
import CategorySidebar from '@/components/CategorySidebar';
import { getProductYearRange, formatYearRange } from '@/lib/productYears';

export default function ProductPageInner({ type, product, items, collectionStats }) {
  const [adding, setAdding] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});

  // 1. זיהוי האם זה חלק חילוף
  const isSparePart = useMemo(() => {
    if (!product) return false;
    const range = getProductYearRange(product);
    return range && (range.from || range.to);
  }, [product]);

  // הגדרת ברירת מחדל לאופציות
  useEffect(() => {
    if (product?.options) {
      const defaultOpts = {};
      product.options.forEach(opt => {
        if (opt.name !== 'Title') {
             defaultOpts[opt.name] = opt.values[0];
        }
      });
      setSelectedOptions(defaultOpts);
    }
  }, [product]);

  // בדיקה האם וריאציה ספציפית זמינה (עבור כפתורי המידות)
  const isValueAvailable = (optionName, value) => {
    if (!product?.variants?.edges) return true;
    
    // מוצאים את הוריאציה שמתאימה לערך הנוכחי + שאר הבחירות הקיימות
    const matchingVariant = product.variants.edges.find(({ node }) => {
        return node.selectedOptions.every(opt => {
            // עבור האופציה הנבדקת כרגע - בודקים את הערך מהלולאה
            if (opt.name === optionName) return opt.value === value;
            // עבור שאר האופציות - בודקים מה כבר מסומן ב-State
            return selectedOptions[opt.name] === opt.value;
        });
    });

    if (!matchingVariant) return false; // הוריאציה לא קיימת בכלל
    return matchingVariant.node.availableForSale && matchingVariant.node.quantityAvailable > 0;
  };

  // -------- מצב חיפוש --------
  if (type === 'search') {
    return (
      <ShopLayoutInternal>
        <ProductGrid products={items} />
      </ShopLayoutInternal>
    );
  }

  if (!product) {
    return <ShopLayoutInternal><div dir="rtl">מוצר לא נמצא</div></ShopLayoutInternal>;
  }

  // חישוב הוריאציה הנוכחית
  const currentVariant = useMemo(() => {
    if (!product.variants?.edges?.length) return null;
    const found = product.variants.edges.find(({ node }) => {
      if (node.title === 'Default Title') return true;
      return node.selectedOptions.every(opt => selectedOptions[opt.name] === opt.value);
    });
    return found?.node || product.variants.edges[0].node;
  }, [product, selectedOptions]);

  const tags = product.tags || [];
  const modelTag = tags.find((t) => t.toLowerCase().startsWith('model:'))?.replace('model:', '');
  const yr = getProductYearRange(product);
  const yrText = formatYearRange(yr);

  const addToCart = async () => {
    if (!currentVariant) return;
    setAdding(true);
    try {
      const res = await fetch('/api/shopify/cart/add', {
        method: 'POST',
        body: JSON.stringify({ variantId: currentVariant.id, quantity: 1 }),
      });
      const json = await res.json();
      if (json.cart) window.dispatchEvent(new Event('cartUpdated')); 
      else alert('שגיאה בהוספת המוצר לעגלה');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('אירעה שגיאה');
    } finally {
      setAdding(false);
    }
  };

  const whatsappMessage = `שלום, אני מעוניין במוצר "${product.title}"...`;
  const showAddToCart = currentVariant?.availableForSale && currentVariant?.quantityAvailable > 0;
  const handleOptionChange = (name, value) => setSelectedOptions(prev => ({ ...prev, [name]: value }));

  // לוגיקה לסיידבר
  let sidebarContent;
  if (isSparePart) {
    sidebarContent = null;
  } else {
    if (collectionStats) {
      // 👇 כאן היה התיקון: הסרתי את ה-div עם ה-hidden lg:block
      sidebarContent = (
        <div> 
            <div className="mb-2 font-bold text-gray-500 text-sm px-1">
                 עוד בקטגוריה:
            </div>
            <CategorySidebar 
                filtersFromAPI={[]} 
                dynamicData={{
                    types: collectionStats.types || [],
                    tags: collectionStats.tags || [],
                    vendors: collectionStats.vendors || [],
                    selectedType: product.productType
                }}
                basePath={`/shop/collection/${collectionStats.handle || 'all'}`} 
            />
        </div>
      );
    } else {
      sidebarContent = null; // שיניתי מ-div מוסתר ל-null נקי
    }
  }

  return (
    <ShopLayoutInternal 
        product={product} 
        hideSidebar={false} 
        customSidebar={sidebarContent}
    >
      
      <div className="px-2 md:px-0 mt-2 mb-4">
        <AutoShopBreadcrumbs product={product} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* גלריה */}
        <ProductGallery
          images={product.images?.edges}
          title={product.title}
          selectedImage={currentVariant?.image?.url}
        />

        {/* פרטי מוצר */}
        <div className="space-y-4 text-gray-900">
          <h1 className="text-3xl font-bold">{product.title}</h1>
          
          <div
            className="prose max-w-none text-gray-900"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />

          {/* בורר אפשרויות */}
          {product.options && product.options.length > 0 && product.options[0].name !== 'Title' && (
            <div className="mt-6 space-y-4"> 
              {product.options.map((opt) => (
                <div key={opt.id}>
                  <label className="block text-sm font-bold mb-1.5 text-gray-800">{opt.name}:</label>
                  <div className="flex flex-wrap gap-0.2">
                    {opt.values.map((val) => {
                      const isSelected = selectedOptions[opt.name] === val;
                      const isAvailable = isValueAvailable(opt.name, val);

                      return (
                        <button
                          key={val}
                          onClick={() => isAvailable && handleOptionChange(opt.name, val)}
                          disabled={!isAvailable}
                          className={`
                            px-2 py-1 min-w-[3rem] border rounded text-sm font-medium transition-all relative
                            ${!isAvailable 
                                ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed opacity-70' 
                                : isSelected 
                                    ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500' 
                            }
                          `}
                          style={!isAvailable ? {
                            backgroundImage: 'linear-gradient(to top right, transparent 48%, #9ca3af 49%, #9ca3af 51%, transparent 52%)'
                          } : {}}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* מחיר ופרטים */}
          {currentVariant && (
            <div className="text-sm space-y-2 border-t pt-4 mt-4">
              <div className="text-2xl font-bold text-red-600">
                {currentVariant.price.amount} {currentVariant.price.currencyCode}
              </div>
              <div className="flex flex-col gap-1 text-gray-600">
                <span><strong>מק״ט:</strong> {currentVariant.sku || 'N/A'}</span>
                <span>
                    <strong>מלאי:</strong>{' '}
                    {currentVariant.quantityAvailable > 0 
                      ? <span className="text-green-600 font-bold">זמין במלאי ({currentVariant.quantityAvailable})</span> 
                      : <span className="text-red-600 font-bold">אזל המלאי</span>}
                </span>
                {modelTag && <span><strong>דגם:</strong> {modelTag}</span>}
                {yrText && <span><strong>שנים:</strong> {yrText}</span>}
              </div>
            </div>
          )}

          <div className="pt-4">
            {showAddToCart ? (
               <button
               onClick={addToCart}
               disabled={adding || !currentVariant}
               className="w-full md:w-auto bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition shadow-lg font-bold text-lg flex items-center justify-center gap-2"
             >
               {adding ? 'מוסיף...' : 'הוסף לעגלה'}
             </button>
            ) : (
              <WhatsAppButton
                message={whatsappMessage}
                label={currentVariant?.availableForSale ? "הזמנה / בירור מלאי" : "נגמר המלאי – צור קשר"}
              />
            )}
          </div>
        </div>
      </div>

      <RelatedProducts
        vendor={product.vendor}
        productType={product.productType}
        model={modelTag}
        excludeHandle={product.handle}
      />

      <RelatedArticles
        tags={[product.vendor, modelTag].filter(Boolean)}
      />

    </ShopLayoutInternal>
  );
}