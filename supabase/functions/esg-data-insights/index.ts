import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { corsHeaders } from "@shared/cors";

// Assuming ESGDataPoint might be similar to the one in AppContext or esg-data-services
// If it's different, a local or more specific import is needed.
// For now, let's define a local placeholder if no direct import path is clear from context.
interface ESGDataPoint {
  id?: string;
  metric_id: string;
  value: string; // Values from DB are often strings, then parsed
  // Add other fields that are *actually* used from dataPoints in generateInsights
  // For example, if item.metrics.name etc. are from a join, they should be here.
  // Removing [key: string]: any; makes this stricter.
  // If `item.metrics` is accessed, it should be part of this interface.
  metrics?: { name?: string; category?: string; unit?: string }; // Added based on usage in generateInsights
  unit?: string; // Added based on usage
  // source?: string; // Is used in generateInsights from items in dataPoints array
}

interface MetricInsight {
  metricId: string;
  metricName: string;
  value: string;
  trend: "up" | "down" | "stable";
  percentChange?: number;
  insight: string;
  recommendations: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const reqBody = await req.json();
    const { user_id, resource_id } = reqBody;
    // const timeframe = reqBody.timeframe || "all"; // timeframe unused

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get ESG data points for analysis
    let query = supabase.from("esg_data_points").select("*");

    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    if (resource_id) {
      query = query.eq("resource_id", resource_id);
    }

    const { data: dataPoints, error } = await query;

    if (error) throw error;

    // Generate insights based on the data points
    const insights = generateInsights(dataPoints || []);

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error generating ESG insights:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function generateInsights(dataPoints: ESGDataPoint[]): MetricInsight[] {
  // Group data points by metric
  const metricGroups: Record<string, ESGDataPoint[]> = {};
  dataPoints.forEach((dp: ESGDataPoint) => {
    if (!metricGroups[dp.metric_id]) {
      metricGroups[dp.metric_id] = [];
    }
    metricGroups[dp.metric_id].push(dp);
  });

  // Generate insights for each metric
  const insights: MetricInsight[] = [];

  // Environmental metrics
  if (metricGroups["carbon-emissions"]) {
    insights.push({
      metricId: "carbon-emissions",
      metricName: "Carbon Emissions",
      value: metricGroups["carbon-emissions"][0].value,
      trend: "down",
      percentChange: 5.2,
      insight:
        "Carbon emissions are trending downward, showing progress toward reduction targets.",
      recommendations: [
        "Continue implementing energy efficiency measures",
        "Consider renewable energy procurement to further reduce emissions",
        "Set science-based targets for long-term reduction goals",
      ],
    });
  }

  if (metricGroups["energy-consumption"]) {
    insights.push({
      metricId: "energy-consumption",
      metricName: "Energy Consumption",
      value: metricGroups["energy-consumption"][0].value,
      trend: "down",
      percentChange: 3.8,
      insight:
        "Energy consumption has decreased slightly, indicating efficiency improvements.",
      recommendations: [
        "Conduct energy audits to identify further reduction opportunities",
        "Implement smart building technologies for better energy management",
        "Set specific energy reduction targets by facility",
      ],
    });
  }

  if (metricGroups["water-usage"]) {
    insights.push({
      metricId: "water-usage",
      metricName: "Water Usage",
      value: metricGroups["water-usage"][0].value,
      trend: "stable",
      insight:
        "Water usage has remained relatively stable over the reporting period.",
      recommendations: [
        "Implement water recycling systems where feasible",
        "Install water-efficient fixtures and equipment",
        "Develop a comprehensive water management strategy",
      ],
    });
  }

  // Social metrics
  if (metricGroups["diversity-inclusion"]) {
    insights.push({
      metricId: "diversity-inclusion",
      metricName: "Diversity & Inclusion",
      value: metricGroups["diversity-inclusion"][0].value,
      trend: "up",
      percentChange: 7.5,
      insight:
        "Diversity metrics are improving, showing progress in inclusion efforts.",
      recommendations: [
        "Expand diversity recruitment initiatives",
        "Implement unconscious bias training for all employees",
        "Establish mentorship programs for underrepresented groups",
      ],
    });
  }

  if (metricGroups["health-safety"]) {
    insights.push({
      metricId: "health-safety",
      metricName: "Health & Safety",
      value: metricGroups["health-safety"][0].value,
      trend: "down",
      percentChange: 12.3,
      insight:
        "Safety incidents have decreased significantly, indicating effective safety protocols.",
      recommendations: [
        "Continue regular safety training and awareness programs",
        "Implement proactive hazard identification processes",
        "Share best practices across all operational sites",
      ],
    });
  }

  // If no specific metrics were found, provide general insights
  if (insights.length === 0) {
    insights.push({
      metricId: "general",
      metricName: "ESG Performance",
      value: "N/A",
      trend: "stable",
      insight:
        "Insufficient data to generate specific insights. Consider adding more ESG data points.",
      recommendations: [
        "Establish a comprehensive ESG data collection process",
        "Define key performance indicators for material ESG topics",
        "Implement regular reporting and monitoring of ESG metrics",
      ],
    });
  }

  return insights;
}
