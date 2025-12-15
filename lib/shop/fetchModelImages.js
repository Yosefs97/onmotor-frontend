// /lib/shop/fetchModelImages.js
import { sfFetch } from '@/lib/shopify';

export async function fetchModelImages() {
  const query = `#graphql
    query GetModelImages {
      metaobjects(type: "moto_model", first: 250) {
        edges {
          node {
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

  const { data, error } = await sfFetch(query);

  if (error || !data) {
    console.error('Error fetching model images:', error);
    return {};
  }

  const imageMap = {};

  data.data.metaobjects.edges.forEach(({ node }) => {
    let tagCode = null;
    let imageUrl = null;

    node.fields.forEach((f) => {
      // אנחנו מחפשים את השדה tag_code שהגדרת
      if (f.key === 'tag_code') {
        tagCode = f.value;
      }
      
      // ואת השדה image
      if (f.key === 'image' && f.reference?.image?.url) {
        imageUrl = f.reference.image.url;
      }
    });

    // אם מצאנו גם קוד וגם תמונה - שומרים במילון
    // לדוגמה: { 'ktmexc250': 'https://...' }
    if (tagCode && imageUrl) {
      imageMap[tagCode] = imageUrl;
    }
  });

  return imageMap;
}