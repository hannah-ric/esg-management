import { corsHeaders } from "@shared/cors.ts";

interface AIAssistantRequest {
  prompt: string;
  context?: Record<string, any>;
  task:
    | "framework-mapping"
    | "resource-recommendation"
    | "materiality-analysis"
    | "peer-benchmarking";
  maxTokens?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const {
      prompt,
      context,
      task,
      maxTokens = 500,
    } = (await req.json()) as AIAssistantRequest;

    if (!prompt || !task) {
      return new Response(
        JSON.stringify({ error: "Prompt and task are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Call Anthropic API through Pica passthrough
    const response = await callAnthropicAPI(prompt, context, task, maxTokens);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function callAnthropicAPI(
  prompt: string,
  context?: Record<string, any>,
  task?: string,
  maxTokens: number = 500,
) {
  const url = "https://api.picaos.com/v1/passthrough/messages";

  // Construct a task-specific system prompt
  let systemPrompt =
    "You are an ESG (Environmental, Social, and Governance) expert assistant helping to generate accurate and relevant recommendations.";

  switch (task) {
    case "framework-mapping":
      systemPrompt +=
        " Analyze the company profile and questionnaire responses to recommend the most relevant ESG frameworks and specific indicators that apply to their industry, size, and materiality topics. Focus on practical, implementable recommendations with clear justifications.";
      break;
    case "resource-recommendation":
      systemPrompt +=
        " Analyze the ESG plan components and recommend relevant resources from the library that would help the company implement their plan effectively. Prioritize resources based on relevance to the company's industry, size, and specific ESG goals.";
      break;
    case "materiality-analysis":
      systemPrompt +=
        " Analyze the company's industry, size, and region to identify the most material ESG topics they should focus on. Provide a data-driven assessment of stakeholder impact and business impact for each topic.";
      break;
    case "peer-benchmarking":
      systemPrompt +=
        " Compare the company's ESG performance metrics with industry peers to identify areas of strength and opportunities for improvement. Provide specific, actionable insights based on industry best practices.";
      break;
  }

  // Enhance the prompt with context if provided
  let enhancedPrompt = prompt;
  if (context) {
    enhancedPrompt = `Context information:\n${JSON.stringify(context)}\n\nBased on this context, ${prompt}`;
  }

  const headers = {
    "Content-Type": "application/json",
    "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
    "x-pica-connection-key":
      Deno.env.get("PICA_ANTHROPIC_CONNECTION_KEY") || "",
    "x-pica-action-id": "conn_mod_def::F7wlcYnWg5g::t9i_QerkQwGYOnjy18DBvg",
    "anthropic-version": "2023-06-01",
  };

  const data = {
    max_tokens: maxTokens,
    model: "claude-3-5-sonnet-20240620",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: enhancedPrompt,
          },
        ],
      },
    ],
    system: systemPrompt,
    temperature: 0.7,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${errorText}`);
    }

    const responseData = await response.json();
    return {
      content: responseData.content[0].text,
      task,
      usage: responseData.usage,
    };
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    throw error;
  }
}
