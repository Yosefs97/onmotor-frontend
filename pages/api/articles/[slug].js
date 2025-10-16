// pages/api/articles/[slug].js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { slug } = req.query;
  const { method } = req;

  if (method === 'GET') {
    const article = await prisma.article.findUnique({ where: { slug } });
    return res.status(200).json(article);
  }

  if (method === 'PUT') {
    // בדיקת הרשאות admin
    const data = req.body;
    const updated = await prisma.article.update({
      where: { slug },
      data: {
        ...data,
        publishedAt: new Date(data.publishedAt),
      },
    });
    return res.status(200).json(updated);
  }

  if (method === 'DELETE') {
    // בדיקת הרשאות admin
    await prisma.article.delete({ where: { slug } });
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET','PUT','DELETE']);
  res.status(405).end(`Method ${method} Not Allowed`);
}
