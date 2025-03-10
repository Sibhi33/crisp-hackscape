import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { model, content: originalContent, teamId } = await request.json();
    
    // Make a mutable copy of the content
    let content = originalContent;

    // Validate required parameters
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is not configured', summary: '' },
        { status: 200 } // Return 200 with empty summary to allow graceful fallback
      );
    }

    // Check content length to avoid token limit issues
    if (content.length > 25000) { // Approx limit to stay safely under token limits
      console.warn(`Content too long (${content.length} chars) for team ${teamId}, truncating`);
      // Truncate from the middle to keep most recent and oldest parts
      const half = 12500; // Half of our safe limit
      content = content.substring(0, half) + 
        "\n[...Content truncated due to length...]\n" + 
        content.substring(content.length - half);
    }

    // Create system prompt for summarization
    const systemPrompt = `You are a helpful assistant tasked with creating a concise summary of a conversation from team ${teamId}. 
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
              content: `Here is a conversation from team ${teamId} to summarize:\n\n${content}\n\nProvide a concise summary of the key points discussed.` 
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
      // Return empty summary to allow client to continue without failing
      return NextResponse.json({
        summary: '',
        error: 'Failed to generate summary, falling back to no summary'
      }, { status: 200 });
    }

    const data = await response.json();

    return NextResponse.json({
      summary: data.choices[0].message.content,
      teamId: teamId
    });
  } catch (error) {
    console.error('Summarization API error:', error);
    // Return empty summary with 200 status to allow client to continue
    return NextResponse.json(
      { summary: '', error: 'Internal server error in summarization' },
      { status: 200 }
    );
  }
} 