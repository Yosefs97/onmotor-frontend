//app\shop\[handle]\ProductPageInner.jsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import RelatedProducts from '@/components/RelatedProducts';
import RelatedArticles from '@/components/RelatedArticles';
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ProductGrid from '@/components/ProductGrid';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProductGallery from '@/components/ProductGallery';
import { getProductYearRange, formatYearRange } from '@/lib/productYears';

export default function ProductPage() {
  const { handle } = useParams();
  const searchParams = useSearchParams();
  const filters = Object.fromEntries(searchParams.entries());

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [items, setItems] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      setProduct(null);
      return;
    }
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/shopify/product/${handle}`);
      const json = await res.json();
      setProduct(json.item || null);
      setLoading(false);
    })();
  }, [handle, JSON.stringify(filters)]);

  useEffect(() => {
    if (Object.keys(filters).length === 0) return;
    const fetchSearch = async () => {
      setLoadingSearch(true);
      const params = new URLSearchParams({ ...filters, limit: '24' });
      const res = await fetch(`/api/shopify/search?${params.toString()}`);
      const json = await res.json();
      setItems(json.items || []);
      setLoadingSearch(false);
    };
    fetchSearch();
  }, [JSON.stringify(filters)]);

  if (Object.keys(filters).length > 0) {
    return (
      <ShopLayoutInternal>
        {loadingSearch && <div className="py-6 text-center">טוען חיפוש...</div>}
        {!loadingSearch && <ProductGrid products={items} />}
      </ShopLayoutInternal>
    );
  }

  if (loading) return <div dir="rtl">טוען...</div>;
  if (!product) return <div dir="rtl">מוצר לא נמצא</div>;

  const firstVariant = product.variants?.edges?.[0]?.node;
  const tags = product.tags || [];

  // ✅ מודל מהתגים
  let modelTag = null;
  const modelFromTag = tags.find((t) => t.toLowerCase().startsWith('model:'));
  if (modelFromTag) modelTag = modelFromTag.replace('model:', '');

  // ✅ טווח שנים אך ורק מה־metafields
  const yr = getProductYearRange(product);
  const yrText = formatYearRange(yr);

  const addToCart = async () => {
    if (!firstVariant) return;
    setAdding(true);
    const res = await fetch('/api/shopify/cart/add', {
      method: 'POST',
      body: JSON.stringify({
        variantId: firstVariant.id,
        quantity: 1,
      }),
    });
    const json = await res.json();
    setAdding(false);
    if (json.cart) {
      window.dispatchEvent(new Event('cartUpdated'));
    } else {
      alert('שגיאה בהוספת המוצר לעגלה');
    }
  };

  const whatsappMessage =
    `שלום,\n` +
    `אני מעוניין בחלק "${product.title}" עבור דגם "${modelTag || firstVariant?.title}".\n` +
    `מספר מק״ט: ${firstVariant?.sku || 'N/A'}\n` +
    (yrText ? `שנים: ${yrText}` : '');

  return (
    <ShopLayoutInternal product={product}>
      <div className="grid md:grid-cols-2 gap-6">
        <ProductGallery images={product.images?.edges} title={product.title} />

        <div className="space-y-3">
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />

          {firstVariant && (
            <div className="text-sm space-y-1 border-t pt-2">
              <div>
                <span className="font-bold">מחיר: </span>
                {firstVariant.price.amount} {firstVariant.price.currencyCode}
              </div>
              <div>
                <span className="font-bold">מק״ט: </span>
                {firstVariant.sku || 'N/A'}
              </div>
              <div>
                <span className="font-bold">מלאי: </span>
                {firstVariant.quantityAvailable}
              </div>
              <div>
                <span className="font-bold">דגם: </span>
                {modelTag ? (
                  <a
                    href={`/shop/vendor/${product.vendor}/${encodeURIComponent(modelTag)}`}
                    className="text-blue-600 underline"
                  >
                    {modelTag}
                  </a>
                ) : (
                  '—'
                )}
              </div>
              {yrText && (
                <div>
                  <span className="font-bold">שנים: </span>
                  {yrText}
                </div>
              )}
            </div>
          )}

          {firstVariant?.availableForSale && firstVariant?.quantityAvailable > 0 ? (
            <button
              onClick={addToCart}
              disabled={adding || !firstVariant}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition disabled:opacity-50"
            >
              {adding ? 'מוסיף...' : 'הוסף לעגלה'}
            </button>
          ) : (
            <WhatsAppButton message={whatsappMessage} label="נגמר המלאי – צור קשר" />
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
        tags={[
          product.vendor,
          modelTag,
          modelTag ? modelTag.charAt(0).toUpperCase() + modelTag.slice(1) : null,
        ].filter(Boolean)}
      />
    </ShopLayoutInternal>
  );
}
