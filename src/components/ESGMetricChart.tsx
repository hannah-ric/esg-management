import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { ESGDataPoint } from "@/lib/esg-data-services";
import type { TooltipItem } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface ESGMetricChartProps {
  metrics: ESGDataPoint[];
  chartType?: "line" | "bar";
}

// Define interfaces for Chart.js data structure
interface ChartJsDataset {
  label: string;
  data: (number | string | null)[]; // Can be number, string (if not allNumeric), or null for gaps
  borderColor: string;
  backgroundColor: string;
  tension?: number;
  borderDash?: number[];
  pointStyle?: string | false; // PointElement.pointStyle allow false.
  pointRadius?: number;
  pointHoverRadius?: number;
  originalValues?: (string | number)[]; // For tooltip
}

interface ChartJsData {
  labels: string[];
  datasets: ChartJsDataset[];
}

const ESGMetricChart: React.FC<ESGMetricChartProps> = ({
  metrics,
  chartType = "line",
}) => {
  const [chartData, setChartData] = useState<ChartJsData | null>(null);

  useEffect(() => {
    if (!metrics || metrics.length === 0) return;

    // Process metrics to include both current and historical data
    const allDataPoints: {
      year: string;
      value: string | number;
      source?: string;
      isProjected?: boolean;
    }[] = [];

    // Add current data points
    metrics.forEach((metric) => {
      if (metric.reporting_year && metric.value) {
        // Try to convert value to number if possible
        const numericValue = parseNumericValue(metric.value);
        allDataPoints.push({
          year: metric.reporting_year,
          value: numericValue !== null ? numericValue : metric.value,
          source: metric.source,
          isProjected: false,
        });
      }

      // Add historical data points
      if (metric.historical_data && metric.historical_data.length > 0) {
        metric.historical_data.forEach((hd) => {
          if (hd.year && hd.value) {
            const numericValue = parseNumericValue(hd.value);
            allDataPoints.push({
              year: hd.year,
              value: numericValue !== null ? numericValue : hd.value,
              source: hd.source,
              isProjected: hd.source === "Forecast",
            });
          }
        });
      }
    });

    // Sort data points by year
    allDataPoints.sort((a, b) => a.year.localeCompare(b.year));

    // Check if all values are numeric
    // const allNumeric = allDataPoints.every( // Commented out unused variable
    //   (dp) => typeof dp.value === "number",
    // );

    // Prepare chart data
    const labels = allDataPoints.map((dp) => dp.year);

    // Split data into actual and projected datasets
    const actualValues = allDataPoints
      .filter((dp) => !dp.isProjected)
      .map((dp) => dp.value);

    const projectedValues = allDataPoints.map((dp) =>
      dp.isProjected ? dp.value : null,
    );

    // Store original values for tooltip display
    const originalValues = allDataPoints.map((dp) => dp.value);

    const data = {
      labels,
      datasets: [
        {
          label: metrics[0]?.metric_id
            ? getMetricLabel(metrics[0].metric_id)
            : "Actual Values",
          data: actualValues,
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          tension: 0.3,
          originalValues: originalValues,
        },
        {
          label: "Projected Values",
          data: projectedValues,
          borderColor: "rgba(255, 99, 132, 0.8)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderDash: [5, 5],
          tension: 0.3,
          pointStyle: "circle",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };

    // If there are no projected values, remove that dataset
    if (!allDataPoints.some((dp) => dp.isProjected)) {
      data.datasets.pop();
    }

    setChartData(data);
  }, [metrics, chartType]);

  // Helper function to parse numeric values from strings
  const parseNumericValue = (value: string | number): number | null => {
    if (typeof value !== "string") return value as number;

    // Remove any non-numeric characters except decimal point
    const numericString = value.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(numericString);
    return isNaN(parsed) ? null : parsed;
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

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"bar"> | TooltipItem<"line">) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            // Always use original value from dataset if available for better readability
            if (
              'originalValues' in context.dataset &&
              context.dataset.originalValues &&
              Array.isArray(context.dataset.originalValues) &&
              context.dataset.originalValues[context.dataIndex] !== undefined
            ) {
              label += context.dataset.originalValues[context.dataIndex];
            } else if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data available for chart</p>
      </div>
    );
  }

  return chartType === "line" ? (
    <Line options={options} data={chartData} />
  ) : (
    <Bar options={options} data={chartData} />
  );
};

export default ESGMetricChart;
