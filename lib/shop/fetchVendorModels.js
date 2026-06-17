// /lib/shop/fetchVendorModels.js
import { fetchModelImages } from './fetchModelImages';

export async function fetchVendorModels({ vendor, filters = {} }) {
  const cleanFilters = { ...filters };

  ['year', 'yearFrom', 'yearTo'].forEach((k) => {
    if (cleanFilters[k] === '0' || cleanFilters[k] === 0) {
      delete cleanFilters[k];
    }
  });

  const params = new URLSearchParams({
    fitBrand: vendor, 
    limit: '250', 
    ...cleanFilters,
  });

  const [resProducts, modelImagesMap] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/shopify/search?${params.toString()}`,
      { next: { revalidate: 600 } }
    ),
    fetchModelImages()
  ]);

  const json = await resProducts.json();
  const items = json.items || [];

  const modelMap = {};

  items.forEach((p) => {
    p.tags.forEach((t) => {
      if (t.toLowerCase().startsWith(`fit:${vendor.toLowerCase()}:`)) {
        const parts = t.split(':');
        
        if (parts.length >= 3) {
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
          
          modelMap[modelName].products.push({
            createdAt: p.createdAt || p.publishedAt, 
            images: p.images?.edges?.map(edge => edge.node.url) || [] 
          });
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
        finalImage = oldestProduct.images[oldestProduct.images.length - 1];
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