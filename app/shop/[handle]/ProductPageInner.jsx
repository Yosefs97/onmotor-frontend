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
import ProductInfoModals from '@/components/ProductInfoModals';
import { getProductYearRange, formatYearRange } from '@/lib/productYears';

export default function ProductPageInner({ type, product, items, collectionStats, modelImages = {} }) {
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  useEffect(() => {
    if (currentVariant?.quantityAvailable > 0 && quantity > currentVariant.quantityAvailable) {
      setQuantity(currentVariant.quantityAvailable);
    }
    if (quantity < 1) {
      setQuantity(1);
    }
  }, [currentVariant, quantity]);

  const increaseQty = () => {
    if (currentVariant && quantity < currentVariant.quantityAvailable) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQty = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQtyChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 1) {
      if (currentVariant && val > currentVariant.quantityAvailable) {
        setQuantity(currentVariant.quantityAvailable);
      } else {
        setQuantity(val);
      }
    }
  };

  const handleQtyBlur = (e) => {
    const val = parseInt(e.target.value);
    if (isNaN(val) || val < 1) setQuantity(1);
  };

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
    if (!currentVariant || quantity < 1) return;
    setAdding(true);
    try {
      const res = await fetch('/api/shopify/cart/add', {
        method: 'POST',
        body: JSON.stringify({ variantId: currentVariant.id, quantity: quantity }), 
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

  // 🔥 התיקון המנצח: מדלגים על עמוד ה-Checkout שלנו ושולחים ישירות לממשק הסליקה של שופיפיי
  const buyNow = async () => {
    if (!currentVariant || quantity < 1) return;
    setBuying(true);
    try {
      const res = await fetch('/api/shopify/cart/add', {
        method: 'POST',
        body: JSON.stringify({ variantId: currentVariant.id, quantity: quantity }), 
      });
      const json = await res.json();
      
      if (json.cart) {
        window.dispatchEvent(new Event('cartUpdated')); 
        
        // אם לשופיפיי יש קישור סליקה מוכן, נשלח את הלקוח ישירות אליו (כמו שעשינו בעגלה)
        if (json.cart.checkoutUrl) {
          window.location.href = json.cart.checkoutUrl;
        } else {
          // רשת ביטחון: אם מסיבה כלשהי אין קישור, נעביר לדף העגלה הראשי
          window.location.href = '/shop/cart';
        }
      } else {
        alert('שגיאה בהעברה לתשלום');
        setBuying(false);
      }
    } catch (error) {
      console.error('Error in buy now:', error);
      alert('אירעה שגיאה');
      setBuying(false);
    }
  };

  const productUrl = `https://www.onmotormedia.com/shop/${product?.handle}`;
  const whatsappMessage = `שלום,

אני מעוניין במוצר: "${product.title}"
(מק"ט: ${currentVariant?.sku || 'N/A'})

קישור למוצר:
${productUrl}

אשמח לעזרה.`;

  const showAddToCart = currentVariant?.availableForSale && currentVariant?.quantityAvailable > 0;
  const handleOptionChange = (name, value) => {
    setSelectedOptions(prev => ({ ...prev, [name]: value }));
    setQuantity(1);
  };

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
      
      <div className="px-2 md:px-0 mt-2 mb-3 flex justify-between items-center">
        <AutoShopBreadcrumbs product={product} />
        <div className="hidden sm:block">
           <ArticleShareBottom label="שתף" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        <div className="flex flex-col gap-6 relative">
          <ProductGallery
            images={product.images?.edges}
            title={product.title}
            selectedImage={currentVariant?.image?.url}
          />
          
          <div className="hidden md:block">
            <RelatedProducts 
              excludeHandle={product.handle} 
              productTags={product.tags} // חובה לוודא שהשורה הזו קיימת!
            />
          </div>
        </div>

        <div className="space-y-4 text-gray-900">
          
          <div className="flex justify-between items-start">
             <h1 className="text-3xl font-bold leading-tight">{product.title}</h1>
             <div className="sm:hidden mt-1 ml-2">
                 <ArticleShareBottom label="" />
             </div>
          </div>
          
          <div
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />

          {product.options && product.options.length > 0 && product.options[0].name !== 'Title' && (
            <div className="mt-4"> 
              {product.options.map((opt) => (
                <div key={opt.id} className="mb-3">
                  <label className="block text-sm font-bold mb-1 text-gray-800">{opt.name}:</label>
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((val) => {
                      const isSelected = selectedOptions[opt.name] === val;
                      const isAvailable = isValueAvailable(opt.name, val);

                      return (
                        <button
                          key={val}
                          onClick={() => isAvailable && handleOptionChange(opt.name, val)}
                          disabled={!isAvailable}
                          className={`
                            px-4 py-1.5 min-w-[3.5rem] border rounded-lg text-sm font-medium transition-all relative
                            ${!isAvailable 
                                ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed opacity-70' 
                                : isSelected 
                                    ? 'bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-200' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500 hover:bg-gray-50' 
                            }
                          `}
                          style={!isAvailable ? {
                            backgroundImage: 'linear-gradient(to top right, transparent 48%, #e5e7eb 49%, #e5e7eb 51%, transparent 52%)'
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
            <div className="text-sm border-y border-gray-100 py-3 my-3 bg-gray-50/50 px-4 rounded-xl flex flex-col gap-1">
              
              <div className="text-3xl font-black text-red-600 flex items-center gap-2 mb-1">
                {currentVariant.price.amount} <span className="text-xl font-bold">{currentVariant.price.currencyCode}</span>
              </div>
              
              <div className="flex flex-col gap-1 text-gray-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <strong>מק״ט:</strong> {currentVariant.sku || 'N/A'}
                </span>
                
                <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${currentVariant.quantityAvailable > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <strong>מלאי:</strong>{' '}
                    {currentVariant.quantityAvailable > 0 
                      ? <span className="text-green-600 font-bold">זמין במלאי ({currentVariant.quantityAvailable} יחידות)</span> 
                      : <span className="text-red-600 font-bold">אזל המלאי, פנה אלינו להזמנה</span>}
                </span>

                {yrText && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <strong>שנים:</strong> {yrText}
                  </span>
                )}
              </div>

            </div>
          )}

          {compatibleModels.length > 0 && (
            <div className="pt-2">
              <span className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/></svg>
                 תואם לדגמים:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {compatibleModels.map((m, idx) => {
                  const imageUrl = m.tagCode ? modelImages[m.tagCode] : null;
                  const brandSlug = encodeURIComponent(m.brand);
                  const modelSlug = m.modelName.toLowerCase().replace(/\s+/g, '-');
                  
                  return (
                    <Link 
                      key={idx} 
                      href={`/shop/vendor/${brandSlug}/${modelSlug}`}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-200 shadow-sm hover:border-red-400 hover:text-red-600 hover:shadow transition-all cursor-pointer group"
                    >
                      {imageUrl && (
                        <img 
                          src={imageUrl} 
                          alt={m.brand} 
                          className="w-4 h-4 ml-1.5 object-contain rounded-full bg-gray-50 border border-gray-100 p-px group-hover:scale-110 transition-transform" 
                        />
                      )}
                      {m.brand} {m.modelName}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-5 mt-4 border-t border-gray-200 space-y-3">
            
            {showAddToCart ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                
                <div className="flex items-center justify-between border border-gray-300 rounded-lg bg-white h-[50px] w-full sm:w-32 flex-shrink-0 shadow-sm">
                   <button 
                     onClick={increaseQty} 
                     disabled={quantity >= currentVariant.quantityAvailable}
                     className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-r-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                     aria-label="הוסף כמות"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                   </button>
                   
                   <input 
                     type="number" 
                     value={quantity}
                     onChange={handleQtyChange}
                     onBlur={handleQtyBlur}
                     className="w-full h-full text-center font-bold text-gray-900 border-none outline-none focus:ring-0 p-0 m-0 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                   />
                   
                   <button 
                     onClick={decreaseQty} 
                     disabled={quantity <= 1}
                     className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-l-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                     aria-label="הפחת כמות"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                   </button>
                </div>

                <div className="flex gap-2 w-full">
                  <button
                    onClick={addToCart}
                    disabled={adding || !currentVariant}
                    className="flex-1 h-[50px] bg-red-600 text-white disabled:bg-red-500 disabled:opacity-100 disabled:text-white rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg font-bold text-base md:text-lg flex items-center justify-center gap-1.5"
                  >
                    {adding ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>מוסיף...</span>
                      </>
                    ) : 'הוספה לסל'}
                  </button>

                  <button
                    onClick={buyNow}
                    disabled={buying || !currentVariant}
                    className="flex-1 h-[50px] bg-zinc-900 text-white disabled:bg-zinc-700 disabled:opacity-100 disabled:text-white rounded-lg hover:bg-black transition-all shadow-md hover:shadow-lg font-bold text-base md:text-lg flex items-center justify-center gap-1.5"
                  >
                    {buying ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>מעבד...</span>
                      </>
                    ) : 'לרכישה'}
                  </button>
                </div>

              </div>
            ) : (
              <div className="w-full">
                <WhatsAppButton
                  message={whatsappMessage}
                  label={"המוצר אזל מהמלאי – צור קשר לבירור והזמנה"}
                />
              </div>
            )}

            <div className="w-full">
              <WhatsAppButton
                message={whatsappMessage}
                label={"צריך עזרה עם החלק? דבר איתנו בוואטסאפ"}
              />
            </div>
            
          </div>

          <div className="mt-2">
            <ProductInfoModals />
          </div>

        </div>
      </div>

      <RelatedArticles
        tags={[product.vendor, ...compatibleModels.map(m => m.modelName)].filter(Boolean)}
      />

      {/* ========================================================= */}
      {/* 🌟 סרגל תחתון דביק למובייל  🌟 */}
      {/* ========================================================= */}
      <div 
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] p-3 z-50 transition-transform duration-300 ease-in-out ${
          showStickyBar ? 'translate-y-0' : 'translate-y-[150%]'
        }`}
        dir="rtl"
      >
        <div className="max-w-md mx-auto w-full">
          {showAddToCart ? (
            <div className="flex items-center gap-3">
              <button
                onClick={buyNow}
                disabled={buying || !currentVariant}
                className="flex-1 h-[50px] bg-zinc-900 text-white disabled:bg-zinc-700 disabled:opacity-100 disabled:text-white rounded-xl hover:bg-black transition-all font-bold text-lg flex items-center justify-center gap-1.5"
              >
                {buying ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>מעבד...</span>
                  </>
                ) : 'לרכישה'}
              </button>
              
              <button
                onClick={addToCart}
                disabled={adding || !currentVariant}
                className="flex-1 h-[50px] bg-red-600 text-white disabled:bg-red-500 disabled:opacity-100 disabled:text-white rounded-xl hover:bg-red-700 transition-all font-bold text-lg flex items-center justify-center gap-1.5"
              >
                {adding ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>מוסיף...</span>
                  </>
                ) : 'הוספה לסל'}
              </button>
            </div>
          ) : (
             <div className="w-full">
               <WhatsAppButton
                 message={whatsappMessage}
                 label={"אזל מהמלאי – לבירור בוואטסאפ"}
               />
             </div>
          )}
        </div>
      </div>

    </ShopLayoutInternal>
  );
}