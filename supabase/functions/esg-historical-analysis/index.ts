import { corsHeaders } from "@shared/cors.ts";

interface HistoricalDataRequest {
  metricId: string;
  values: Array<{
    year: string;
    value: string;
  }>;
  forecastYears?: number;
}

interface HistoricalDataResponse {
  metricId: string;
  trend: string;
  percentChange: number;
  forecast?: Array<{
    year: string;
    value: number;
    isProjected: boolean;
  }>;
  insights: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const {
      metricId,
      values,
      forecastYears = 3,
    } = (await req.json()) as HistoricalDataRequest;

    if (!metricId || !values || values.length < 2) {
      throw new Error(
        "Invalid request: metricId and at least 2 historical values are required",
      );
    }

    // Parse values to numbers for analysis
    const parsedValues = values
      .map((item) => ({
        year: parseInt(item.year),
        value: parseNumericValue(item.value),
      }))
      .filter((item) => !isNaN(item.value));

    // Sort by year
    parsedValues.sort((a, b) => a.year - b.year);

    // Calculate trend
    const trend = calculateTrend(parsedValues);

    // Calculate percent change from first to last year
    const percentChange = calculatePercentChange(parsedValues);

    // Generate forecast if requested
    const forecast =
      forecastYears > 0
        ? generateForecast(parsedValues, forecastYears)
        : undefined;

    // Generate insights
    const insights = generateInsights(
      metricId,
      parsedValues,
      trend,
      percentChange,
    );

    const response: HistoricalDataResponse = {
      metricId,
      trend,
      percentChange,
      forecast,
      insights,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

// Helper function to parse numeric values from strings
function parseNumericValue(value: string): number {
  if (!value) return NaN;

  // Handle percentage values
  if (value.includes("%")) {
    const percentValue = value.replace(/[^0-9.]/g, "");
    return parseFloat(percentValue);
  }

  // Handle values with units (e.g., "1,250 tCO2e", "45,200 MWh")
  // Remove commas and extract the numeric part
  const numericString = value.replace(/,/g, "").match(/([\d.]+)/)?.[0] || "";
  return parseFloat(numericString);
}

// Calculate trend (increasing, decreasing, stable)
function calculateTrend(
  values: Array<{ year: number; value: number }>,
): string {
  if (values.length < 2) return "insufficient data";

  // Calculate average change
  let totalChange = 0;
  for (let i = 1; i < values.length; i++) {
    totalChange += values[i].value - values[i - 1].value;
  }

  const avgChange = totalChange / (values.length - 1);

  // Determine trend based on average change
  if (Math.abs(avgChange) < 0.01 * values[0].value) {
    return "stable";
  } else if (avgChange > 0) {
    return "increasing";
  } else {
    return "decreasing";
  }
}

// Calculate percent change from first to last year
function calculatePercentChange(
  values: Array<{ year: number; value: number }>,
): number {
  if (values.length < 2) return 0;

  const firstValue = values[0].value;
  const lastValue = values[values.length - 1].value;

  if (firstValue === 0) return 0; // Avoid division by zero

  return ((lastValue - firstValue) / Math.abs(firstValue)) * 100;
}

// Generate forecast for future years
function generateForecast(
  values: Array<{ year: number; value: number }>,
  forecastYears: number,
): Array<{ year: string; value: number; isProjected: boolean }> {
  // Simple linear regression for forecasting
  const n = values.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;

  values.forEach((point) => {
    sumX += point.year;
    sumY += point.value;
    sumXY += point.year * point.value;
    sumXX += point.year * point.year;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Create result with historical and forecasted values
  const result = values.map((point) => ({
    year: point.year.toString(),
    value: point.value,
    isProjected: false,
  }));

  // Add forecasted values
  const lastYear = values[values.length - 1].year;
  for (let i = 1; i <= forecastYears; i++) {
    const forecastYear = lastYear + i;
    const forecastValue = slope * forecastYear + intercept;
    result.push({
      year: forecastYear.toString(),
      value: Math.max(0, forecastValue), // Ensure non-negative values
      isProjected: true,
    });
  }

  return result;
}

// Generate insights based on the data
function generateInsights(
  metricId: string,
  values: Array<{ year: number; value: number }>,
  trend: string,
  percentChange: number,
): string[] {
  const insights: string[] = [];

  // Add trend insight
  if (trend === "decreasing") {
    insights.push(
      `${getMetricLabel(metricId)} has been decreasing over time, with a ${Math.abs(percentChange).toFixed(1)}% reduction since ${values[0].year}.`,
    );
  } else if (trend === "increasing") {
    insights.push(
      `${getMetricLabel(metricId)} has been increasing over time, with a ${percentChange.toFixed(1)}% increase since ${values[0].year}.`,
    );
  } else {
    insights.push(
      `${getMetricLabel(metricId)} has remained relatively stable since ${values[0].year}.`,
    );
  }

  // Add year-over-year insights
  if (values.length >= 3) {
    const recentChange =
      ((values[values.length - 1].value - values[values.length - 2].value) /
        values[values.length - 2].value) *
      100;

    if (Math.abs(recentChange) > 5) {
      const direction = recentChange > 0 ? "increase" : "decrease";
      insights.push(
        `There was a significant ${Math.abs(recentChange).toFixed(1)}% ${direction} in ${getMetricLabel(metricId)} from ${values[values.length - 2].year} to ${values[values.length - 1].year}.`,
      );
    }
  }

  // Add metric-specific insights
  switch (metricId) {
    case "carbon-emissions":
      if (trend === "decreasing") {
        insights.push(
          "Continued reduction in carbon emissions aligns with global climate goals and may improve ESG ratings.",
        );
      } else if (trend === "increasing") {
        insights.push(
          "Increasing carbon emissions may pose regulatory and reputational risks as climate regulations tighten.",
        );
      }
      break;

    case "energy-consumption":
      if (trend === "decreasing") {
        insights.push(
          "Decreasing energy consumption suggests improved operational efficiency and reduced operational costs.",
        );
      }
      break;

    case "water-usage":
      if (trend === "decreasing") {
        insights.push(
          "Reduced water usage demonstrates improved resource efficiency and reduced environmental impact.",
        );
      } else if (trend === "increasing") {
        insights.push(
          "Increasing water usage may indicate water stress risks, especially in water-scarce regions.",
        );
      }
      break;

    case "diversity-inclusion":
      if (trend === "increasing") {
        insights.push(
          "Improving diversity metrics indicates progress toward workforce inclusion goals and may enhance innovation.",
        );
      } else if (trend === "decreasing") {
        insights.push(
          "Declining diversity metrics may require attention to recruitment, retention, and inclusion practices.",
        );
      }
      break;
  }

  return insights;
}

// Helper function to get human-readable metric labels
function getMetricLabel(metricId: string): string {
  const labels: Record<string, string> = {
    "carbon-emissions": "Carbon emissions",
    "energy-consumption": "Energy consumption",
    "water-usage": "Water usage",
    "waste-management": "Waste management",
    "diversity-inclusion": "Diversity and inclusion",
    "health-safety": "Health and safety",
    "employee-turnover": "Employee turnover",
    "board-diversity": "Board diversity",
    "community-investment": "Community investment",
  };

  return (
    labels[metricId] ||
    metricId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
}
