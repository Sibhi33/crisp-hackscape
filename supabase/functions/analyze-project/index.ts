
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hackathonName, problemStatement, track } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert hackathon mentor who helps teams plan their projects. Provide structured advice including approach, technologies, and next steps.'
          },
          {
            role: 'user',
            content: `Please analyze this hackathon project and provide suggestions:
            Hackathon: ${hackathonName}
            Track: ${track}
            Problem Statement: ${problemStatement}
            
            Please provide:
            1. A high-level approach to solving this problem
            2. A list of recommended technologies and tools
            3. Concrete next steps for getting started`
          }
        ],
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse the AI response into structured format
    const sections = aiResponse.split('\n\n');
    const analysis = {
      approach: sections[0].replace(/^.*?:/, '').trim(),
      technologies: sections[1]
        .split('\n')
        .filter(line => line.startsWith('-'))
        .map(line => line.replace('-', '').trim()),
      nextSteps: sections[2]
        .split('\n')
        .filter(line => line.startsWith('-'))
        .map(line => line.replace('-', '').trim()),
    };

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
