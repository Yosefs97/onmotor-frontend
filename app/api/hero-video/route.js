import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';

export async function POST(request) {
  const video = Buffer.from(await request.arrayBuffer());

  if (!video.length || video.length > 25 * 1024 * 1024) {
    return Response.json({ error: 'Invalid video payload.' }, { status: 400 });
  }

  const videosDirectory = path.join(process.cwd(), 'public', 'videos');
  await mkdir(videosDirectory, { recursive: true });
  await writeFile(path.join(videosDirectory, 'onmotor-riders-hero-ai.webm'), video);

  return Response.json({ ok: true, bytes: video.length });
}
