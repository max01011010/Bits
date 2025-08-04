import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endGoal } = await req.json();

    if (!endGoal) {
      return new Response(JSON.stringify({ error: 'End goal is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Updated to the chat completions endpoint
    const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
    const HF_API_TOKEN = Deno.env.get("HF_API_TOKEN");

    if (!HF_API_TOKEN) {
      return new Response(JSON.stringify({ error: 'Hugging Face API token (HF_API_TOKEN) not set in Supabase secrets.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Prompt formatted for the chat completions API
    const promptContent = `Generate 3-4 incremental milestones for the goal: "${endGoal}". Each milestone should have a "goal" (string, e.g., "Walk 1000 steps") and "targetDays" (number, e.g., 3). Return only a JSON array of objects. Do not include any other text or formatting. Example: [{"goal": "Start with 1000 steps", "targetDays": 3}, {"goal": "Increase to 3000 steps", "targetDays": 5}]`;

    const response = await fetch(HF_API_URL, {
      headers: {
        'Authorization': `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: promptContent,
          }
        ],
        model: "CohereLabs/aya-expanse-8b:cohere", // Model specified in the body
        stream: false // As per your curl script
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hugging Face API error: Status ${response.status} (${response.statusText}), Body: ${errorText}`);
      return new Response(JSON.stringify({ error: `AI API error: Status ${response.status}, Message: ${errorText}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      });
    }

    const data = await response.json();
    // Extract generated text from the chat completions response structure
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      console.error("No generated text found in AI response:", data);
      return new Response(JSON.stringify({ error: 'AI did not return expected text content.', rawResponse: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    let milestones;
    try {
      // Extract only the JSON part from the generated text
      const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in AI response.");
      }
      milestones = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(milestones) || !milestones.every(m => typeof m.goal === 'string' && typeof m.targetDays === 'number')) {
        throw new Error("Invalid AI response format: Expected array of objects with 'goal' (string) and 'targetDays' (number).");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", generatedText, parseError);
      return new Response(JSON.stringify({ error: 'AI response could not be parsed. Please try a different goal or refine the prompt.', rawResponse: generatedText }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const formattedMilestones = milestones.map((m: any) => ({
      goal: m.goal,
      targetDays: m.targetDays,
      completedDays: 0,
      isCompleted: false,
    }));

    return new Response(JSON.stringify(formattedMilestones), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});