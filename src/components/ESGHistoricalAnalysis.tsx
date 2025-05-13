import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { ESGDataPoint } from "@/lib/esg-data-services";
import ESGMetricChart from "./ESGMetricChart";

interface ESGHistoricalAnalysisProps {
  metric: ESGDataPoint;
  className?: string;
}

interface AnalysisResult {
  metricId: string;
  trend: "increasing" | "decreasing" | "stable" | "insufficient data";
  percentChange: number;
  forecast?: Array<{
    year: string;
    value: number;
    isProjected: boolean;
  }>;
  insights: string[];
}

const ESGHistoricalAnalysis: React.FC<ESGHistoricalAnalysisProps> = ({
  metric,
  className = "",
}) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeHistoricalData = async () => {
    if (
      !metric ||
      !metric.historical_data ||
      metric.historical_data.length < 2
    ) {
      setError(
        "Insufficient historical data for analysis. At least 2 data points are required.",
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare data for the edge function
      const values = [...metric.historical_data];

      // Add current value as the most recent data point
      if (metric.value && metric.reporting_year) {
        values.push({
          year: metric.reporting_year,
          value: metric.value,
          source: metric.source || "Current data",
        });
      }

      // Sort by year to ensure chronological order
      values.sort((a, b) => a.year.localeCompare(b.year));

      // Call the edge function
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-esg-historical-analysis",
        {
          body: {
            metricId: metric.metric_id,
            values: values.map((v) => ({ year: v.year, value: v.value })),
            forecastYears: 3,
          },
        },
      );

      if (error) throw error;

      setAnalysis(data as AnalysisResult);
    } catch (err) {
      console.error("Error analyzing historical data:", err);
      setError("Failed to analyze historical data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      case "decreasing":
        return <TrendingDown className="h-5 w-5 text-green-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMetricLabel = (metricId: string) => {
    const labels: Record<string, string> = {
      "carbon-emissions": "Carbon Emissions",
      "energy-consumption": "Energy Consumption",
      "water-usage": "Water Usage",
      "waste-management": "Waste Management",
      "diversity-inclusion": "Diversity & Inclusion",
      "health-safety": "Health & Safety",
    };
    return (
      labels[metricId] ||
      metricId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  // Prepare data for chart display
  const prepareChartData = () => {
    if (!analysis || !analysis.forecast) return null;

    // Create a copy of the metric with forecast data included
    const metricWithForecast = { ...metric };

    // Add forecast data as historical data points
    const forecastData = analysis.forecast
      .filter((item) => item.isProjected)
      .map((item) => ({
        year: item.year,
        value: item.value.toString(),
        source: "Forecast",
      }));

    // Return the metric with forecast data
    return [
      {
        ...metricWithForecast,
        historical_data: [
          ...(metricWithForecast.historical_data || []),
          ...forecastData,
        ],
      },
    ];
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Historical Analysis: {getMetricLabel(metric.metric_id)}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeHistoricalData}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Trend"
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!analysis && !loading && !error && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Click "Analyze Trend" to generate insights from historical data.
            </p>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-md">
              {getTrendIcon(analysis.trend)}
              <div>
                <div className="font-medium">
                  {analysis.trend.charAt(0).toUpperCase() +
                    analysis.trend.slice(1)}{" "}
                  Trend
                </div>
                <div className="text-sm text-muted-foreground">
                  {analysis.percentChange > 0 ? "Increased" : "Decreased"} by{" "}
                  {Math.abs(analysis.percentChange).toFixed(1)}% over the period
                </div>
              </div>
            </div>

            {analysis.insights.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Insights</h3>
                <ul className="space-y-1 list-disc pl-5">
                  {analysis.insights.map((insight, index) => (
                    <li key={index} className="text-sm">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.forecast && (
              <div className="space-y-2">
                <h3 className="font-medium">Forecast</h3>
                <div className="h-64">
                  <ESGMetricChart metrics={prepareChartData() || []} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  * Projected values are based on historical trends and may not
                  reflect future conditions
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ESGHistoricalAnalysis;
