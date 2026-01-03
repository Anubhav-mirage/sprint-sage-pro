import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Story {
  id: string;
  title: string;
  description: string;
  storyPoints: number;
  priority: string;
  riskLevel: string;
  isVague?: boolean;
}

interface RequestBody {
  message: string;
  stories: Story[];
  metrics: {
    velocity: number;
    capacity: number;
    committedPoints: number;
    riskScore: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, stories, metrics }: RequestBody = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are SprintPilot, an AI sprint planning assistant for Product Managers. You help analyze backlogs, estimate effort, identify risks, and refine user stories.

Current Sprint Context:
- Team Velocity: ${metrics.velocity} points/sprint
- Team Capacity: ${metrics.capacity} points
- Committed Points: ${metrics.committedPoints} points
- Current Risk Score: ${metrics.riskScore}%

Current Backlog Stories:
${stories.map(s => `- "${s.title}" (${s.storyPoints} pts, ${s.priority} priority, ${s.riskLevel} risk${s.isVague ? ', NEEDS REFINEMENT' : ''}): ${s.description}`).join('\n')}

Guidelines:
1. Be concise but insightful
2. Use markdown formatting for readability
3. When you identify a vague story that needs breakdown, you MUST include a JSON action block at the END of your response in this exact format:
\`\`\`action
{
  "type": "breakdown",
  "storyId": "story-id-here",
  "newStories": [
    {"title": "Story Title", "description": "Description", "storyPoints": 3, "priority": "medium"},
    {"title": "Story Title 2", "description": "Description 2", "storyPoints": 2, "priority": "low"}
  ]
}
\`\`\`
4. Only suggest breakdowns for stories marked as needing refinement or that are clearly too vague
5. Be specific about risks and provide actionable recommendations
6. Reference the actual story data when discussing capacity and workload`;

    console.log("Sending request to Lovable AI Gateway...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway...");
    
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("sprint-copilot error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
