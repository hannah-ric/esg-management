import React, { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUserESGDataPoints, ESGDataPoint } from "@/lib/esg-data-services";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
);

interface ESGDataVisualizationProps {
  resourceId?: string;
  showFilters?: boolean;
}

const ESGDataVisualization: React.FC<ESGDataVisualizationProps> = ({
  resourceId,
  showFilters = true,
}) => {
  const [dataByResource, setDataByResource] = useState<Record<string, ESGDataPoint[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("bar");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, [resourceId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all ESG data points grouped by resource
      const dataPoints = await getUserESGDataPoints();
      setDataByResource(dataPoints);
    } catch (err) {
      console.error("Error loading ESG data:", err);
      setError("Failed to load ESG data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Process data for visualization
  const processDataForCharts = () => {
    // Combine all data points across resources
    let allDataPoints: ESGDataPoint[] = [];
    Object.values(dataByResource).forEach((dataPoints) => {
      allDataPoints = [...allDataPoints, ...dataPoints];
    });

    // Filter by category if needed
    if (categoryFilter !== "all") {
      allDataPoints = allDataPoints.filter((dp) => {
        const metricCategory = getMetricCategory(dp.metric_id);
        return metricCategory === categoryFilter;
      });
    }

    // Group by metric
    const metricGroups: Record<string, ESGDataPoint[]> = {};
    allDataPoints.forEach((dp) => {
      if (!metricGroups[dp.metric_id]) {
        metricGroups[dp.metric_id] = [];
      }
      metricGroups[dp.metric_id].push(dp);
    });

    // Prepare data for charts
    const labels = Object.keys(metricGroups).map(getMetricLabel);
    const data = Object.values(metricGroups).map((group) => {
      // For simplicity, use the first value in each group
      // In a real app, you might want to aggregate values
      const value = group[0].value;
      // Extract numeric value from string (e.g., "1000 tCO2e" -> 1000)
      const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
      return isNaN(numericValue) ? 0 : numericValue;
    });

    // Generate colors
    const backgroundColors = labels.map((_, i) => {
      const hue = (i * 137) % 360; // Golden angle approximation for good color distribution
      return `hsla(${hue}, 70%, 60%, 0.7)`;
    });

    return {
      labels,
      datasets: [
        {
          label: "ESG Metrics",
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map((color) =>
            color.replace("0.7", "1"),
          ),
          borderWidth: 1,
        },
      ],
    };
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "ESG Data Visualization",
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
        {error}
      </div>
    );
  }

  const chartData = processDataForCharts();
  const hasData = chartData.labels.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>ESG Data Visualization</span>
          {showFilters && (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="environmental">Environmental</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="governance">Governance</SelectItem>
              </SelectContent>
            </Select>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No ESG data available for visualization. Add some data points
              first.
            </p>
          </div>
        ) : (
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                <TabsTrigger value="pie">Pie Chart</TabsTrigger>
                <TabsTrigger value="line">Line Chart</TabsTrigger>
              </TabsList>

              <TabsContent value="bar">
                <div className="h-[400px]">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </TabsContent>

              <TabsContent value="pie">
                <div className="h-[400px]">
                  <Pie data={chartData} options={chartOptions} />
                </div>
              </TabsContent>

              <TabsContent value="line">
                <div className="h-[400px]">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ESGDataVisualization;
