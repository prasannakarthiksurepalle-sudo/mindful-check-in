import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please provide your thoughts to analyze' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing mood for text:', text.substring(0, 100) + '...');

    const systemPrompt = `You are a compassionate mental health analysis assistant. Analyze the user's message and provide:
1. A sentiment label: "positive", "neutral", or "negative"
2. A mood tag (one word that best describes their emotional state, e.g., "anxious", "hopeful", "overwhelmed", "calm", "frustrated", "content")
3. A stress score from 0-10 (0 = completely relaxed, 10 = extremely stressed)
4. 3-5 short, actionable suggestions to help them feel better (each under 15 words)

Respond ONLY with valid JSON in this exact format:
{
  "sentiment": "positive" | "neutral" | "negative",
  "moodTag": "string",
  "stressScore": number,
  "suggestions": ["string", "string", "string"]
}

Be empathetic in your analysis. Consider context clues about workload, relationships, physical symptoms, and overall tone.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please wait a moment and try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI response:', content);

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response from the AI
    let analysis;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1].trim();
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Fallback response
      analysis = {
        sentiment: 'neutral',
        moodTag: 'reflective',
        stressScore: 5,
        suggestions: [
          'Take a few deep breaths',
          'Step outside for fresh air',
          'Talk to someone you trust',
        ]
      };
    }

    // Validate and sanitize the response
    const result = {
      sentiment: ['positive', 'neutral', 'negative'].includes(analysis.sentiment) 
        ? analysis.sentiment 
        : 'neutral',
      moodTag: typeof analysis.moodTag === 'string' 
        ? analysis.moodTag.toLowerCase() 
        : 'reflective',
      stressScore: typeof analysis.stressScore === 'number' 
        ? Math.min(10, Math.max(0, Math.round(analysis.stressScore))) 
        : 5,
      suggestions: Array.isArray(analysis.suggestions) 
        ? analysis.suggestions.slice(0, 5).map((s: unknown) => String(s))
        : ['Take a moment to breathe', 'Stay hydrated', 'Reach out to a friend'],
      timestamp: new Date().toISOString(),
    };

    console.log('Final analysis result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-mood function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
