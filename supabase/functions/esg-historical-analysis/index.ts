import { corsHeaders } from "@shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { handleError, handleValidationError } from "@shared/error-handler.ts";
import { validateRequiredFields, validateDate } from "@shared/validation.ts";
import { cache } from "@shared/cache.ts";

interface HistoricalAnalysisRequest {
  userId: string;
  metricIds?: string[];
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month" | "quarter" | "year";
}

interface MetricDataPoint {
  groupKey: string;
  value: number;
  sources: string[];
}

interface MetricGroup {
  metricId: string;
  metricName: string;
  category: string;
  unit: string;
  dataPoints: MetricDataPoint[];
}

interface Trend {
  metricId: string;
  metricName: string;
  category: string;
  percentChange: number;
  direction: "increase" | "decrease" | "stable";
  startValue: number;
  endValue: number;
  unit: string;
  period: string;
}

interface Recommendation {
  metricId: string;
  metricName: string;
  text: string;
  priority: "low" | "medium" | "high";
}

interface Insights {
  summary: string;
  trends: Trend[];
  recommendations: Recommendation[];
}

interface AnalysisResponse {
  data: MetricGroup[];
  insights: Insights;
  groupBy: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const requestData = (await req.json()) as HistoricalAnalysisRequest;

    // Validate required fields
    const validationError = validateRequiredFields(requestData, ["userId"]);
    if (validationError) {
      return handleValidationError(validationError);
    }

    const {
      userId,
      metricIds,
      startDate,
      endDate,
      groupBy = "month",
    } = requestData;

    // Validate date formats if provided
    if (startDate) {
      const startDateError = validateDate(startDate, "startDate");
      if (startDateError) {
        return handleValidationError(startDateError);
      }
    }

    if (endDate) {
      const endDateError = validateDate(endDate, "endDate");
      if (endDateError) {
        return handleValidationError(endDateError);
      }

      // Validate that endDate is after startDate if both are provided
      if (startDate && new Date(endDate) < new Date(startDate)) {
        return handleValidationError("endDate must be after startDate");
      }
    }

    // Validate groupBy parameter
    const validGroupByValues = ["day", "week", "month", "quarter", "year"];
    if (!validGroupByValues.includes(groupBy)) {
      return handleValidationError(
        `groupBy must be one of: ${validGroupByValues.join(", ")}`,
      );
    }

    // Check cache for identical requests
    const cacheKey = `historical_analysis:${userId}:${metricIds?.join(",") || ""}:${startDate || ""}:${endDate || ""}:${groupBy}`;
    const cachedResponse = cache.get<AnalysisResponse>(cacheKey);

    if (cachedResponse) {
      return new Response(JSON.stringify(cachedResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build the query
    let query = supabase
      .from("esg_historical_data")
      .select(
        `
        id,
        user_id,
        metric_id,
        value,
        unit,
        timestamp,
        source,
        metrics(name, category, description)
      `,
      )
      .eq("user_id", userId)
      .order("timestamp", { ascending: true });

    // Apply filters if provided
    if (metricIds && metricIds.length > 0) {
      query = query.in("metric_id", metricIds);
    }

    if (startDate) {
      query = query.gte("timestamp", startDate);
    }

    if (endDate) {
      query = query.lte("timestamp", endDate);
    }

    // Execute the query with timeout handling
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Database query timed out")), 10000); // 10 second timeout
    });

    const queryPromise = query;

    // @ts-ignore - TypeScript doesn't like the race between different promise types
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) {
      console.error("Database query error:", error);
      throw error;
    }

    // Process and group the data based on the groupBy parameter
    const processedData = processHistoricalData(data || [], groupBy);

    // Generate insights from the historical data
    const insights = generateInsights(processedData);

    // Prepare response
    const response: AnalysisResponse = {
      data: processedData,
      insights,
      groupBy,
    };

    // Cache the response for 5 minutes
    cache.set(cacheKey, response, 300);

    // Log for monitoring
    console.log(
      `Generated historical analysis for user ${userId} - ${processedData.length} metrics analyzed`,
    );

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error analyzing historical ESG data:", error);
    return handleError(error);
  }
});

// Helper function to process and group historical data
function processHistoricalData(data: any[], groupBy: string): MetricGroup[] {
  if (!data || data.length === 0) {
    return [];
  }

  // Group data by metric
  const metricGroups = data.reduce(
    (groups, item) => {
      const metricId = item.metric_id;
      if (!groups[metricId]) {
        groups[metricId] = {
          metricId,
          metricName: item.metrics?.name || "Unknown metric",
          category: item.metrics?.category || "Uncategorized",
          unit: item.unit,
          dataPoints: [],
        };
      }

      // Format timestamp based on groupBy
      const date = new Date(item.timestamp);
      let groupKey;

      switch (groupBy) {
        case "day":
          groupKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
          break;
        case "week":
          // Get the first day of the week (Sunday)
          const firstDay = new Date(date);
          const day = date.getDay();
          firstDay.setDate(date.getDate() - day);
          groupKey = firstDay.toISOString().split("T")[0];
          break;
        case "month":
          groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        case "quarter":
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          groupKey = `${date.getFullYear()}-Q${quarter}`;
          break;
        case "year":
          groupKey = `${date.getFullYear()}`;
          break;
        default:
          groupKey = date.toISOString().split("T")[0];
      }

      // Add data point to the metric group
      groups[metricId].dataPoints.push({
        timestamp: item.timestamp,
        groupKey,
        value: parseFloat(item.value),
        source: item.source,
      });

      return groups;
    },
    {} as Record<string, any>,
  );

  // Convert to array and aggregate data points by groupKey
  return Object.values(metricGroups).map((metric: any) => {
    // Group data points by groupKey and calculate average
    const groupedDataPoints = metric.dataPoints.reduce(
      (groups: Record<string, any>, point: any) => {
        if (!groups[point.groupKey]) {
          groups[point.groupKey] = {
            groupKey: point.groupKey,
            values: [],
            sources: new Set(),
          };
        }
        groups[point.groupKey].values.push(point.value);
        if (point.source) groups[point.groupKey].sources.add(point.source);
        return groups;
      },
      {},
    );

    // Calculate averages and prepare final data points
    const aggregatedDataPoints = Object.values(groupedDataPoints).map(
      (group: any) => {
        const sum = group.values.reduce((a: number, b: number) => a + b, 0);
        const average = sum / group.values.length;
        return {
          groupKey: group.groupKey,
          value: parseFloat(average.toFixed(2)),
          sources: Array.from(group.sources),
        };
      },
    );

    // Sort by groupKey
    aggregatedDataPoints.sort((a: any, b: any) =>
      a.groupKey.localeCompare(b.groupKey),
    );

    return {
      ...metric,
      dataPoints: aggregatedDataPoints,
    };
  });
}

// Helper function to generate insights from the processed data
function generateInsights(processedData: MetricGroup[]): Insights {
  if (!processedData || processedData.length === 0) {
    return {
      summary: "No historical data available for analysis.",
      trends: [],
      recommendations: [],
    };
  }

  const trends: Trend[] = [];
  const recommendations: Recommendation[] = [];

  // Analyze each metric
  processedData.forEach((metric) => {
    if (metric.dataPoints.length > 1) {
      // Calculate trend
      const firstPoint = metric.dataPoints[0];
      const lastPoint = metric.dataPoints[metric.dataPoints.length - 1];
      const firstValue = firstPoint.value;
      const lastValue = lastPoint.value;

      // Avoid division by zero
      const percentChange =
        firstValue !== 0
          ? ((lastValue - firstValue) / Math.abs(firstValue)) * 100
          : lastValue > 0
            ? 100
            : lastValue < 0
              ? -100
              : 0;

      // Add trend
      trends.push({
        metricId: metric.metricId,
        metricName: metric.metricName,
        category: metric.category,
        percentChange: parseFloat(percentChange.toFixed(2)),
        direction:
          percentChange > 0
            ? "increase"
            : percentChange < 0
              ? "decrease"
              : "stable",
        startValue: firstValue,
        endValue: lastValue,
        unit: metric.unit,
        period: `${firstPoint.groupKey} to ${lastPoint.groupKey}`,
      });

      // Generate recommendation based on trend and category
      if (metric.category.toLowerCase().includes("environmental")) {
        // For environmental metrics, usually a decrease is good (emissions, waste, etc.)
        const isPositiveTrend =
          metric.unit === "%" ? percentChange > 0 : percentChange < 0;

        if (isPositiveTrend) {
          recommendations.push({
            metricId: metric.metricId,
            metricName: metric.metricName,
            text: `Continue the positive trend in ${metric.metricName} with a ${Math.abs(percentChange).toFixed(2)}% ${percentChange > 0 ? "increase" : "decrease"} over the period.`,
            priority: "low",
          });
        } else {
          recommendations.push({
            metricId: metric.metricId,
            metricName: metric.metricName,
            text: `Consider strategies to improve ${metric.metricName} which has ${percentChange > 0 ? "increased" : "decreased"} by ${Math.abs(percentChange).toFixed(2)}% over the period.`,
            priority: Math.abs(percentChange) > 10 ? "high" : "medium",
          });
        }
      } else if (
        metric.category.toLowerCase().includes("social") ||
        metric.category.toLowerCase().includes("governance")
      ) {
        // For social and governance metrics, usually an increase is good (diversity, training, etc.)
        const isPositiveTrend =
          metric.unit === "%" ? percentChange > 0 : percentChange > 0;

        if (isPositiveTrend) {
          recommendations.push({
            metricId: metric.metricId,
            metricName: metric.metricName,
            text: `Continue the positive trend in ${metric.metricName} with a ${Math.abs(percentChange).toFixed(2)}% increase over the period.`,
            priority: "low",
          });
        } else {
          recommendations.push({
            metricId: metric.metricId,
            metricName: metric.metricName,
            text: `Develop strategies to improve ${metric.metricName} which has decreased by ${Math.abs(percentChange).toFixed(2)}% over the period.`,
            priority: Math.abs(percentChange) > 10 ? "high" : "medium",
          });
        }
      }
    }
  });

  // Generate summary
  let summary = "";
  if (trends.length === 0) {
    summary = "Insufficient historical data to identify meaningful trends.";
  } else {
    const positiveEnvironmentalTrends = trends.filter(
      (t) =>
        t.category.toLowerCase().includes("environmental") &&
        ((t.unit !== "%" && t.direction === "decrease") ||
          (t.unit === "%" && t.direction === "increase")),
    );

    const positiveSocialGovernanceTrends = trends.filter(
      (t) =>
        (t.category.toLowerCase().includes("social") ||
          t.category.toLowerCase().includes("governance")) &&
        t.direction === "increase",
    );

    summary = `Historical analysis shows ${positiveEnvironmentalTrends.length + positiveSocialGovernanceTrends.length} positive trends out of ${trends.length} metrics analyzed. `;

    if (positiveEnvironmentalTrends.length > 0) {
      const topImprovement = positiveEnvironmentalTrends.sort(
        (a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange),
      )[0];
      summary += `Most significant environmental improvement: ${topImprovement.metricName} (${Math.abs(topImprovement.percentChange)}% ${topImprovement.direction}). `;
    }

    if (positiveSocialGovernanceTrends.length > 0) {
      const topImprovement = positiveSocialGovernanceTrends.sort(
        (a, b) => b.percentChange - a.percentChange,
      )[0];
      summary += `Most significant social/governance improvement: ${topImprovement.metricName} (${topImprovement.percentChange}% increase).`;
    }
  }

  return {
    summary,
    trends,
    recommendations,
  };
}
