import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { corsHeaders } from "@shared/cors.ts";

interface TailorRequest {
  url?: string;
  surveyAnswers: Record<string, any>;
  materialityTopics?: any[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { url, surveyAnswers, materialityTopics } =
      (await req.json()) as TailorRequest;

    // Validate inputs
    if (!surveyAnswers) {
      return new Response(
        JSON.stringify({ error: "Survey answers are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    let diffbotData = null;

    // Step 1: If URL is provided, extract data using Diffbot
    if (url) {
      diffbotData = await getDiffbotData(url);
    }

    // Step 2: Generate tailored ESG recommendations using Anthropic
    const esgRecommendations = await generateESGContent(
      surveyAnswers,
      diffbotData,
      materialityTopics,
    );

    return new Response(
      JSON.stringify({
        recommendations: esgRecommendations,
        diffbotData: diffbotData
          ? { title: diffbotData.objects?.[0]?.title }
          : null,
        success: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error tailoring ESG recommendations:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function getDiffbotData(url: string) {
  const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
  const PICA_DIFFBOT_CONNECTION_KEY = Deno.env.get(
    "PICA_DIFFBOT_CONNECTION_KEY",
  );

  if (!PICA_SECRET_KEY || !PICA_DIFFBOT_CONNECTION_KEY) {
    throw new Error(
      "Missing required environment variables for Diffbot integration",
    );
  }

  // Construct query parameters
  const params = new URLSearchParams({
    url: encodeURIComponent(url),
  });

  const response = await fetch(
    `https://api.picaos.com/v1/passthrough/v3/analyze?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-pica-secret": PICA_SECRET_KEY,
        "x-pica-connection-key": PICA_DIFFBOT_CONNECTION_KEY,
        "x-pica-action-id": "conn_mod_def::GCNhlCQbEbA::Ejy9S1uAQ6GCMnNPbQFeTA",
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Diffbot API error: ${errorData.error || response.statusText}`,
    );
  }

  return await response.json();
}

async function generateESGContent(
  surveyAnswers: Record<string, any>,
  diffbotData: any = null,
  materialityTopics: any[] = [],
) {
  const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
  const PICA_ANTHROPIC_CONNECTION_KEY = Deno.env.get(
    "PICA_ANTHROPIC_CONNECTION_KEY",
  );

  if (!PICA_SECRET_KEY || !PICA_ANTHROPIC_CONNECTION_KEY) {
    throw new Error(
      "Missing required environment variables for Anthropic integration",
    );
  }

  // Prepare the prompt based on available data
  let promptText = "Analyze the following survey answers ";

  if (diffbotData) {
    promptText += "and Diffbot extracted data ";
  }

  if (materialityTopics && materialityTopics.length > 0) {
    promptText += "and materiality topics ";
  }

  promptText +=
    "to generate tailored ESG materiality disclosures and recommendations for the company.\n\n";
  promptText += `Survey answers: ${JSON.stringify(surveyAnswers, null, 2)}\n\n`;

  if (diffbotData) {
    promptText += `Diffbot data: ${JSON.stringify(diffbotData, null, 2)}\n\n`;
  }

  if (materialityTopics && materialityTopics.length > 0) {
    promptText += `Materiality topics: ${JSON.stringify(materialityTopics, null, 2)}\n\n`;
  }

  promptText += "Please provide the following in your response:\n";
  promptText +=
    "1. A list of 5-8 tailored materiality topics specific to this company's industry and profile\n";
  promptText +=
    "2. For each topic, provide a stakeholder impact score (0-1) and business impact score (0-1)\n";
  promptText +=
    "3. Recommended ESG frameworks and specific indicators that are most relevant\n";
  promptText += "4. Suggested implementation steps and timeline\n";
  promptText += "5. Resource recommendations for each key topic\n";
  promptText +=
    "\nFormat your response in a structured way that can be easily parsed and displayed in a user interface.";

  const response = await fetch(
    "https://api.picaos.com/v1/passthrough/messages",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pica-secret": PICA_SECRET_KEY,
        "x-pica-connection-key": PICA_ANTHROPIC_CONNECTION_KEY,
        "x-pica-action-id": "conn_mod_def::F7wlcYnWg5g::t9i_QerkQwGYOnjy18DBvg",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        max_tokens: 1000,
        model: "claude-3-5-sonnet-20240620",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: promptText,
              },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Anthropic API error: ${errorData.error || response.statusText}`,
    );
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    usage: data.usage,
  };
}
