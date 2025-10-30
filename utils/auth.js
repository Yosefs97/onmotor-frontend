// utils/auth.js
// מנגנון התחברות/התנתקות/בדיקת התחברות בצד הלקוח בלבד

// ✅ התחברות משתמש ושמירת הנתונים
export function loginUser({ email, jwt }) {
  if (typeof window === 'undefined') return;

  try {
    // שמירה של הטוקן ושל פרטי המשתמש
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify({ email }));

    // שליחת event גלובלי כדי שקומפוננטות יתעדכנו אוטומטית
    window.dispatchEvent(new Event('auth'));

    console.log('✅ User logged in successfully');
  } catch (err) {
    console.error('Login error:', err);
  }
}

// ✅ התנתקות מלאה – מנקה את כל האחסונים
export function logoutUser() {
  if (typeof window === 'undefined') return;

  try {
    // ניקוי localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // ניקוי sessionStorage (ליתר ביטחון)
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    // ניקוי עוגייה אם נוצרה בעבר
    document.cookie = 'token=; Max-Age=0; path=/;';

    // שליחת event לכל המערכת
    window.dispatchEvent(new Event('auth'));

    console.log('✅ User logged out completely');
  } catch (err) {
    console.error('Logout error:', err);
  }
}

// ✅ אחזור הטוקן הנוכחי
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// ✅ אחזור המשתמש המחובר כרגע
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// ✅ בדיקה אם משתמש מחובר (יש טוקן בתוקף)
export function isLoggedIn() {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('token');
  return !!token;
}
