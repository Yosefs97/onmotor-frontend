// /app/shop/[handle]/ProductPageInner.jsx
'use client';

import { useState } from 'react';
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ProductGrid from '@/components/ProductGrid';
import ProductGallery from '@/components/ProductGallery';
import RelatedProducts from '@/components/RelatedProducts';
import RelatedArticles from '@/components/RelatedArticles';
import WhatsAppButton from '@/components/WhatsAppButton';
import AutoShopBreadcrumbs from '@/components/AutoShopBreadcrumbs'; // 👈 ייבוא הפירורים
import { getProductYearRange, formatYearRange } from '@/lib/productYears';

export default function ProductPageInner({ type, product, items }) {
  const [adding, setAdding] = useState(false);

  // -------- מצב: חיפוש --------
  if (type === 'search') {
    return (
      <ShopLayoutInternal>
         {/* אפשר להוסיף גם כאן פירורים בעתיד אם תרצה */}
        <ProductGrid products={items} />
      </ShopLayoutInternal>
    );
  }

  // -------- מצב: מוצר יחיד --------
  if (!product) {
    return <ShopLayoutInternal><div dir="rtl">מוצר לא נמצא</div></ShopLayoutInternal>;
  }

  const firstVariant = product.variants?.edges?.[0]?.node;
  const tags = product.tags || [];

  const modelTag = tags.find((t) => t.toLowerCase().startsWith('model:'))
    ?.replace('model:', '');

  const yr = getProductYearRange(product);
  const yrText = formatYearRange(yr);

  const addToCart = async () => {
    if (!firstVariant) return;
    setAdding(true);
    
    try {
      const res = await fetch('/api/shopify/cart/add', {
        method: 'POST',
        body: JSON.stringify({
          variantId: firstVariant.id,
          quantity: 1,
        }),
      });
      
      const json = await res.json();
      
      if (json.cart) {
        window.dispatchEvent(new Event('cartUpdated')); 
      } else {
        alert('שגיאה בהוספת המוצר לעגלה');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('אירעה שגיאה, אנא נסה שנית');
    } finally {
      setAdding(false);
    }
  };

  const whatsappMessage =
    `שלום,\n` +
    `אני מעוניין בחלק "${product.title}".\n` +
    `דגם: ${modelTag || firstVariant?.title}\n` +
    `מק״ט: ${firstVariant?.sku || 'N/A'}\n` +
    (yrText ? `שנים: ${yrText}` : '');

  const showAddToCart = firstVariant?.availableForSale && firstVariant?.quantityAvailable > 0;

  return (
    <ShopLayoutInternal product={product}>
      
      {/* 👈 מיקום הפירורים: מעל הגריד הראשי */}
      <div className="px-2 md:px-0 mt-2 mb-4">
        <AutoShopBreadcrumbs product={product} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <ProductGallery
          images={product.images?.edges}
          title={product.title}
        />

        <div className="space-y-3 text-gray-900">

          <h1 className="text-2xl font-bold">{product.title}</h1>

          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />

          {firstVariant && (
            <div className="text-sm space-y-1 border-t pt-2">

              <div><strong>מחיר:</strong> {firstVariant.price.amount} {firstVariant.price.currencyCode}</div>
              <div><strong>מק״ט:</strong> {firstVariant.sku || 'N/A'}</div>
              <div><strong>מלאי:</strong> {firstVariant.quantityAvailable}</div>

              <div>
                <strong>דגם:</strong> {modelTag || '—'}
              </div>

              {yrText && (
                <div><strong>שנים:</strong> {yrText}</div>
              )}
            </div>
          )}

          {showAddToCart ? (
             <button
             onClick={addToCart}
             disabled={adding || !firstVariant}
             className="w-full md:w-auto bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition disabled:opacity-50 font-bold flex items-center justify-center gap-2"
           >
             {adding ? 'מוסיף...' : 'הוסף לעגלה'}
           </button>
          ) : (
            <WhatsAppButton
              message={whatsappMessage}
              label={firstVariant?.availableForSale ? "הזמנה / בירור מלאי" : "נגמר המלאי – צור קשר"}
            />
          )}

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