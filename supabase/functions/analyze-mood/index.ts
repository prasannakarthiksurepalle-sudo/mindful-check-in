import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Constants for validation
const MAX_INPUT_LENGTH = 2000;
const SUSPICIOUS_PATTERNS = [
  /ignore\s+(previous|all|above)\s+instructions?/i,
  /you\s+are\s+now\s+/i,
  /forget\s+(everything|all|your)\s+/i,
  /disregard\s+(previous|all|above)\s+/i,
  /new\s+instructions?:/i,
  /system\s*:\s*/i,
];

// Validate input for suspicious patterns
function containsSuspiciousPatterns(text: string): boolean {
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(text));
}

// Sanitize input by removing potentially harmful content
function sanitizeInput(text: string): string {
  // Trim and limit length
  let sanitized = text.trim().slice(0, MAX_INPUT_LENGTH);
  // Remove excessive special characters (more than 10 in a row)
  sanitized = sanitized.replace(/[^\w\s]{10,}/g, '...');
  return sanitized;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    // Validate input exists and is a string
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please provide your thoughts to analyze' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Server-side length validation
    if (text.length > MAX_INPUT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Input must be ${MAX_INPUT_LENGTH} characters or less` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for suspicious patterns that might be prompt injection attempts
    if (containsSuspiciousPatterns(text)) {
      console.warn('Suspicious input pattern detected');
      return new Response(
        JSON.stringify({ error: 'Invalid input detected. Please share your genuine feelings.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize the input
    const sanitizedText = sanitizeInput(text);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing mood for sanitized text length:', sanitizedText.length);

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
          { role: 'user', content: sanitizedText }
        ],
      }),
    });

    if (!response.ok) {
      // Log detailed error server-side only
      const errorText = await response.text();
      console.error('Backend service error:', response.status, errorText);
      
      // Return generic, safe error messages to client
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please wait a moment and try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Generic error for all other cases - don't expose status codes or implementation details
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
    // Log detailed error server-side only
    console.error('Error in analyze-mood function:', error);
    
    // Return generic, safe error message to client - never expose internal details
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
