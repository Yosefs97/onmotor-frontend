// /app/api/shopify/testimonials/route.js
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
    cache: 'no-store', // אפשר לשנות ל-'force-cache' אם הלקוחות לא משתנים לעיתים קרובות
  });
  return await res.json();
}

export async function GET() {
  const query = `#graphql
    query GetTestimonials {
      metaobjects(type: "customer_testimonial", first: 20) {
        nodes {
          id
          fields {
            key
            value
            reference {
              ... on MediaImage {
                image {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  `;

  const { data, errors } = await sfFetch(query);

  if (errors || !data?.metaobjects) {
    console.error("Error fetching testimonials:", errors);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }

  // סידור הנתונים למערך נקי
  const testimonials = data.metaobjects.nodes.map((node) => {
    let imageUrl = null;
    let altText = 'המלצת לקוח';
    let text = '';

    node.fields.forEach((field) => {
      // חילוץ התמונה
      if (field.key === 'image') {
        imageUrl = field.reference?.image?.url || null;
        altText = field.reference?.image?.altText || 'המלצת לקוח';
      }
      // חילוץ הטקסט (שים לב לשנות את 'text' למפתח שהגדרת בשופיפיי עבור ה-Single line text)
      if (field.key === 'text') { 
        text = field.value || '';
      }
    });

    return {
      id: node.id,
      imageUrl,
      altText,
      text
    };
  }).filter(testimonial => testimonial.imageUrl); // מחזיר רק רשומות שיש בהן תמונה

  return NextResponse.json({ testimonials });
}