// /lib/shop/fetchVendorModels.js
import { sfFetch } from '@/lib/shopify';

export async function fetchVendorModels({ vendor, filters = {} }) {
  const cleanVendor = vendor.replace(/-/g, ' ');
  const vendorNoSpaces = vendor.replace(/[^a-zA-Z0-9]/g, '');

  const lowerVendor = cleanVendor.toLowerCase();
  const capVendor = cleanVendor.charAt(0).toUpperCase() + cleanVendor.slice(1);
  const upperVendor = cleanVendor.toUpperCase();

  const searchQuery = `${cleanVendor} OR tag:fit\\:${lowerVendor}* OR tag:fit\\:${capVendor}* OR tag:fit\\:${upperVendor}* OR tag:fit\\:${vendorNoSpaces}*`;

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

  // משיכת כל המוצרים
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
  const normalizedVendorParam = vendor.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 🌟 שאילתה אחת ל-Metaobjects שמושכת גם את שלד הדגמים וגם את התמונות!
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

  if (metaData?.metaobjects?.edges) {
    metaData.metaobjects.edges.forEach(({ node }) => {
      const handleLower = node.handle.toLowerCase();
      
      if (handleLower.includes(normalizedVendorParam)) {
        let tagCode = null;
        let imageUrl = null;

        if (node.fields) {
          node.fields.forEach((f) => {
            if (f.key === 'tag_code') tagCode = f.value?.toLowerCase().trim();
            if (f.key === 'image' && f.reference?.image?.url) imageUrl = f.reference.image.url;
          });
        }

        let modelName = node.displayName || '';
        const removeVendorRegex = new RegExp(`^${cleanVendor}|^${vendorNoSpaces}`, 'i');
        modelName = modelName.replace(removeVendorRegex, '').trim();

        if (modelName) {
          // מפתח מנורמל - קוד קודם, ואם אין אז שם מנורמל
          const safeKey = tagCode || modelName.toLowerCase().replace(/[^a-z0-9]/g, '');
          
          modelMap[safeKey] = {
            name: modelName,
            handle: modelName.toLowerCase().replace(/\s+/g, '-'),
            tagCode: tagCode,
            image: imageUrl, // נשמר ישירות מה-Metaobject
            products: []
          };
        }
      }
    });
  }

  // שיוך המוצרים למפת הדגמים
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
            // מחפשים במפה לפי tagCode (מועדף) או לפי השם המנורמל
            const targetKey = (tagCode && modelMap[tagCode]) ? tagCode : modelNormalizedName;

            if (!modelMap[targetKey]) {
              modelMap[targetKey] = {
                name: rawModelName,
                handle: rawModelName.toLowerCase().replace(/\s+/g, '-'),
                tagCode: tagCode,
                image: null,
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

  const modelsArray = Object.values(modelMap)
    .filter(model => model.products.length > 0 || model.image) // מציג דגם רק אם יש לו מוצרים או שהוגדר לו Metaobject רשמי
    .map(model => {
      let finalImage = model.image;

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