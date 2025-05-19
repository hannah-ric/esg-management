import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { corsHeaders } from "@shared/cors";
import {
  AnalyzeUrlRequest,
  DiffbotAnalyzeResponse,
  ESGResource,
} from "@shared/types";

interface ESGDataPoint {
  value: string;
  context: string;
  confidence: number;
  source: string;
  frameworkId?: string;
  disclosureId?: string;
}

interface ESGExtractedData {
  dataPoints: Record<string, ESGDataPoint>;
  mappings: Record<string, string[]>;
  rawText: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const picaSecret = Deno.env.get("PICA_SECRET_KEY");
    const diffbotConnection = Deno.env.get("PICA_DIFFBOT_CONNECTION_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_KEY");

    if (!picaSecret || !diffbotConnection || !supabaseUrl || !supabaseKey) {
      throw new Error("Missing required environment configuration");
    }
    const {
      url,
      mode = "article",
      extractText = true, // Default to true for better ESG data extraction
    } = (await req.json()) as AnalyzeUrlRequest;

    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Call Diffbot API through Pica passthrough
    const diffbotResponse = await callDiffbotAnalyze(url, mode, extractText);

    // Process the response into a format suitable for our application
    const processedData = processDiffbotResponse(diffbotResponse, url);

    // Extract ESG-specific data points and map them to frameworks
    const esgData = await extractESGDataPoints(processedData);

    // Combine the processed data with ESG-specific data
    const enhancedData = {
      ...processedData,
      esgData,
    };

    // Store the processed data in Supabase if needed
    if (enhancedData) {
      await storeESGResource(enhancedData);
    }

    return new Response(JSON.stringify(enhancedData), {
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
  extractText: boolean = false,
): Promise<DiffbotAnalyzeResponse> {
  const endpoint = "https://api.picaos.com/v1/passthrough/v3/analyze";

  // Construct query parameters
  const params = new URLSearchParams({
    url: encodeURIComponent(url),
    mode,
    timeout: "30000", // Further increased timeout for more reliable text extraction
    fields: extractText
      ? "title,text,html,meta,tags,sentiment,links"
      : "title,text,html,meta,tags",
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
    rawContent: textContent,
    html: mainObject.html || "",
  };
}

// const generateAIEnhancedSummary = async (text: string, companyName: string, url: string) => { // Commented out

async function extractESGDataPoints(
  resource: ESGResource,
): Promise<ESGExtractedData> {
  // Initialize the ESG data structure
  const esgData: ESGExtractedData = {
    dataPoints: {},
    mappings: {},
    rawText: resource.rawContent || "",
  };

  // Define ESG frameworks and their disclosure patterns
  const frameworks = {
    GRI: {
      pattern: /GRI\s*(\d{3}(?:-\d+)?)/gi,
      disclosures: {
        "GRI 102": "General Disclosures",
        "GRI 103": "Management Approach",
        "GRI 200": "Economic",
        "GRI 300": "Environmental",
        "GRI 400": "Social",
      },
    },
    SASB: {
      pattern: /SASB\s*([A-Z]{2,3}-\d{2,3}[A-Za-z]?)/gi,
      disclosures: {},
    },
    TCFD: {
      pattern: /TCFD|Task Force on Climate-related Financial Disclosures/gi,
      disclosures: {
        "TCFD-GOV": "Governance",
        "TCFD-STR": "Strategy",
        "TCFD-RM": "Risk Management",
        "TCFD-MT": "Metrics and Targets",
      },
    },
  };

  // Extract specific ESG metrics based on common patterns
  const metrics = {
    "carbon-emissions": {
      patterns: [
        /carbon emissions[:\s]*(\d+(?:[,.]\d+)?\s*(?:tCO2e|tons|tonnes))/i,
        /scope [123][:\s]*(\d+(?:[,.]\d+)?\s*(?:tCO2e|tons|tonnes))/i,
        /greenhouse gas emissions[:\s]*(\d+(?:[,.]\d+)?\s*(?:tCO2e|tons|tonnes))/i,
      ],
      frameworks: ["GRI 305", "SASB", "TCFD-MT"],
    },
    "energy-consumption": {
      patterns: [
        /energy consumption[:\s]*(\d+(?:[,.]\d+)?\s*(?:MWh|GWh|kWh))/i,
        /renewable energy[:\s]*(\d+(?:[,.]\d+)?\s*(?:%|percent))/i,
      ],
      frameworks: ["GRI 302", "SASB"],
    },
    "water-usage": {
      patterns: [
        /water consumption[:\s]*(\d+(?:[,.]\d+)?\s*(?:m3|liters|gallons))/i,
        /water withdrawal[:\s]*(\d+(?:[,.]\d+)?\s*(?:m3|liters|gallons))/i,
      ],
      frameworks: ["GRI 303", "SASB"],
    },
    "waste-management": {
      patterns: [
        /waste generated[:\s]*(\d+(?:[,.]\d+)?\s*(?:tons|tonnes))/i,
        /waste recycled[:\s]*(\d+(?:[,.]\d+)?\s*(?:%|percent|tons|tonnes))/i,
      ],
      frameworks: ["GRI 306", "SASB"],
    },
    "diversity-inclusion": {
      patterns: [
        /gender diversity[:\s]*(\d+(?:[,.]\d+)?\s*(?:%|percent))/i,
        /women in leadership[:\s]*(\d+(?:[,.]\d+)?\s*(?:%|percent))/i,
        /board diversity[:\s]*(\d+(?:[,.]\d+)?\s*(?:%|percent))/i,
      ],
      frameworks: ["GRI 405", "SASB"],
    },
    "health-safety": {
      patterns: [
        /lost time injury[:\s]*(\d+(?:[,.]\d+)?)/i,
        /safety incidents[:\s]*(\d+(?:[,.]\d+)?)/i,
        /recordable injury rate[:\s]*(\d+(?:[,.]\d+)?)/i,
      ],
      frameworks: ["GRI 403", "SASB"],
    },
  };

  // Extract framework references
  Object.entries(frameworks).forEach(([frameworkId, framework]) => {
    const matches = resource.rawContent?.match(framework.pattern) || [];
    matches.forEach((match) => {
      const disclosureId = match.trim();
      if (!esgData.mappings[frameworkId]) {
        esgData.mappings[frameworkId] = [];
      }
      if (!esgData.mappings[frameworkId].includes(disclosureId)) {
        esgData.mappings[frameworkId].push(disclosureId);
      }
    });
  });

  // Extract specific metrics
  Object.entries(metrics).forEach(([metricId, metric]) => {
    metric.patterns.forEach((pattern) => {
      const matches = resource.rawContent?.match(pattern) || [];
      if (matches.length > 0) {
        // Find the context around the match
        const matchIndex = resource.rawContent?.indexOf(matches[0]) || 0;
        const startContext = Math.max(0, matchIndex - 100);
        const endContext = Math.min(
          resource.rawContent?.length || 0,
          matchIndex + matches[0].length + 100,
        );
        const context =
          resource.rawContent?.substring(startContext, endContext) || "";

        // Extract the value from the match
        const valueMatch = pattern.exec(matches[0]);
        const value = valueMatch && valueMatch[1] ? valueMatch[1] : matches[0];

        esgData.dataPoints[metricId] = {
          value,
          context,
          confidence: 0.8, // Placeholder confidence score
          source: resource.url,
          frameworkId: metric.frameworks[0]?.split(" ")[0] || undefined,
          disclosureId: metric.frameworks[0] || undefined,
        };

        // Add mappings for this metric
        metric.frameworks.forEach((frameworkRef) => {
          const [frameworkId, disclosureId] = frameworkRef.split(" ");
          if (!esgData.mappings[frameworkId]) {
            esgData.mappings[frameworkId] = [];
          }
          if (
            disclosureId &&
            !esgData.mappings[frameworkId].includes(disclosureId)
          ) {
            esgData.mappings[frameworkId].push(disclosureId);
          }
        });
      }
    });
  });

  return esgData;
}

async function storeESGResource(
  resource: ESGResource & { esgData?: ESGExtractedData },
) {
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_KEY") || "";
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase service credentials not configured");
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Store the resource in the resources table
    const { data: resourceData, error: resourceError } = await supabase
      .from("resources")
      .insert([
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
      ])
      .select()
      .single();

    if (resourceError) {
      console.error("Error storing resource:", resourceError);
      throw resourceError;
    }

    // If we have ESG data and a resource ID, store the ESG data points
    if (resource.esgData && resourceData?.id) {
      // Store ESG data points
      const dataPointsToInsert = Object.entries(
        resource.esgData.dataPoints,
      ).map(([metricId, dataPoint]) => ({
        resource_id: resourceData.id,
        metric_id: metricId,
        value: dataPoint.value,
        context: dataPoint.context,
        confidence: dataPoint.confidence,
        source: dataPoint.source,
        framework_id: dataPoint.frameworkId,
        disclosure_id: dataPoint.disclosureId,
        created_at: new Date().toISOString(),
      }));

      if (dataPointsToInsert.length > 0) {
        const { error: dataPointsError } = await supabase
          .from("esg_data_points")
          .insert(dataPointsToInsert);

        if (dataPointsError) {
          console.error("Error storing ESG data points:", dataPointsError);
        }
      }

      // Store framework mappings
      const mappingsToInsert = [];
      for (const [frameworkId, disclosures] of Object.entries(
        resource.esgData.mappings,
      )) {
        for (const disclosureId of disclosures) {
          mappingsToInsert.push({
            resource_id: resourceData.id,
            framework_id: frameworkId,
            disclosure_id: disclosureId,
            created_at: new Date().toISOString(),
          });
        }
      }

      if (mappingsToInsert.length > 0) {
        const { error: mappingsError } = await supabase
          .from("esg_framework_mappings")
          .insert(mappingsToInsert);

        if (mappingsError) {
          console.error("Error storing ESG framework mappings:", mappingsError);
        }
      }
    }

    return resourceData;
  } catch (error) {
    console.error("Error in storeESGResource:", error);
    throw error;
  }
}
