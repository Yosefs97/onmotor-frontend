// /lib/shop/fetchVendorModels.js
import { sfFetch } from '@/lib/shopify';

// פונקציית עזר ליצירת וריאציות חיפוש עבור מותגים בעלי שמות מורכבים (כמו GAS GAS)
function getVendorVariations(vendor) {
  const clean = vendor.replace(/-/g, ' ').trim();
  const noSpaces = vendor.replace(/[^a-zA-Z0-9]/g, '').trim();
  
  const variations = new Set([
    clean,
    noSpaces,
    vendor,
    clean.toLowerCase(),
    clean.toUpperCase()
  ]);

  // טיפול מיוחד במותג GAS GAS בהתאם למבנה באדמין
  if (clean.toLowerCase().replace(/\s+/g, '') === 'gasgas') {
    variations.add('GAS GAS');
    variations.add('GasGas');
  }

  return Array.from(variations);
}

export async function fetchVendorModels({ vendor, filters = {} }) {
  const variations = getVendorVariations(vendor);
  const normalizedVendorParam = vendor.toLowerCase().replace(/[^a-z0-9]/g, '');

  // בניית שאילתת חיפוש חסינת תקלות - מחפשים ישירות לפי שדה ה-vendor הרשמי או תגיות פשוטות
  const vendorQueryParts = variations.map(v => `vendor:'${v}'`).join(' OR ');
  const tagQueryParts = variations.map(v => `tag:'${v}'`).join(' OR ');
  const searchQuery = `(${vendorQueryParts}) OR (${tagQueryParts})`;

  // 1. שליפת כלל המוצרים המשויכים למותג (כולל לולאת פגינציה מלאה)
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

  const modelMap = {};
  const globalImageMap = {}; 

  // 2. שליפת ה-Metaobjects במכה אחת (עד 250 דגמים, ללא סינון שרת שעלול לפספס)
  const metaQuery = `#graphql
    query GetVendorModelsFromMeta {
      metaobjects(type: "moto_model", first: 250) {
        edges {
          node {
            handle
            displayName
            fields {
              key
              value
              reference {
                ... on MediaImage {
                  image {
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const metaRes = await sfFetch(metaQuery);
  const metaData = metaRes?.data?.data || metaRes?.data;
  const metaEdges = metaData?.metaobjects?.edges || [];

  // מיפוי גלובלי של כל תמונות האופנועים לפי ה-tag_code שלהם
  metaEdges.forEach(({ node }) => {
    let tagCode = null;
    let imageUrl = null;
    if (node.fields) {
      node.fields.forEach((f) => {
        if (f.key === 'tag_code') tagCode = f.value?.toLowerCase().trim();
        if (f.key === 'image' && f.reference?.image?.url) imageUrl = f.reference.image.url;
      });
    }
    if (tagCode && imageUrl) {
      globalImageMap[tagCode] = imageUrl;
    }
  });

  // 3. בניית שלד הדגמים עבור היצרן הספציפי
  metaEdges.forEach(({ node }) => {
    const handleLower = node.handle.toLowerCase();
    const displayNameLower = (node.displayName || '').toLowerCase();
    
    // התאמה גמישה ליצרן הנוכחי
    const matchesVendor = variations.some(v => {
      const normalizedV = v.toLowerCase().replace(/[^a-z0-9]/g, '');
      return handleLower.includes(normalizedV) || displayNameLower.includes(normalizedV);
    });

    if (matchesVendor) {
      let tagCode = null;
      if (node.fields) {
        node.fields.forEach((f) => {
          if (f.key === 'tag_code') tagCode = f.value?.toLowerCase().trim();
        });
      }

      let modelName = node.displayName || '';
      // ניקוי שם המותג מתחילת שם הדגם (למשל "GASGAS EC 300" הופך ל-"EC 300")
      variations.forEach(v => {
        const removeRegex = new RegExp(`^${v}`, 'i');
        modelName = modelName.replace(removeRegex, '').trim();
      });

      if (modelName) {
        const safeKey = tagCode || modelName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        modelMap[safeKey] = {
          name: modelName,
          handle: modelName.toLowerCase().replace(/\s+/g, '-'),
          tagCode: tagCode,
          image: tagCode ? globalImageMap[tagCode] : null,
          products: []
        };
      }
    }
  });

  // 4. שיוך וסריקת המוצרים שמשכנו אל תוך מפת הדגמים
  allProducts.forEach((p) => {
    if (!p.tags) return;
    
    p.tags.forEach((t) => {
      if (t.toLowerCase().startsWith('fit:')) {
        const parts = t.split(':');
        if (parts.length >= 3) {
          const brandFromTag = parts[1].trim().toLowerCase().replace(/[^a-z0-9]/g, '');

          if (brandFromTag === normalizedVendorParam || brandFromTag === 'gasgas' || brandFromTag === 'gas gas') {
            const rawModelName = parts[2].trim();
            const tagCode = parts[3] ? parts[3].trim().toLowerCase() : null;
            
            const modelNormalizedName = rawModelName.toLowerCase().replace(/[^a-z0-9]/g, '');
            const targetKey = (tagCode && modelMap[tagCode]) ? tagCode : modelNormalizedName;

            if (!modelMap[targetKey]) {
              modelMap[targetKey] = {
                name: rawModelName,
                handle: rawModelName.toLowerCase().replace(/\s+/g, '-'),
                tagCode: tagCode,
                image: tagCode ? globalImageMap[tagCode] : null,
                products: []
              };
            }
            
            const img = p.images?.edges?.[0]?.node?.url;
            modelMap[targetKey].products.push({
              createdAt: p.createdAt || p.publishedAt,
              images: img ? [img] : []
            });
          }
        }
      }
    });
  });

  // 5. בניית המערך הסופי עם שמירה קשיחה על תמונת האופנוע מהמטא-אובייקט
  const modelsArray = Object.values(modelMap)
    .filter(model => model.products.length > 0 || model.image)
    .map(model => {
      // עדיפות עליונה מוחלטת: תמונת האופנוע הרשמית מה-Metaobject
      let finalImage = model.image || (model.tagCode ? globalImageMap[model.tagCode] : null);

      // רק אם אין שום תמונת מטא-אובייקט, המערכת תיקח תמונת מוצר כגיבוי אחרון
      if (!finalImage && model.products.length > 0) {
        const sortedByDate = model.products.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
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

  return modelsArray.sort((a, b) => a.name.localeCompare(b.name, 'he', { sensitivity: 'base' }));
}