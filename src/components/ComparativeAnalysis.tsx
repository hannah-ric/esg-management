import React, { useState, useEffect /*, useMemo*/ } from "react";
import { useAppContext } from "./AppContext";
import { getPeerBenchmarking } from "@/lib/ai-services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, /*BarChart3,*/ ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar, Radar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
);

// Sample ESG metrics for the company - MOVED OUTSIDE COMPONENT
const companyMetricsSample = {
  environmental: {
    carbonEmissions: 75, 
    energyConsumption: 120, 
    wasteGeneration: 15, 
    waterUsage: 350, 
    renewableEnergy: 22, 
  },
  social: {
    employeeTurnover: 12, 
    diversityScore: 68, 
    trainingHours: 25, 
    healthSafetyIncidents: 2, 
    communityInvestment: 0.8, 
  },
  governance: {
    boardDiversity: 30, 
    ethicsViolations: 1, 
    dataBreaches: 0, 
    transparencyScore: 72, 
    supplierCompliance: 85, 
  },
};

interface BenchmarkMetricValue {
  industry: number;
  leaders: number;
}

interface BenchmarkCategory {
  carbonEmissions: BenchmarkMetricValue;
  energyConsumption: BenchmarkMetricValue;
  wasteGeneration: BenchmarkMetricValue;
  waterUsage: BenchmarkMetricValue;
  renewableEnergy: BenchmarkMetricValue;
  // Add other metrics if they can appear here
}

interface BenchmarkSocialCategory {
  employeeTurnover: BenchmarkMetricValue;
  diversityScore: BenchmarkMetricValue;
  trainingHours: BenchmarkMetricValue;
  healthSafetyIncidents: BenchmarkMetricValue;
  communityInvestment: BenchmarkMetricValue;
  // Add other metrics if they can appear here
}

interface BenchmarkGovernanceCategory {
  boardDiversity: BenchmarkMetricValue;
  ethicsViolations: BenchmarkMetricValue;
  dataBreaches: BenchmarkMetricValue;
  transparencyScore: BenchmarkMetricValue;
  supplierCompliance: BenchmarkMetricValue;
  // Add other metrics if they can appear here
}

interface BenchmarkData {
  environmental: BenchmarkCategory;
  social: BenchmarkSocialCategory;
  governance: BenchmarkGovernanceCategory;
  insights: string;
}

interface ComparativeAnalysisProps {
  industry?: string;
  companySize?: string;
}

const ComparativeAnalysis: React.FC<ComparativeAnalysisProps> = ({
  industry = "Manufacturing",
  companySize = "Medium Enterprise",
}) => {
  const { questionnaireData } = useAppContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);

  // Use industry and company size from context if available
  const companyIndustry =
    questionnaireData?.["industry-selection"]?.industry as string || industry;
  const companyEmployeeCount =
    questionnaireData?.["company-profile"]?.employeeCount as string || companySize;

  // Use the sample data defined outside
  const companyMetrics = companyMetricsSample;

  useEffect(() => {
    const fetchBenchmarkData = async () => {
      setIsLoading(true);

      try {
        const result = await getPeerBenchmarking(
          companyIndustry,
          companyEmployeeCount,
          companyMetrics,
        );

        if (result.error) {
          console.error("Error fetching benchmark data:", result.error);
          return;
        }

        // For demo purposes, we'll use sample data if the AI service doesn't return structured data
        // In a production environment, you would parse the AI response into structured data
        const sampleBenchmarkData = {
          environmental: {
            carbonEmissions: { industry: 95, leaders: 45 },
            energyConsumption: { industry: 150, leaders: 80 },
            wasteGeneration: { industry: 22, leaders: 8 },
            waterUsage: { industry: 420, leaders: 200 },
            renewableEnergy: { industry: 18, leaders: 40 },
          },
          social: {
            employeeTurnover: { industry: 15, leaders: 8 },
            diversityScore: { industry: 55, leaders: 75 },
            trainingHours: { industry: 20, leaders: 40 },
            healthSafetyIncidents: { industry: 3.5, leaders: 0.5 },
            communityInvestment: { industry: 0.5, leaders: 1.5 },
          },
          governance: {
            boardDiversity: { industry: 25, leaders: 45 },
            ethicsViolations: { industry: 2.5, leaders: 0 },
            dataBreaches: { industry: 1.2, leaders: 0 },
            transparencyScore: { industry: 65, leaders: 90 },
            supplierCompliance: { industry: 70, leaders: 95 },
          },
          insights: result.content,
        };

        setBenchmarkData(sampleBenchmarkData);
      } catch (err) {
        console.error("Error fetching benchmark data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBenchmarkData();
  }, [companyIndustry, companyEmployeeCount, companyMetrics]);

  // Prepare chart data for environmental metrics
  const environmentalChartData = {
    labels: [
      "Carbon Emissions",
      "Energy Consumption",
      "Waste Generation",
      "Water Usage",
      "Renewable Energy",
    ],
    datasets: [
      {
        label: "Your Company",
        data: [
          companyMetrics.environmental.carbonEmissions,
          companyMetrics.environmental.energyConsumption,
          companyMetrics.environmental.wasteGeneration,
          companyMetrics.environmental.waterUsage,
          companyMetrics.environmental.renewableEnergy,
        ],
        backgroundColor: "rgba(34, 197, 94, 0.6)",
      },
      {
        label: "Industry Average",
        data: benchmarkData
          ? [
              benchmarkData.environmental.carbonEmissions.industry,
              benchmarkData.environmental.energyConsumption.industry,
              benchmarkData.environmental.wasteGeneration.industry,
              benchmarkData.environmental.waterUsage.industry,
              benchmarkData.environmental.renewableEnergy.industry,
            ]
          : [0, 0, 0, 0, 0],
        backgroundColor: "rgba(100, 116, 139, 0.6)",
      },
      {
        label: "Industry Leaders",
        data: benchmarkData
          ? [
              benchmarkData.environmental.carbonEmissions.leaders,
              benchmarkData.environmental.energyConsumption.leaders,
              benchmarkData.environmental.wasteGeneration.leaders,
              benchmarkData.environmental.waterUsage.leaders,
              benchmarkData.environmental.renewableEnergy.leaders,
            ]
          : [0, 0, 0, 0, 0],
        backgroundColor: "rgba(59, 130, 246, 0.6)",
      },
    ],
  };

  // Prepare radar chart data for overall ESG performance
  const radarChartData = {
    labels: [
      "Carbon Emissions",
      "Energy Efficiency",
      "Waste Management",
      "Water Management",
      "Diversity & Inclusion",
      "Employee Development",
      "Health & Safety",
      "Board Diversity",
      "Ethics & Compliance",
      "Data Security",
    ],
    datasets: [
      {
        label: "Your Company",
        data: [70, 65, 80, 60, 75, 70, 85, 60, 80, 90],
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        borderColor: "rgba(34, 197, 94, 1)",
        pointBackgroundColor: "rgba(34, 197, 94, 1)",
      },
      {
        label: "Industry Average",
        data: [60, 55, 65, 50, 60, 65, 70, 55, 70, 75],
        backgroundColor: "rgba(100, 116, 139, 0.2)",
        borderColor: "rgba(100, 116, 139, 1)",
        pointBackgroundColor: "rgba(100, 116, 139, 1)",
      },
      {
        label: "Industry Leaders",
        data: [85, 90, 95, 80, 90, 85, 95, 85, 95, 98],
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "rgba(59, 130, 246, 1)",
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
      },
    ],
  };

  // Helper function to determine if a metric is better or worse than industry average
  const getPerformanceIndicator = (
    metric: string,
    value: number,
    benchmark: number,
    isHigherBetter = true,
  ) => {
    const percentDiff = ((value - benchmark) / benchmark) * 100;
    const isPositive = isHigherBetter ? value > benchmark : value < benchmark;

    return (
      <div className="flex items-center">
        <span className="font-medium">{value}</span>
        <span
          className={`ml-2 text-xs flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}
        >
          {Math.abs(percentDiff).toFixed(1)}%
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3 ml-0.5" />
          ) : (
            <ArrowDownRight className="h-3 w-3 ml-0.5" />
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            ESG Performance Benchmarking
          </h1>
          <p className="text-muted-foreground mt-1">
            Compare your ESG performance against industry peers and leaders
          </p>
        </div>

        <div className="flex items-center mb-6">
          <Badge variant="outline" className="mr-2">
            Industry: {companyIndustry}
          </Badge>
          <Badge variant="outline">Company Size: {companyEmployeeCount}</Badge>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                setIsLoading(false);
              }, 1500);
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh Data"
            )}
          </Button>
        </div>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="environmental">Environmental</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ESG Performance Overview</CardTitle>
                <CardDescription>
                  Radar chart showing your performance across key ESG metrics
                  compared to industry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] w-full">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Radar
                      data={radarChartData}
                      options={{
                        scales: {
                          r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                              stepSize: 20,
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            position: "top" as const,
                          },
                        },
                        maintainAspectRatio: false,
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {benchmarkData?.insights && (
              <Card>
                <CardHeader>
                  <CardTitle>Benchmark Insights</CardTitle>
                  <CardDescription>
                    AI-generated analysis of your ESG performance compared to
                    peers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line">
                    {benchmarkData.insights}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>
                  Key metrics compared to industry averages and leaders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                      Environmental
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Carbon Emissions</span>
                        <Badge variant="outline" className="bg-green-50">
                          20% better than average
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Energy Efficiency</span>
                        <Badge variant="outline" className="bg-green-50">
                          15% better than average
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Renewable Energy</span>
                        <Badge variant="outline" className="bg-amber-50">
                          5% below leaders
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                      Social
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Diversity Score</span>
                        <Badge variant="outline" className="bg-green-50">
                          13% better than average
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Health & Safety</span>
                        <Badge variant="outline" className="bg-green-50">
                          40% better than average
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Training Hours</span>
                        <Badge variant="outline" className="bg-amber-50">
                          15% below leaders
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                      Governance
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Board Diversity</span>
                        <Badge variant="outline" className="bg-green-50">
                          5% better than average
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Ethics Violations</span>
                        <Badge variant="outline" className="bg-green-50">
                          60% better than average
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Transparency</span>
                        <Badge variant="outline" className="bg-amber-50">
                          18% below leaders
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environmental" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Environmental Performance</CardTitle>
                <CardDescription>
                  Detailed comparison of environmental metrics against industry
                  benchmarks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full mb-8">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Bar
                      data={environmentalChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  )}
                </div>

                <Separator className="my-6" />

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 font-medium">Metric</th>
                        <th className="text-right py-3 font-medium">
                          Your Company
                        </th>
                        <th className="text-right py-3 font-medium">
                          Industry Avg
                        </th>
                        <th className="text-right py-3 font-medium">
                          Industry Leaders
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {benchmarkData && (
                        <>
                          <tr className="border-b">
                            <td className="py-3">
                              Carbon Emissions (tCO2e/M$)
                            </td>
                            <td className="text-right py-3">
                              {getPerformanceIndicator(
                                "carbonEmissions",
                                companyMetrics.environmental.carbonEmissions,
                                benchmarkData.environmental.carbonEmissions
                                  .industry,
                                false,
                              )}
                            </td>
                            <td className="text-right py-3">
                              {
                                benchmarkData.environmental.carbonEmissions
                                  .industry
                              }
                            </td>
                            <td className="text-right py-3">
                              {
                                benchmarkData.environmental.carbonEmissions
                                  .leaders
                              }
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3">
                              Energy Consumption (MWh/M$)
                            </td>
                            <td className="text-right py-3">
                              {getPerformanceIndicator(
                                "energyConsumption",
                                companyMetrics.environmental.energyConsumption,
                                benchmarkData.environmental.energyConsumption
                                  .industry,
                                false,
                              )}
                            </td>
                            <td className="text-right py-3">
                              {
                                benchmarkData.environmental.energyConsumption
                                  .industry
                              }
                            </td>
                            <td className="text-right py-3">
                              {
                                benchmarkData.environmental.energyConsumption
                                  .leaders
                              }
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3">Waste Generation (tons/M$)</td>
                            <td className="text-right py-3">
                              {getPerformanceIndicator(
                                "wasteGeneration",
                                companyMetrics.environmental.wasteGeneration,
                                benchmarkData.environmental.wasteGeneration
                                  .industry,
                                false,
                              )}
                            </td>
                            <td className="text-right py-3">
                              {
                                benchmarkData.environmental.wasteGeneration
                                  .industry
                              }
                            </td>
                            <td className="text-right py-3">
                              {
                                benchmarkData.environmental.wasteGeneration
                                  .leaders
                              }
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3">Water Usage (m³/M$)</td>
                            <td className="text-right py-3">
                              {getPerformanceIndicator(
                                "waterUsage",
                                companyMetrics.environmental.waterUsage,
                                benchmarkData.environmental.waterUsage.industry,
                                false,
                              )}
                            </td>
                            <td className="text-right py-3">
                              {benchmarkData.environmental.waterUsage.industry}
                            </td>
                            <td className="text-right py-3">
                              {benchmarkData.environmental.waterUsage.leaders}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3">Renewable Energy (%)</td>
                            <td className="text-right py-3">
                              {getPerformanceIndicator(
                                "renewableEnergy",
                                companyMetrics.environmental.renewableEnergy,
                                benchmarkData.environmental.renewableEnergy
                                  .industry,
                                true,
                              )}
                            </td>
                            <td className="text-right py-3">
                              {
                                benchmarkData.environmental.renewableEnergy
                                  .industry
                              }
                              %
                            </td>
                            <td className="text-right py-3">
                              {
                                benchmarkData.environmental.renewableEnergy
                                  .leaders
                              }
                              %
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Performance</CardTitle>
                <CardDescription>
                  Detailed comparison of social metrics against industry
                  benchmarks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 font-medium">Metric</th>
                        <th className="text-right py-3 font-medium">
                          Your Company
                        </th>
                        <th className="text-right py-3 font-medium">
                          Industry Avg
                        </th>
                        <th className="text-right py-3 font-medium">
                          Industry Leaders
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {benchmarkData && (
                        <>
                          <tr className="border-b">
                            <td className="py-3">Employee Turnover (%)</td>
                            <td className="text-right py-3">
                              {getPerformanceIndicator(
                                "employeeTurnover",
                                companyMetrics.social.employeeTurnover,
                                benchmarkData.social.employeeTurnover.industry,
                                false,
                              )}
                            </td>
                            <td className="text-right py-3">
                              {benchmarkData.social.employeeTurnover.industry}%
                            </td>
                            <td className="text-right py-3">
                              {benchmarkData.social.employeeTurnover.leaders}%
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3">Diversity Score (%)</td>
                            <td className="text-right py-3">
                              {getPerformanceIndicator(
                                "diversityScore",
                                companyMetrics.social.diversityScore,
                                benchmarkData.social.diversityScore.industry,
                                true,
                              )}
                            </td>
                            <td className="text-right py-3">
                              {benchmarkData.social.diversityScore.industry}%
                            </td>
                            <td className="text-right py-3">
                              {benchmarkData.social.diversityScore.leaders}%
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3">
                              Training Hours (per employee/year)
                            </td>
                            <td className="text-right py-3">
                              {getPerformanceIndicator(
                                "trainingHours",
                                companyMetrics.social.trainingHours,
                                benchmarkData.social.trainingHours.industry,
                                true,
                              )}
                            </td>
                            <td className="text-right py-3">
                              {benchmarkData.social.trainingHours.industry}
                            </td>
                            <td className="text-right py-3">
                              {benchmarkData.social.trainingHours.leaders}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3">
                              Health & Safety Incidents (per 100 employees)
                            </td>
                            <td className="text-right py-3">
                              {getPerformanceIndicator(
                                "healthSafetyIncidents",
                                companyMetrics.social.healthSafetyIncidents,
                                benchmarkData.social.healthSafetyIncidents
                                  .industry,
                                false,
                              )}
                            </td>
                            <td className="text-right py-3">
                              {
                                benchmarkData.social.healthSafetyIncidents
                                  .industry
                              }
                            </td>
                            <td className="text-right py-3">
                              {
                                benchmarkData.social.healthSafetyIncidents
                                  .leaders
                              }
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3">
                              Community Investment (% of revenue)
                            </td>
                            <td className="text-right py-3">
                              {getPerformanceIndicator(
                                "communityInvestment",
                                companyMetrics.social.communityInvestment,
                                benchmarkData.social.communityInvestment
                                  .industry,
                                true,
                              )}
                            </td>
                            <td className="text-right py-3">
                              {
                                benchmarkData.social.communityInvestment
                                  .industry
                              }
                              %
                            </td>
                            <td className="text-right py-3">
                              {benchmarkData.social.communityInvestment.leaders}
                              %
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="governance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Governance Performance</CardTitle>
                <CardDescription>
                  Detailed comparison of governance metrics against industry
                  benchmarks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 font-medium">Metric</th>
                        <th className="text-right py-3 font-medium">
                          Your Company
                        </th>
                        <th className="text-right py-3 font-medium">
                          Industry Avg
                        </th>
                        <th className="text-right py-3 font-medium">
                          Industry Leaders
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {benchmarkData && (
                        <>
                          <tr className="border-b">
                            <td className="py-3">Board Diversity (%)</td>
                            <td className="text-right py-3">
                              {getPerformanceIndicator(
                                "boardDiversity",
                                companyMetrics.governance.boardDiversity,
                                benchmarkData.governance.boardDiversity
                                  .industry,
                                true,
                              )}
                            </td>
                            <td className="text-right py-3">
                              {benchmarkData.governance.boardDiversity.industry}
                              %
                            </td>
                            <td className="text-right py-3">
                              {benchmarkData.governance.boardDiversity.leaders}%
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3">Ethics Violations (count)</td>
                            <td className="text-right py-3">
                              {getPerformanceIndicator(
                                "ethicsViolations",
                                companyMetrics.governance.ethicsViolations,
                                benchmarkData.governance.ethicsViolations
                                  .industry,
                                false,
                              )}
                            </td>
                            <td className="text-right py-3">
                              {
                                benchmarkData.governance.ethicsViolations
                                  .industry
                              }
                            </td>
                            <td className="text-right py-3">
                              {
                                benchmarkData.governance.ethicsViolations
                                  .leaders
                              }
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3">Data Breaches (count)</td>
                            <td className="text-right py-3">
                              {getPerformanceIndicator(
                                "dataBreaches",
                                companyMetrics.governance.dataBreaches,
                                benchmarkData.governance.dataBreaches.industry,
                                false,
                              )}
                            </td>
                            <td className="text-right py-3">
                              {benchmarkData.governance.dataBreaches.industry}
                            </td>
                            <td className="text-right py-3">
                              {benchmarkData.governance.dataBreaches.leaders}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3">Transparency Score (%)</td>
                            <td className="text-right py-3">
                              {getPerformanceIndicator(
                                "transparencyScore",
                                companyMetrics.governance.transparencyScore,
                                benchmarkData.governance.transparencyScore
                                  .industry,
                                true,
                              )}
                            </td>
                            <td className="text-right py-3">
                              {
                                benchmarkData.governance.transparencyScore
                                  .industry
                              }
                              %
                            </td>
                            <td className="text-right py-3">
                              {
                                benchmarkData.governance.transparencyScore
                                  .leaders
                              }
                              %
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3">Supplier Compliance (%)</td>
                            <td className="text-right py-3">
                              {getPerformanceIndicator(
                                "supplierCompliance",
                                companyMetrics.governance.supplierCompliance,
                                benchmarkData.governance.supplierCompliance
                                  .industry,
                                true,
                              )}
                            </td>
                            <td className="text-right py-3">
                              {
                                benchmarkData.governance.supplierCompliance
                                  .industry
                              }
                              %
                            </td>
                            <td className="text-right py-3">
                              {
                                benchmarkData.governance.supplierCompliance
                                  .leaders
                              }
                              %
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default ComparativeAnalysis;
