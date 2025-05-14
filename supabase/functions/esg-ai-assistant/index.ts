import { corsHeaders } from "@shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { handleError, handleValidationError } from "@shared/error-handler.ts";
import { validateRequiredFields } from "@shared/validation.ts";
import { cache } from "@shared/cache.ts";

interface AIAssistantRequest {
  prompt: string;
  context?: Record<string, any>;
  task: string;
  maxTokens?: number;
  userId?: string;
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

    // Initialize OpenAI client
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("Missing OpenAI API key");
    }

    // Prepare the messages for OpenAI
    const messages = [
      {
        role: "system",
        content: `You are an ESG (Environmental, Social, and Governance) expert assistant. 
        Your task is to provide helpful, accurate, and concise information related to ${task}. 
        Base your responses on industry best practices, relevant frameworks, and regulations.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    // Add context if provided
    if (context && Object.keys(context).length > 0) {
      messages.push({
        role: "system",
        content: `Additional context: ${JSON.stringify(context)}`,
      });
    }

    // Call OpenAI API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAIApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages,
            max_tokens: maxTokens,
          }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
      }

      const result = await response.json();
      const content = result.choices[0].message.content;

      // Prepare response data
      const responseData = {
        content,
        task,
        usage: {
          input_tokens: result.usage.prompt_tokens,
          output_tokens: result.usage.completion_tokens,
        },
      };

      // Cache the response for 5 minutes
      cache.set(cacheKey, responseData, 300);

      // Log usage for monitoring
      if (userId) {
        console.log(
          `AI Assistant usage - User: ${userId}, Task: ${task}, Tokens: ${result.usage.total_tokens}`,
        );
      }

      // Return the AI response
      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        throw new Error("OpenAI API request timed out");
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Error in ESG AI assistant:", error);
    return handleError(error);
  }
});
