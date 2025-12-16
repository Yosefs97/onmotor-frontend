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

  // 1. זיהוי האם זה חלק חילוף (לפי טווח שנים)
  const isSparePart = useMemo(() => {
    if (!product) return false;
    const range = getProductYearRange(product);
    // אם יש טווח שנים, זה כנראה חלק חילוף לאופנוע ספציפי
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

  // חישוב הוריאציה
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

  // 👇👇👇 2. לוגיקה מתוקנת לסיידבר 👇👇👇
  let sidebarContent;

  if (isSparePart) {
    // אם זה חלק חילוף: נשלח null כדי שה-ShopLayout יציג את ברירת המחדל (מנוע החיפוש)
    sidebarContent = null;
  } else {
    // אם זה אביזר: אנחנו חייבים להציג סיידבר, או div ריק.
    // אסור להחזיר null אחרת יופיע החיפוש של החלפים.
    
    if (collectionStats) {
      sidebarContent = (
        <div className="hidden lg:block">
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
      // אם אין סטטיסטיקות (אולי אין תגית קטגוריה), נציג שטח ריק כדי "לדרוס" את החיפוש
      sidebarContent = <div className="hidden lg:block"></div>;
    }
  }
  // 👆👆👆 סוף הלוגיקה המתוקנת

  return (
    <ShopLayoutInternal 
        product={product} 
        hideSidebar={false} 
        // מעבירים את המשתנה שיצרנו למעלה
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
            className="prose max-w-none text-gray-600"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />

          {/* בורר אפשרויות */}
          {product.options && product.options.length > 0 && product.options[0].name !== 'Title' && (
            <div className="bg-gray-50 p-4 rounded-lg border space-y-3 mt-4">
              {product.options.map((opt) => (
                <div key={opt.id}>
                  <label className="block text-sm font-bold mb-2 text-gray-800">{opt.name}:</label>
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((val) => {
                      const isSelected = selectedOptions[opt.name] === val;
                      return (
                        <button
                          key={val}
                          onClick={() => handleOptionChange(opt.name, val)}
                          className={`px-4 py-2 border rounded-md text-sm font-medium transition-all ${
                            isSelected 
                              ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                          }`}
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