// /app/shop/[handle]/ProductPageInner.jsx
'use client';

import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ProductGrid from '@/components/ProductGrid';
import ProductGallery from '@/components/ProductGallery';
import RelatedProducts from '@/components/RelatedProducts';
import RelatedArticles from '@/components/RelatedArticles';
import WhatsAppButton from '@/components/WhatsAppButton';
import { getProductYearRange, formatYearRange } from '@/lib/productYears';

export default function ProductPageInner({ type, product, items }) {
  // -------- מצב: חיפוש --------
  if (type === 'search') {
    return (
      <ShopLayoutInternal>
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

  // מודל מהתגים
  const modelTag = tags.find((t) => t.toLowerCase().startsWith('model:'))
    ?.replace('model:', '');

  // טווח שנים
  const yr = getProductYearRange(product);
  const yrText = formatYearRange(yr);

  const whatsappMessage =
    `שלום,\n` +
    `אני מעוניין בחלק "${product.title}".\n` +
    `דגם: ${modelTag || firstVariant?.title}\n` +
    `מק״ט: ${firstVariant?.sku || 'N/A'}\n` +
    (yrText ? `שנים: ${yrText}` : '');

  return (
    <ShopLayoutInternal product={product}>
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

          {firstVariant?.availableForSale ? (
            <WhatsAppButton
              message={whatsappMessage}
              label="הזמנה / בירור מלאי"
            />
          ) : (
            <WhatsAppButton
              message={whatsappMessage}
              label="נגמר המלאי – צור קשר"
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
