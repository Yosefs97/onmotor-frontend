// /lib/shop/fetchVendorModels.js
import { sfFetch } from '@/lib/shopify';

export async function fetchVendorModels({ vendor, filters = {} }) {
  const cleanVendor = vendor.replace(/-/g, ' ');
  const vendorNoSpaces = vendor.replace(/[^a-zA-Z0-9]/g, '');

  const lowerVendor = cleanVendor.toLowerCase();
  const capVendor = cleanVendor.charAt(0).toUpperCase() + cleanVendor.slice(1);
  const upperVendor = cleanVendor.toUpperCase();

  const searchQuery = `${cleanVendor} OR tag:fit\\:${lowerVendor}* OR tag:fit\\:${capVendor}* OR tag:fit\\:${upperVendor}* OR tag:fit\\:${vendorNoSpaces}*`;

  // 1. שליפת כלל המוצרים של היצרן (כולל פגינציה)
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

  // 2. שליפת *כל* ה-Metaobjects של הדגמים (כולל פגינציה כדי שלא יעלמו דגמים אם יש מעל 250)
  let metaEdges = [];
  let metaHasNext = true;
  let metaCursor = null;

  const metaQuery = `#graphql
    query GetVendorModelsFromMeta($cursor: String) {
      metaobjects(type: "moto_model", first: 250, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
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

  while (metaHasNext) {
    const metaRes = await sfFetch(metaQuery, { cursor: metaCursor });
    const metaData = metaRes?.data?.data || metaRes?.data;
    const metaobjectsInfo = metaData?.metaobjects;

    if (!metaobjectsInfo?.edges) break;

    metaEdges.push(...metaobjectsInfo.edges);
    
    metaHasNext = metaobjectsInfo.pageInfo.hasNextPage;
    metaCursor = metaobjectsInfo.pageInfo.endCursor;
  }

  const modelMap = {};
  const normalizedVendorParam = vendor.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // 🔥 מילון תמונות גלובלי: שומרים את כל התמונות במערכת לפי קוד דגם
  const globalImageMap = {}; 

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

  // 3. בניית השלד של דגמי היצרן הנוכחי
  metaEdges.forEach(({ node }) => {
    const handleLower = node.handle.toLowerCase();
    const displayNameLower = (node.displayName || '').toLowerCase();
    
    // בודק אם ה-Metaobject שייך ליצרן הזה לפי ה-handle או ה-displayName
    if (handleLower.includes(normalizedVendorParam) || displayNameLower.includes(normalizedVendorParam)) {
      let tagCode = null;
      if (node.fields) {
        node.fields.forEach((f) => {
          if (f.key === 'tag_code') tagCode = f.value?.toLowerCase().trim();
        });
      }

      let modelName = node.displayName || '';
      const removeVendorRegex = new RegExp(`^${cleanVendor}|^${vendorNoSpaces}`, 'i');
      modelName = modelName.replace(removeVendorRegex, '').trim();

      if (modelName) {
        const safeKey = tagCode || modelName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        modelMap[safeKey] = {
          name: modelName,
          handle: modelName.toLowerCase().replace(/\s+/g, '-'),
          tagCode: tagCode,
          image: tagCode ? globalImageMap[tagCode] : null, // חיבור התמונה מהמילון הגלובלי
          products: []
        };
      }
    }
  });

  // 4. שיוך המוצרים לדגמים
  allProducts.forEach((p) => {
    if (!p.tags) return;
    
    p.tags.forEach((t) => {
      if (t.toLowerCase().startsWith('fit:')) {
        const parts = t.split(':');
        if (parts.length >= 3) {
          const brandFromTag = parts[1].trim().toLowerCase().replace(/[^a-z0-9]/g, '');

          if (brandFromTag === normalizedVendorParam) {
            const rawModelName = parts[2].trim();
            const tagCode = parts[3] ? parts[3].trim().toLowerCase() : null;
            
            const modelNormalizedName = rawModelName.toLowerCase().replace(/[^a-z0-9]/g, '');
            const targetKey = (tagCode && modelMap[tagCode]) ? tagCode : modelNormalizedName;

            if (!modelMap[targetKey]) {
              modelMap[targetKey] = {
                name: rawModelName,
                handle: rawModelName.toLowerCase().replace(/\s+/g, '-'),
                tagCode: tagCode,
                image: tagCode ? globalImageMap[tagCode] : null, // חיבור התמונה מהמילון הגלובלי גם פה
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

  // 5. המרה למערך והחלת הגיבוי הסופי (Fallback)
  const modelsArray = Object.values(modelMap)
    .filter(model => model.products.length > 0 || model.image)
    .map(model => {
      // עדיפות ראשונה: תמונה שנמשכה מה-Metaobject
      let finalImage = model.image || (model.tagCode ? globalImageMap[model.tagCode] : null);

      // עדיפות שניה: גיבוי של מוצר (רק אם ממש חסרה תמונה בשופיפיי)
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