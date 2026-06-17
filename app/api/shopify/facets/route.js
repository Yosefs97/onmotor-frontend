// /app/api/shopify/facets/route.js
import { NextResponse } from 'next/server';

export const runtime = "edge"; 

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-04';

async function sfFetch(query, variables = {}) {
  const res = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store', 
  });
  return await res.json();
}

export async function GET() {
  const query = `#graphql
    query GetFacetsData {
      products(first: 250, sortKey: CREATED_AT) {
        edges {
          node {
            vendor
            productType
            tags
            metafields(identifiers: [
              { namespace: "compatibility", key: "year_from" },
              { namespace: "compatibility", key: "year_to" }
            ]) {
              key
              value
            }
          }
        }
      }
    }
  `;

  const { data, errors } = await sfFetch(query);

  if (errors || !data?.products) {
    return NextResponse.json({}, { status: 500 });
  }

  const partVendors = new Set();
  const bikeBrands = new Set(); 
  const models = {}; 
  const yearsByModel = {}; 
  const categoriesByModel = {}; 

  data.products.edges.forEach(({ node }) => {
    if (node.vendor) {
      partVendors.add(node.vendor);
    }

    const currentModelsForProduct = []; 
    
    node.tags.forEach(tag => {
      if (tag.toLowerCase().startsWith('fit:')) {
        const parts = tag.split(':');
        
        if (parts.length >= 3) {
          const brand = parts[1].trim(); 
          const modelName = parts[2].trim(); 
          
          bikeBrands.add(brand);
          
          if (!models[brand]) models[brand] = new Set();
          models[brand].add(modelName);
          
          currentModelsForProduct.push(modelName);
          
          if (!yearsByModel[modelName]) yearsByModel[modelName] = new Set();
          if (!categoriesByModel[modelName]) categoriesByModel[modelName] = new Set();
        }
      }
    });

    if (currentModelsForProduct.length > 0) {
      currentModelsForProduct.forEach(model => {
        if (node.productType) {
          categoriesByModel[model].add(node.productType);
        }
        
        node.tags.forEach(tag => {
          if (tag.toLowerCase().startsWith('cat:')) {
            categoriesByModel[model].add(tag.substring(4).trim());
          }
          if (tag.toLowerCase().startsWith('year:')) {
            yearsByModel[model].add(tag.substring(5).trim());
          }
        });

        const mf = {};
        node.metafields.forEach(m => { if(m) mf[m.key] = m.value; });
        
        if (mf.year_from && mf.year_to) {
          const start = parseInt(mf.year_from);
          const end = parseInt(mf.year_to);
          if (start > 1900 && end < 2100 && start <= end) {
            for (let y = start; y <= end; y++) {
              yearsByModel[model].add(y.toString());
            }
          }
        }
      });
    }
  });

  const sortedPartVendors = Array.from(partVendors).sort();
  const sortedBikeBrands = Array.from(bikeBrands).sort();
  const sortedModels = {};
  const sortedYears = {};
  const sortedCategories = {};

  sortedBikeBrands.forEach(v => {
    sortedModels[v] = Array.from(models[v] || []).sort();
  });

  Object.keys(yearsByModel).forEach(m => {
    sortedYears[m] = Array.from(yearsByModel[m]).sort((a, b) => b - a); 
  });

  Object.keys(categoriesByModel).forEach(m => {
    sortedCategories[m] = Array.from(categoriesByModel[m]).sort();
  });

  return NextResponse.json({
    partVendors: sortedPartVendors, 
    vendors: sortedBikeBrands,      
    models: sortedModels,           
    yearsByModel: sortedYears,
    categoriesByModel: sortedCategories
  });
}