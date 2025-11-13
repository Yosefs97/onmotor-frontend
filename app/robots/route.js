export function GET() {
  const content = `
User-agent: *
Disallow:

Sitemap: https://www.onmotormedia.com/sitemap.xml
  `.trim();

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
