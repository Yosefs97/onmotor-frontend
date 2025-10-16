// pages/api/articles/index.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;

  // GET: כל הכתבות ממוינות לפי תאריך
  if (method === 'GET') {
    const articles = await prisma.article.findMany({
      orderBy: { publishedAt: 'desc' },
    });
    return res.status(200).json(articles);
  }

  // POST: יצירת כתבה חדשה (דורש שהמשתמש הוא admin)
  if (method === 'POST') {
    // בדיקת הרשאות תוסיף כאן
    const { title, slug, content, imageUrl, publishedAt } = req.body;
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        imageUrl,
        publishedAt: new Date(publishedAt),
      },
    });
    return res.status(201).json(article);
  }

  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${method} Not Allowed`);
}
