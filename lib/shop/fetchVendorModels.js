// /lib/shop/fetchVendorModels.js
import { sfFetch } from '@/lib/shopify';
import { fetchModelImages } from './fetchModelImages';

export async function fetchVendorModels({ vendor, filters = {} }) {
  // נרמול השם לחיפוש חופשי בשופיפיי
  const cleanVendor = vendor.replace(/-/g, ' ');
  const vendorNoSpaces = vendor.replace(/[^a-zA-Z0-9]/g, '');

  // מילת מפתח רחבה ב-OR כדי לתפוס את המילה בכל מקום, גם בתוך תגית!
  const searchQuery = `${cleanVendor} OR ${vendorNoSpaces}`;

  const query = `#graphql
    query GetVendorModels($query: String!) {
      products(first: 250, query: $query) {
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

  const [resProducts, modelImagesMap] = await Promise.all([
    sfFetch(query, { query: searchQuery }),
    fetchModelImages()
  ]);

  const responseData = resProducts?.data?.data || resProducts?.data;
  let items = [];
  
  if (!resProducts.error && responseData?.products?.edges) {
    items = responseData.products.edges.map(e => e.node);
  }

  const modelMap = {};
  const normalizedVendorParam = vendor.toLowerCase().replace(/[^a-z0-9]/g, '');

  items.forEach((p) => {
    if (!p.tags) return;
    
    // הלוגיקה החכמה שלך: קריאה ישירה של התגיות תוך התעלמות ממי היצרן הרשמי
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