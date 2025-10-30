// app/api/fetch-external-images/route.js
import { fetchKtmImages } from '@/lib/fetchKtmImages';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url)
    return new Response(JSON.stringify({ error: 'Missing URL' }), { status: 400 });

  try {
    let images = [];

    // ✅ טיפול מיוחד לעמודי KTM
    if (url.includes('press.ktm.com')) {
      images = await fetchKtmImages(url);
    } else {
      // כאן בעתיד אפשר להוסיף תמיכה ליצרנים אחרים (Yamaha, Ducati וכו’)
      images = [];
    }

    return new Response(JSON.stringify({ images }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to fetch images' }), {
      status: 500,
    });
  }
}
