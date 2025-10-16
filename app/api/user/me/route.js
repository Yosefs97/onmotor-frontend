// app/api/user/me/route.js
import { getTokenFromCookie } from '@/utils/auth-server';

export async function GET(request) {
  const jwt = getTokenFromCookie(request);

  if (!jwt) {
    return new Response(JSON.stringify({ user: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // נשלח בקשה ל־Strapi עם ה־JWT כדי לשלוף את המשתמש
  const res = await fetch(`${process.env.STRAPI_API_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ user: null }), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = await res.json();
  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  
}


