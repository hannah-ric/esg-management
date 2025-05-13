import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { corsHeaders } from "../_shared/cors.ts";
import {
  AnalyzeUrlRequest,
  DiffbotAnalyzeResponse,
  ESGResource,
} from "@shared/types.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { url, mode = "article" } = (await req.json()) as AnalyzeUrlRequest;

    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Call Diffbot API through Pica passthrough
    const diffbotResponse = await callDiffbotAnalyze(url, mode);

    // Process the response into a format suitable for our application
    const processedData = processDiffbotResponse(diffbotResponse, url);

    // Store the processed data in Supabase if needed
    // This is optional and depends on your application's requirements
    if (processedData) {
      await storeESGResource(processedData);
    }

    return new Response(JSON.stringify(processedData), {
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

async function callDiffbotAnalyze(
  url: string,
  mode: string,
): Promise<DiffbotAnalyzeResponse> {
  const endpoint = "https://api.picaos.com/v1/passthrough/v3/analyze";

  // Construct query parameters
  const params = new URLSearchParams({
    url: encodeURIComponent(url),
    mode,
    timeout: "10000",
  });

  const requestUrl = `${endpoint}?${params.toString()}`;

  const response = await fetch(requestUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
      "x-pica-connection-key":
        Deno.env.get("PICA_DIFFBOT_CONNECTION_KEY") || "",
      "x-pica-action-id": "conn_mod_def::GCNhlCQbEbA::Ejy9S1uAQ6GCMnNPbQFeTA",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Diffbot API error: ${errorData.error || response.statusText}`,
    );
  }

  return await response.json();
}

function processDiffbotResponse(
  data: DiffbotAnalyzeResponse,
  originalUrl: string,
): ESGResource | null {
  if (!data.objects || data.objects.length === 0) {
    return null;
  }

  const mainObject = data.objects[0];

  // Determine ESG category based on content analysis
  const categoryMapping: Record<string, string> = {
    climate: "environmental",
    carbon: "environmental",
    emission: "environmental",
    water: "environmental",
    waste: "environmental",
    energy: "environmental",
    diversity: "social",
    inclusion: "social",
    employee: "social",
    "human rights": "social",
    community: "social",
    governance: "governance",
    board: "governance",
    ethics: "governance",
    compliance: "governance",
    risk: "governance",
  };

  // Extract text content for analysis
  const textContent = mainObject.text || "";

  // Determine category based on keyword frequency
  let category = "general";
  let maxCount = 0;

  const categoryCounts: Record<string, number> = {
    environmental: 0,
    social: 0,
    governance: 0,
  };

  Object.entries(categoryMapping).forEach(([keyword, mappedCategory]) => {
    const regex = new RegExp(keyword, "gi");
    const matches = textContent.match(regex);
    const count = matches ? matches.length : 0;
    categoryCounts[mappedCategory] += count;
  });

  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > maxCount) {
      maxCount = count;
      category = cat;
    }
  });

  // Determine resource type
  let type = "article";
  if (
    textContent.toLowerCase().includes("report") ||
    textContent.toLowerCase().includes("annual")
  ) {
    type = "framework";
  } else if (
    textContent.toLowerCase().includes("guide") ||
    textContent.toLowerCase().includes("how to")
  ) {
    type = "guide";
  } else if (
    textContent.toLowerCase().includes("template") ||
    textContent.toLowerCase().includes("example")
  ) {
    type = "template";
  } else if (textContent.toLowerCase().includes("case study")) {
    type = "case-study";
  }

  // Extract tags
  const tags = mainObject.tags || [];

  // Determine file type based on URL
  let fileType = "url";
  if (originalUrl.endsWith(".pdf")) {
    fileType = "pdf";
  } else if (originalUrl.endsWith(".xlsx") || originalUrl.endsWith(".xls")) {
    fileType = "xlsx";
  } else if (originalUrl.endsWith(".docx") || originalUrl.endsWith(".doc")) {
    fileType = "docx";
  }

  // Create a summary description (first 200 characters of text)
  const description =
    textContent.substring(0, 200) + (textContent.length > 200 ? "..." : "");

  return {
    title: mainObject.title || "Untitled Resource",
    url: originalUrl,
    type,
    category,
    description,
    date: mainObject.date || new Date().toISOString(),
    source: new URL(originalUrl).hostname,
    tags,
    fileType,
  };
}

async function storeESGResource(resource: ESGResource) {
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Store the resource in the resources table
  const { data, error } = await supabase.from("resources").insert([
    {
      title: resource.title,
      description: resource.description,
      type: resource.type,
      category: resource.category,
      url: resource.url,
      file_type: resource.fileType,
      source: resource.source,
      date_added: new Date().toISOString(),
      tags: resource.tags,
    },
  ]);

  if (error) {
    console.error("Error storing resource:", error);
    throw error;
  }

  return data;
}
