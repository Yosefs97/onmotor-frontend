// lib/shopifyAdmin.js
const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const adminToken = process.env.SHOPIFY_ADMIN_API_TOKEN;
const apiVersion = '2024-07';

export async function adminFetch(query, variables = {}) {
  const res = await fetch(`https://${domain}/admin/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

export async function createShopifyOrder(customer, cartItems) {
  // 1. יצירת טיוטת הזמנה
  const draftMutation = `#graphql
    mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder { id name }
        userErrors { message }
      }
    }
  `;

  const lineItems = cartItems.map(item => ({
    variantId: item.variantId,
    quantity: item.quantity
  }));

  const draftData = await adminFetch(draftMutation, {
    input: {
      lineItems,
      email: customer.email,
      shippingAddress: {
        firstName: customer.name.split(' ')[0] || '',
        lastName: customer.name.split(' ').slice(1).join(' ') || '',
        address1: customer.address || '',
        city: customer.city || 'אופקים',
        countryCode: 'IL',
        phone: customer.phone || ''
      },
      note: customer.notes || ''
    }
  });

  if (draftData.draftOrderCreate.userErrors.length > 0) {
      throw new Error(draftData.draftOrderCreate.userErrors[0].message);
  }

  const draftId = draftData.draftOrderCreate.draftOrder.id;

  // 2. הפיכת הטיוטה להזמנה רשמית בסטטוס ממתין לתשלום
  const completeMutation = `#graphql
    mutation draftOrderComplete($id: ID!) {
      draftOrderComplete(id: $id, paymentPending: true) {
        draftOrder {
          order { id name }
        }
      }
    }
  `;

  const completeData = await adminFetch(completeMutation, { id: draftId });
  return completeData.draftOrderComplete.draftOrder.order.name;
}