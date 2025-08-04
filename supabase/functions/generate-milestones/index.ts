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

    // Replace with your desired Hugging Face model endpoint
    // You can find models at https://huggingface.co/models
    // For text generation, models like 'google/flan-t5-small' or 'gpt2' are good starting points.
    const HF_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-small";
    const HF_API_TOKEN = Deno.env.get("HF_API_TOKEN"); // This secret must be set in Supabase

    if (!HF_API_TOKEN) {
      return new Response(JSON.stringify({ error: 'Hugging Face API token (HF_API_TOKEN) not set in Supabase secrets.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Craft a prompt to encourage JSON output for easier parsing
    const prompt = `Generate 3-4 incremental milestones for the goal: "${endGoal}". Each milestone should have a "goal" (string, e.g., "Walk 1000 steps") and "targetDays" (number, e.g., 3). Return as a JSON array of objects. Example: [{"goal": "Start with 1000 steps", "targetDays": 3}, {"goal": "Increase to 3000 steps", "targetDays": 5}]`;

    const response = await fetch(HF_API_URL, {
      headers: {
        'Authorization': `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Hugging Face API error:", errorData);
      return new Response(JSON.stringify({ error: `AI API error: ${JSON.stringify(errorData)}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      });
    }

    const data = await response.json();
    const generatedText = data[0]?.generated_text;

    let milestones;
    try {
      milestones = JSON.parse(generatedText);
      // Basic validation to ensure it's an array of objects with goal and targetDays
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

    // Add isCompleted and completedDays to each milestone as required by your Habit interface
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