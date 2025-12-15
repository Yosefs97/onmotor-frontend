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

  const vendors = new Set();
  const models = {}; 
  const yearsByModel = {}; 
  const categoriesByModel = {}; 

  data.products.edges.forEach(({ node }) => {
    const vendor = node.vendor;
    if (vendor) {
      vendors.add(vendor);
      if (!models[vendor]) models[vendor] = new Set();
    }

    let currentModel = null;
    
    // סריקת תגיות
    node.tags.forEach(tag => {
      // 1. זיהוי דגם (שומרים על Case Sensitivity כדי שייראה יפה)
      if (tag.toLowerCase().startsWith('model:')) {
        const modelName = tag.substring(6).trim(); // מוריד "model:"
        
        if (vendor) {
          models[vendor].add(modelName);
        }
        currentModel = modelName;
        
        if (!yearsByModel[modelName]) yearsByModel[modelName] = new Set();
        if (!categoriesByModel[modelName]) categoriesByModel[modelName] = new Set();
      }
    });

    // אם מצאנו דגם, נשייך לו נתונים נוספים
    if (currentModel) {
      // שיוך קטגוריה
      if (node.productType) {
        categoriesByModel[currentModel].add(node.productType);
      }
      // אפשר להוסיף גם קטגוריות מתגיות cat: אם רוצים
      node.tags.forEach(tag => {
          if (tag.toLowerCase().startsWith('cat:')) {
               categoriesByModel[currentModel].add(tag.substring(4).trim());
          }
      });

      // שיוך שנים מתגיות (year:2020)
      node.tags.forEach(tag => {
        if (tag.toLowerCase().startsWith('year:')) {
          const year = tag.substring(5).trim();
          yearsByModel[currentModel].add(year);
        }
      });

      // שיוך שנים מ-Metafields (טווחים)
      const mf = {};
      node.metafields.forEach(m => { if(m) mf[m.key] = m.value; });
      
      if (mf.year_from && mf.year_to) {
        const start = parseInt(mf.year_from);
        const end = parseInt(mf.year_to);
        // מונעים לולאות אינסופיות במקרה של טעות הזנה
        if (start > 1900 && end < 2100 && start <= end) {
            for (let y = start; y <= end; y++) {
            yearsByModel[currentModel].add(y.toString());
            }
        }
      }
    }
  });

  // המרה למבנה סופי וממוין ל-JSON
  const sortedVendors = Array.from(vendors).sort();
  const sortedModels = {};
  const sortedYears = {};
  const sortedCategories = {};

  sortedVendors.forEach(v => {
    sortedModels[v] = Array.from(models[v] || []).sort();
  });

  Object.keys(yearsByModel).forEach(m => {
    sortedYears[m] = Array.from(yearsByModel[m]).sort((a, b) => b - a); // חדש לישן
  });

  Object.keys(categoriesByModel).forEach(m => {
    sortedCategories[m] = Array.from(categoriesByModel[m]).sort();
  });

  return NextResponse.json({
    vendors: sortedVendors,
    models: sortedModels,
    yearsByModel: sortedYears,
    categoriesByModel: sortedCategories
  });
}