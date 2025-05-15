import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Loader2,
  TrendingDown,
  TrendingUp,
  Minus,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAppContext } from "./AppContext";

// Helper functions (module scope - defined before use)
const getMetricCategory = (metricId: string): string => {
  const environmentalMetrics = [
    "carbon-emissions",
    "energy-consumption",
    "water-usage",
    "waste-management",
  ];
  const socialMetrics = [
    "diversity-inclusion",
    "health-safety",
    "employee-satisfaction",
    "community-engagement",
  ];
  const governanceMetrics = [
    "board-diversity",
    "ethics-compliance",
    "risk-management",
    "transparency",
  ];

  if (environmentalMetrics.includes(metricId)) return "environmental";
  if (socialMetrics.includes(metricId)) return "social";
  if (governanceMetrics.includes(metricId)) return "governance";
  return "general";
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "environmental":
      return "bg-green-100 text-green-800";
    case "social":
      return "bg-blue-100 text-blue-800";
    case "governance":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-5 w-5 text-red-500" />;
    case "down":
      return <TrendingDown className="h-5 w-5 text-green-500" />;
    default:
      return <Minus className="h-5 w-5 text-gray-500" />;
  }
};

const getTrendColor = (trend: string, metricType: string) => {
  const environmentalMetrics = [
    "carbon-emissions",
    "energy-consumption",
    "water-usage",
    "waste-management",
  ];
  const socialMetrics = [
    "diversity-inclusion",
    "health-safety",
    "employee-satisfaction",
  ];

  const isEnvironmental = environmentalMetrics.includes(metricType);
  const isSocial = socialMetrics.includes(metricType);

  if (isEnvironmental) {
    return trend === "down"
      ? "text-green-600"
      : trend === "up"
        ? "text-red-600"
        : "text-gray-600";
  } else if (isSocial) {
    return trend === "up"
      ? "text-green-600"
      : trend === "down"
        ? "text-red-600"
        : "text-gray-600";
  }
  return "text-gray-600";
};

interface ESGDataInsightsProps {
  resourceId?: string;
  metricId?: string;
  className?: string;
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

const InsightCard: React.FC<{ insight: MetricInsight }> = ({ insight }) => {
  const category = getMetricCategory(insight.metricId);
  const categoryColor = getCategoryColor(category);
  const trendColor = getTrendColor(insight.trend, insight.metricId);

  return (
    <div className="border rounded-md p-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={categoryColor}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
            <h3 className="font-medium">{insight.metricName}</h3>
          </div>
          <div className="mt-2 flex items-center">
            <span className="text-lg font-medium">{insight.value}</span>
            {insight.percentChange !== undefined && (
              <span className={`ml-2 flex items-center ${trendColor}`}>
                {getTrendIcon(insight.trend)}
                <span className="ml-1">
                  {Math.abs(insight.percentChange).toFixed(1)}%
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 text-muted-foreground">{insight.insight}</p>

      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
        <ul className="list-disc pl-5 space-y-1">
          {insight.recommendations.map((rec, index) => (
            <li key={index} className="text-sm">
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const ESGDataInsights: React.FC<ESGDataInsightsProps> = ({
  resourceId,
  metricId,
  className,
}) => {
  const { user } = useAppContext();
  const [insights, setInsights] = useState<MetricInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user) {
      loadInsights();
    }
  }, [user, resourceId, metricId]);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke(
        "supabase-functions-esg-data-insights",
        {
          body: {
            userId: user?.id,
            resourceId,
            metricId,
            timeframe: "month",
          },
        },
      );

      if (funcError) throw new Error(funcError.message);
      // Ensure data and data.insights are not null/undefined before setting state
      setInsights(data?.insights || []); 
    } catch (err: any) {
      console.error("Error loading ESG insights:", err);
      setError(err.message || "Failed to load ESG insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>ESG Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>ESG Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>ESG Insights & Recommendations</span>
          <Button variant="outline" size="sm" onClick={loadInsights}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No ESG insights available. Add more data points to generate
              insights.
            </p>
          </div>
        ) : (
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="environmental">Environmental</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
                <TabsTrigger value="governance">Governance</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {insights.map((insight) => (
                  <InsightCard key={insight.metricId} insight={insight} />
                ))}
              </TabsContent>

              <TabsContent value="environmental" className="space-y-4">
                {insights
                  .filter(
                    (insight) =>
                      getMetricCategory(insight.metricId) === "environmental",
                  )
                  .map((insight) => (
                    <InsightCard key={insight.metricId} insight={insight} />
                  ))}
              </TabsContent>

              <TabsContent value="social" className="space-y-4">
                {insights
                  .filter(
                    (insight) =>
                      getMetricCategory(insight.metricId) === "social",
                  )
                  .map((insight) => (
                    <InsightCard key={insight.metricId} insight={insight} />
                  ))}
              </TabsContent>

              <TabsContent value="governance" className="space-y-4">
                {insights
                  .filter(
                    (insight) =>
                      getMetricCategory(insight.metricId) === "governance",
                  )
                  .map((insight) => (
                    <InsightCard key={insight.metricId} insight={insight} />
                  ))}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ESGDataInsights;
