import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { model, content } = await request.json();

    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is not configured' },
        { status: 500 }
      );
    }

    // Create system prompt for summarization
    const systemPrompt = `You are a helpful assistant tasked with creating a concise summary of a conversation. 
    Focus only on the key points and important information that would provide context for continuing the conversation.
    Keep the summary under 200 words. Do not include any opinions or commentary about the conversation itself.`;

    // Make request to Groq API
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'mixtral-8x7b-32768',
          messages: [
            { 
              role: 'system', 
              content: systemPrompt 
            },
            { 
              role: 'user', 
              content: `Here is a conversation to summarize:\n\n${content}\n\nProvide a concise summary of the key points discussed.` 
            }
          ],
          temperature: 0.3, // Lower temperature for more factual summaries
          max_tokens: 300,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get response from Groq API' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      summary: data.choices[0].message.content,
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 