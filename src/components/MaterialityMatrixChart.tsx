import React from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface MaterialityTopic {
  id: string;
  name: string;
  category: "environmental" | "social" | "governance";
  stakeholderImpact: number;
  businessImpact: number;
  description: string;
}

interface MaterialityMatrixChartProps {
  topics: MaterialityTopic[];
  onTopicClick?: (topic: MaterialityTopic) => void;
  selectedTopicId?: string;
}

const MaterialityMatrixChart: React.FC<MaterialityMatrixChartProps> = ({
  topics,
  onTopicClick,
  selectedTopicId,
}) => {
  // Transform topics into chart data
  const datasets = [
    {
      label: "Environmental",
      data: topics
        .filter((topic) => topic.category === "environmental")
        .map((topic) => ({
          x: topic.businessImpact,
          y: topic.stakeholderImpact,
          id: topic.id,
          name: topic.name,
          category: topic.category,
          description: topic.description,
        })),
      backgroundColor: "rgba(34, 197, 94, 0.8)",
      borderColor: "rgba(34, 197, 94, 1)",
      borderWidth: 1,
      pointRadius: 8,
      pointHoverRadius: 10,
    },
    {
      label: "Social",
      data: topics
        .filter((topic) => topic.category === "social")
        .map((topic) => ({
          x: topic.businessImpact,
          y: topic.stakeholderImpact,
          id: topic.id,
          name: topic.name,
          category: topic.category,
          description: topic.description,
        })),
      backgroundColor: "rgba(59, 130, 246, 0.8)",
      borderColor: "rgba(59, 130, 246, 1)",
      borderWidth: 1,
      pointRadius: 8,
      pointHoverRadius: 10,
    },
    {
      label: "Governance",
      data: topics
        .filter((topic) => topic.category === "governance")
        .map((topic) => ({
          x: topic.businessImpact,
          y: topic.stakeholderImpact,
          id: topic.id,
          name: topic.name,
          category: topic.category,
          description: topic.description,
        })),
      backgroundColor: "rgba(168, 85, 247, 0.8)",
      borderColor: "rgba(168, 85, 247, 1)",
      borderWidth: 1,
      pointRadius: 8,
      pointHoverRadius: 10,
    },
  ];

  const options: ChartOptions<"scatter"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: 0,
        max: 1,
        title: {
          display: true,
          text: "Business Impact",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        min: 0,
        max: 1,
        title: {
          display: true,
          text: "Stakeholder Impact",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const point = context.raw as any;
            return `${point.name} (${point.category}): Business Impact: ${point.x.toFixed(
              2,
            )}, Stakeholder Impact: ${point.y.toFixed(2)}`;
          },
        },
      },
      legend: {
        position: "bottom",
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const datasetIndex = elements[0].datasetIndex;
        const index = elements[0].index;
        const clickedTopic = topics.find(
          (topic) => topic.id === datasets[datasetIndex].data[index].id,
        );
        if (clickedTopic && onTopicClick) {
          onTopicClick(clickedTopic);
        }
      }
    },
  };

  // Add quadrant lines
  const plugins = [
    {
      id: "quadrantLines",
      beforeDraw(chart) {
        const { ctx, chartArea } = chart;
        const { left, top, right, bottom } = chartArea;
        const midX = (left + right) / 2;
        const midY = (top + bottom) / 2;

        // Draw quadrant lines
        ctx.save();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1;

        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(left, midY);
        ctx.lineTo(right, midY);
        ctx.stroke();

        // Vertical line
        ctx.beginPath();
        ctx.moveTo(midX, top);
        ctx.lineTo(midX, bottom);
        ctx.stroke();

        // Add quadrant labels
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Top-left: Monitor
        ctx.fillText(
          "Monitor",
          left + (midX - left) / 2,
          top + (midY - top) / 2,
        );

        // Top-right: Manage
        ctx.fillText(
          "Manage",
          midX + (right - midX) / 2,
          top + (midY - top) / 2,
        );

        // Bottom-left: Consider
        ctx.fillText(
          "Consider",
          left + (midX - left) / 2,
          midY + (bottom - midY) / 2,
        );

        // Bottom-right: Focus (highlighted)
        ctx.font = "bold 12px Arial";
        ctx.fillText(
          "Focus",
          midX + (right - midX) / 2,
          midY + (bottom - midY) / 2,
        );

        ctx.restore();
      },
    },
  ];

  return (
    <div className="h-[500px] w-full">
      <Scatter data={{ datasets }} options={options} plugins={plugins} />
    </div>
  );
};

export default MaterialityMatrixChart;
