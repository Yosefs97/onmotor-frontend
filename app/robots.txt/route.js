// app/robots.txt/route.js

export function GET() {
  const content = `
User-agent: *
Allow: /

# Explicitly welcome AI Bots (GEO Strategy)
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: https://www.onmotormedia.com/sitemap.xml
  `.trim();

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}