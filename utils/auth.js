// utils/auth.js ישמש את צד הלקוח בלבד

// utils/auth.js

export function loginUser({ email, jwt }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', jwt);
  localStorage.setItem('user', JSON.stringify({ email }));
  window.dispatchEvent(new Event('auth'));
}

export function logoutUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth'));
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function isLoggedIn() {
  return !!getToken();
}
