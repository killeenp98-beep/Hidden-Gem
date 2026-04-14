import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { place } = await req.json();

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `You are Worth It, a premium city recommendation AI. Give a 2-sentence "Worth It" explanation for this venue. Be specific, punchy, and honest. No fluff.

Venue: ${place.name}
Category: ${place.category}
Price: $${place.price}
Badge: ${place.badge}
Score: ${place.score}/100
Tag: ${place.tag}
Walk: ${place.minutes} min away

Format: First sentence = why it's worth it right now. Second sentence = one concrete pro.`,
        },
      ],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || place.tag;

  return NextResponse.json({ text });
}