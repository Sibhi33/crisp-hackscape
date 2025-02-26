// File: /app/api/ai/chat/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { model, messages } = await request.json();
    
    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is not configured" },
        { status: 500 }
      );
    }
    
    // Make request to Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000,
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get response from Groq API" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      response: data.choices[0].message.content,
      model: model
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}