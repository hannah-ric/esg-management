import React, { useState /*, useEffect, useCallback*/ } from "react";
// import { supabase } from "@/lib/supabase"; // Unused
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ESGDataPoint } from "@/lib/esg-data-services";
import ESGMetricChart from "./ESGMetricChart";

interface ESGHistoricalAnalysisProps {
  metric?: ESGDataPoint;
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
  const [analysis, /*setAnalysis*/] = useState<AnalysisResult | null>(null); // setAnalysis unused
  const [loading, /*setLoading*/] = useState(false); // setLoading unused
  const [error, /*setError*/] = useState<string | null>(null); // setError unused

  // const analyzeHistoricalData = async () => { // ... function body ... }; // Already commented

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
      "employee-turnover": "Employee Turnover",
      "board-diversity": "Board Diversity",
      "community-investment": "Community Investment",
      "supply-chain-assessment": "Supply Chain Assessment",
      "customer-privacy": "Customer Privacy",
      "data-security": "Data Security",
      "product-safety": "Product Safety",
      "business-ethics": "Business Ethics",
      "climate-risk": "Climate Risk",
      "renewable-energy": "Renewable Energy",
    };
    return (
      labels[metricId] ||
      metricId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  if (!metric) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Historical Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="default">
            <AlertTitle>No Metric Selected</AlertTitle>
            <AlertDescription>
              Please select a metric to perform historical analysis.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

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
    <Card className={`w-full ${className ? className : ""}`}>
      <CardHeader>
        <CardTitle className="text-lg">
          {getMetricLabel(metric.metric_id)} - Historical Trend & Insights
        </CardTitle>
        {analysis && <CardDescription>Summary: &quot;{analysis.insights.join(', ')}&quot;</CardDescription>}
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
              Click &quot;Analyze Trend&quot; to generate insights from historical data.
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
