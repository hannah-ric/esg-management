import { corsHeaders } from "@shared/cors.ts";
import { handleError, handleValidationError } from "@shared/error-handler.ts";
import { validateRequiredFields } from "@shared/validation.ts";
import { cache } from "@shared/cache.ts";

interface AIAssistantRequest {
  prompt: string;
  context?: Record<string, unknown>;
  task: string;
  maxTokens?: number;
  userId?: string;
}

interface Message {
  role: string;
  content: MessageContent[];
}

interface MessageContent {
  type: string;
  text: string;
}

interface AnthropicRequestBody {
  max_tokens: number;
  model: string;
  messages: Message[];
  metadata?: Record<string, unknown>;
  system?: string;
  stop_sequences?: string[];
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  top_k?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const requestData = (await req.json()) as AIAssistantRequest;

    // Validate required fields
    const validationError = validateRequiredFields(requestData, [
      "prompt",
      "task",
    ]);

    if (validationError) {
      return handleValidationError(validationError);
    }

    const { prompt, context, task, maxTokens = 500, userId } = requestData;

    // Check for rate limiting if userId is provided
    if (userId) {
      const rateLimitKey = `rate_limit:${userId}`;
      const requestCount = cache.get<number>(rateLimitKey) || 0;

      // Limit to 10 requests per minute per user
      if (requestCount >= 10) {
        return handleError(
          {
            message: "Rate limit exceeded. Please try again later.",
            code: "RATE_LIMIT_EXCEEDED",
          },
          429,
        );
      }

      // Increment request count
      cache.set(rateLimitKey, requestCount + 1, 60); // 60 seconds TTL
    }

    // Check cache for identical requests to reduce API calls
    const cacheKey = `ai_response:${prompt}:${task}:${JSON.stringify(context)}:${maxTokens}`;
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
      return new Response(JSON.stringify(cachedResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get PICA environment variables
    const picaSecretKey = Deno.env.get("PICA_SECRET_KEY");
    const picaConnectionKey = Deno.env.get("PICA_ANTHROPIC_CONNECTION_KEY");

    if (!picaSecretKey || !picaConnectionKey) {
      return handleError(
        {
          message: "PICA configuration is invalid or missing",
          code: "CONFIG_ERROR",
        },
        500,
      );
    }

    // Prepare system message
    const systemMessage = `You are an ESG (Environmental, Social, and Governance) expert assistant. 
    Your task is to provide helpful, accurate, and concise information related to ${task}. 
    Base your responses on industry best practices, relevant frameworks, and regulations.`;

    // Prepare context message if provided
    let contextMessage = "";
    if (context && Object.keys(context).length > 0) {
      contextMessage = `Additional context: ${JSON.stringify(context)}`;
    }

    // Prepare the request body for Anthropic
    const anthropicBody: AnthropicRequestBody = {
      max_tokens: maxTokens,
      model: "claude-3-5-sonnet-20240620",
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }],
        },
      ],
      system: systemMessage + (contextMessage ? "\n\n" + contextMessage : ""),
    };

    // Call Anthropic API through PICA
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret": picaSecretKey,
          "x-pica-connection-key": picaConnectionKey,
          "x-pica-action-id":
            "conn_mod_def::F7wlcYnWg5g::t9i_QerkQwGYOnjy18DBvg",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(anthropicBody),
      },
    );

    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = "Could not read error response";
      }

      return handleError(
        {
          message: "Failed to get response from AI service",
          code: "AI_SERVICE_ERROR",
          details: {
            status: response.status,
            response: errorText,
          },
        },
        response.status,
      );
    }

    const result = await response.json();
    const content =
      result.content?.[0]?.text || "No content returned from AI service";

    // Prepare response data
    const responseData = {
      content,
      task,
      usage: result.usage
        ? {
            input_tokens: result.usage.input_tokens,
            output_tokens: result.usage.output_tokens,
          }
        : undefined,
    };

    // Cache the response for 5 minutes
    cache.set(cacheKey, responseData, 300);

    // Log usage for monitoring
    if (userId) {
      console.log(
        `AI Assistant usage - User: ${userId}, Task: ${task}, Tokens: ${result.usage?.total_tokens || "unknown"}`,
      );
    }

    // Return the AI response
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in ESG AI assistant:", error);
    return handleError(error);
  }
});
