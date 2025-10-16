// utils/auth-server.js לשימוש ב־API Routes בצד השרת, כולל שליפת token מ־cookie.
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const { JWT_SECRET } = process.env;

export function getUserFromCookie(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parse(cookieHeader);
  const token = cookies.token;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// הוספה דרושה
export function getTokenFromCookie(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parse(cookieHeader);
  return cookies.token || null;
}
