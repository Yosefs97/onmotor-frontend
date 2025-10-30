// app/api/fetch-external-images/route.js
import { fetchExternalImages } from '@/lib/fetchExternalImages';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url)
    return new Response(JSON.stringify({ error: 'Missing URL' }), { status: 400 });

  try {
    const images = await fetchExternalImages(url);
    return new Response(JSON.stringify({ images }), { status: 200 });
  } catch (err) {
    console.error('❌ fetch-external-images error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch images' }), {
      status: 500,
    });
  }
}
