// 📁 /app/api/law-book/ask.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { question } = await req.json();

  const systemPrompt = `ענה בקצרה ובצורה רשמית על שאלות חוקיות בישראל, תוך הסתמכות על מקורות פתוחים אם אפשר.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      temperature: 0.4,
    }),
  });

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content || "לא נמצאה תשובה.";

  return NextResponse.json({ answer });
}
