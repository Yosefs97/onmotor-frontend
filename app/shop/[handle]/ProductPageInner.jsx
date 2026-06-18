// /app/shop/[handle]/ProductPageInner.jsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link'; 
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ProductGrid from '@/components/ProductGrid';
import ProductGallery from '@/components/ProductGallery';
import RelatedProducts from '@/components/RelatedProducts';
import RelatedArticles from '@/components/RelatedArticles';
import WhatsAppButton from '@/components/WhatsAppButton';
import AutoShopBreadcrumbs from '@/components/AutoShopBreadcrumbs';
import CategorySidebar from '@/components/CategorySidebar';
import ArticleShareBottom from '@/components/ArticleShareBottom';
import { getProductYearRange, formatYearRange } from '@/lib/productYears';

export default function ProductPageInner({ type, product, items, collectionStats, modelImages = {} }) {
  const [adding, setAdding] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});

  const isSparePart = useMemo(() => {
    if (!product) return false;
    const range = getProductYearRange(product);
    return range && (range.from || range.to);
  }, [product]);

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

  const isValueAvailable = (optionName, value) => {
    if (!product?.variants?.edges) return true;
    
    const matchingVariant = product.variants.edges.find(({ node }) => {
        return node.selectedOptions.every(opt => {
            if (opt.name === optionName) return opt.value === value;
            return selectedOptions[opt.name] === opt.value;
        });
    });

    if (!matchingVariant) return false; 
    return matchingVariant.node.availableForSale && matchingVariant.node.quantityAvailable > 0;
  };

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

  const currentVariant = useMemo(() => {
    if (!product.variants?.edges?.length) return null;
    const found = product.variants.edges.find(({ node }) => {
      if (node.title === 'Default Title') return true;
      return node.selectedOptions.every(opt => selectedOptions[opt.name] === opt.value);
    });
    return found?.node || product.variants.edges[0].node;
  }, [product, selectedOptions]);

  const compatibleModels = useMemo(() => {
    const tags = product.tags || [];
    const models = [];
    
    tags.forEach(tag => {
      if (tag.toLowerCase().startsWith('fit:')) {
        const parts = tag.split(':');
        if (parts.length >= 3) {
          models.push({
            brand: parts[1].trim(),
            modelName: parts[2].trim(),
            tagCode: parts[3] ? parts[3].trim() : null 
          });
        }
      }
    });
    
    return models;
  }, [product.tags]);

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

  // 🔥 התיקון: בניית הקישור והודעת הוואטסאפ עם שבירות שורות מסודרות
  const productUrl = `https://www.onmotormedia.com/shop/${product?.handle}`;
  const whatsappMessage = `שלום,

אני מעוניין במוצר: "${product.title}"
(מק"ט: ${currentVariant?.sku || 'N/A'})

קישור למוצר:
${productUrl}

אשמח לעזרה.`;

  const showAddToCart = currentVariant?.availableForSale && currentVariant?.quantityAvailable > 0;
  const handleOptionChange = (name, value) => setSelectedOptions(prev => ({ ...prev, [name]: value }));

  let sidebarContent;
  if (isSparePart) {
    sidebarContent = null;
  } else {
    if (collectionStats) {
      sidebarContent = (
        <div> 
            <div className="mb-2 font-bold text-gray-500 text-sm px-1">עוד בקטגוריה:</div>
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
      sidebarContent = null;
    }
  }

  return (
    <ShopLayoutInternal product={product} hideSidebar={false} customSidebar={sidebarContent}>
      
      <div className="px-2 md:px-0 mt-2 mb-4">
        <AutoShopBreadcrumbs product={product} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ProductGallery
          images={product.images?.edges}
          title={product.title}
          selectedImage={currentVariant?.image?.url}
        />

        <div className="space-y-4 text-gray-900">
          
          {/* הכותרת ללא כפתור השיתוף (שעבר למטה) */}
          <h1 className="text-3xl font-bold">{product.title}</h1>
          
          <div
            className="prose max-w-none text-gray-900"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />

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
                {yrText && <span><strong>שנים:</strong> {yrText}</span>}
              </div>
            </div>
          )}

          {compatibleModels.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm font-bold text-gray-800 block mb-3">תואם לדגמים:</span>
              <div className="flex flex-wrap gap-2">
                {compatibleModels.map((m, idx) => {
                  const imageUrl = m.tagCode ? modelImages[m.tagCode] : null;
                  
                  const brandSlug = encodeURIComponent(m.brand);
                  const modelSlug = m.modelName.toLowerCase().replace(/\s+/g, '-');
                  
                  return (
                    <Link 
                      key={idx} 
                      href={`/shop/vendor/${brandSlug}/${modelSlug}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200 shadow-sm hover:bg-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                    >
                      {imageUrl && (
                        <img 
                          src={imageUrl} 
                          alt={m.brand} 
                          className="w-5 h-5 ml-2 object-contain rounded-full bg-white border border-gray-200 p-0.5" 
                        />
                      )}
                      {m.brand} {m.modelName}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 🔥 אזור הפעולות החדש והסימטרי */}
          <div className="pt-6 mt-8 border-t border-gray-100">
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* 1. הוסף לעגלה */}
              <div className="w-full md:flex-1">
                {showAddToCart ? (
                  <button
                    onClick={addToCart}
                    disabled={adding || !currentVariant}
                    className="w-full min-h-[50px] bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition shadow-md font-bold text-lg flex items-center justify-center gap-2"
                  >
                    {adding ? 'מוסיף...' : 'הוסף לעגלה'}
                  </button>
                ) : (
                  <div className="w-full flex justify-center">
                    <WhatsAppButton
                      message={whatsappMessage}
                      label={"נגמר המלאי – צור קשר לבירור"}
                    />
                  </div>
                )}
              </div>
              
              {/* 2. צור קשר / וואטסאפ */}
              {showAddToCart && (
                 <div className="w-full md:flex-1 flex justify-center">
                   <WhatsAppButton
                     message={whatsappMessage}
                     label={"צריך עזרה? פנה אלינו"}
                   />
                 </div>
              )}

              {/* 3. שיתוף מוצר */}
              <div className={`w-full ${showAddToCart ? 'md:flex-1' : ''} flex justify-center md:justify-end`}>
                <ArticleShareBottom label="שתף מוצר" />
              </div>

            </div>
          </div>

        </div>
      </div>

      <RelatedProducts
        partVendor={product.vendor}
        productType={product.productType}
        compatibleModels={compatibleModels}
        excludeHandle={product.handle}
      />

      <RelatedArticles
        tags={[product.vendor, ...compatibleModels.map(m => m.modelName)].filter(Boolean)}
      />

    </ShopLayoutInternal>
  );
}