// /lib/shop/fetchVendorModels.js
import { sfFetch } from '@/lib/shopify';
import { fetchModelImages } from './fetchModelImages';

export async function fetchVendorModels({ vendor, filters = {} }) {
  const cleanVendor = vendor.replace(/-/g, ' ');
  const vendorNoSpaces = vendor.replace(/[^a-zA-Z0-9]/g, '');

  // 1. יצירת וריאציות אותיות - חיפוש תגיות בשופיפיי הוא רגיש (Case Sensitive)
  const lowerVendor = cleanVendor.toLowerCase();
  const capVendor = cleanVendor.charAt(0).toUpperCase() + cleanVendor.slice(1);
  const upperVendor = cleanVendor.toUpperCase();

  // 2. התיקון הקריטי לחיפוש התגיות: 
  // בלי גרשיים! ועם \\: כדי לעשות Escape לנקודתיים. ככה הכוכבית עובדת כמו שצריך.
  const searchQuery = `${cleanVendor} OR tag:fit*`;

  // 3. הוספת תמיכה ב-cursor כדי שנוכל לדלג לעמודים הבאים אם יש יותר מ-250 מוצרים
  const query = `#graphql
    query GetVendorModels($query: String!, $cursor: String) {
      products(first: 250, query: $query, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            tags
            createdAt
            publishedAt
            images(first: 1) { edges { node { url } } }
          }
        }
      }
    }
  `;

  // מתחילים למשוך את תמונות הדגמים במקביל
  const modelImagesPromise = fetchModelImages();

  // 4. לולאת ה-Pagination שתמשוך את כלל המוצרים (פותר את הבעיה שהמוצר רחוק ברשימה)
  let allProducts = [];
  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    const res = await sfFetch(query, { query: searchQuery, cursor });
    const data = res?.data?.data || res?.data;
    const productsInfo = data?.products;

    if (!productsInfo?.edges) break;

    allProducts.push(...productsInfo.edges.map(e => e.node));

    hasNextPage = productsInfo.pageInfo.hasNextPage;
    cursor = productsInfo.pageInfo.endCursor;
  }

  const modelImagesMap = await modelImagesPromise;

  const modelMap = {};
  const normalizedVendorParam = vendor.toLowerCase().replace(/[^a-z0-9]/g, '');

  // עוברים על *כל* המוצרים שמשכנו
  allProducts.forEach((p) => {
    if (!p.tags) return;
    
    p.tags.forEach((t) => {
      if (t.toLowerCase().startsWith('fit:')) {
        const parts = t.split(':');
        if (parts.length >= 3) {
          const brandFromTag = parts[1].trim();
          const normalizedBrandFromTag = brandFromTag.toLowerCase().replace(/[^a-z0-9]/g, '');

          if (normalizedBrandFromTag === normalizedVendorParam) {
            const modelName = parts[2].trim();
            const tagCode = parts[3] ? parts[3].trim() : null;

            if (!modelMap[modelName]) {
              modelMap[modelName] = {
                name: modelName,
                handle: modelName.toLowerCase().replace(/\s+/g, '-'),
                tagCode: tagCode,
                products: []
              };
            }
            
            const img = p.images?.edges?.[0]?.node?.url;
            modelMap[modelName].products.push({
              createdAt: p.createdAt || p.publishedAt,
              images: img ? [img] : []
            });
          }
        }
      }
    });
  });

  const modelsArray = Object.values(modelMap).map(model => {
    let finalImage = model.tagCode ? modelImagesMap[model.tagCode] : null;

    if (!finalImage && model.products.length > 0) {
      const sortedByDate = model.products.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
      const oldestProduct = sortedByDate[0];
      if (oldestProduct.images.length > 0) {
        finalImage = oldestProduct.images[0];
      }
    }

    return {
      name: model.name,
      handle: model.handle,
      image: finalImage
    };
  });

  modelsArray.sort((a, b) =>
    a.name.localeCompare(b.name, 'he', { sensitivity: 'base' })
  );

  return modelsArray;
}