//lib/shopify/customer.js

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const endpoint = `https://${domain}/api/2024-01/graphql.json`;

// פונקציית בסיס לשליחת בקשות GraphQL לשופיפיי
async function shopifyFetch({ query, variables }) {
  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store', // לא לשמור במטמון מידע אישי
    });

    const body = await result.json();

    if (body.errors) {
      console.error('Shopify API Errors:', body.errors);
      throw body.errors[0];
    }

    return { status: result.status, body };
  } catch (error) {
    console.error('Error in shopifyFetch:', error);
    throw error;
  }
}

// 1. התחברות: יצירת Access Token ללקוח
export async function customerAccessTokenCreate(email, password) {
  const query = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: { email, password },
  };

  const response = await shopifyFetch({ query, variables });
  return response.body?.data?.customerAccessTokenCreate;
}

// 2. הרשמה: יצירת לקוח חדש
export async function customerCreate(firstName, lastName, email, password) {
  const query = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: { firstName, lastName, email, password },
  };

  const response = await shopifyFetch({ query, variables });
  return response.body?.data?.customerCreate;
}

// 3. משיכת נתוני לקוח והיסטוריית הזמנות לפי ה-Token שלו
export async function getCustomer(customerAccessToken) {
  const query = `
    query getCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        firstName
        lastName
        email
        phone
        defaultAddress {
          address1
          city
          country
          zip
        }
        orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              orderNumber
              processedAt
              financialStatus
              fulfillmentStatus
              totalPrice {
                amount
                currencyCode
              }
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = { customerAccessToken };

  const response = await shopifyFetch({ query, variables });
  return response.body?.data?.customer;
}