import React, { useState, useEffect /*, useMemo, useCallback*/ } from "react";
// import { supabase } from "@/lib/supabase"; // Commented out unused import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Loader2,
  Search,
  Download,
  // Filter, // Commented out unused import
  Plus,
  FileText,
  BarChart3,
  Calendar,
  Edit,
  Trash2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getUserESGDataPoints,
  searchESGDataPoints,
  deleteESGDataPoint,
  ESGDataPoint,
} from "@/lib/esg-data-services";
import { exportToExcel } from "@/components/ExportUtils";
import ESGMetricForm from "./ESGMetricForm";
import ESGMetricChart from "./ESGMetricChart";
import ESGHistoricalAnalysis from "./ESGHistoricalAnalysis";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ESGMetricDashboardProps {
  resourceId?: string;
  _metricId?: string; // Prefixed unused prop
  _onSelectMetric?: (metricId: string) => void; // Prefixed if truly unused but part of interface
}

const ESGMetricDashboard: React.FC<ESGMetricDashboardProps> = ({
  resourceId,
  _metricId, // Use prefixed prop
  _onSelectMetric, // Use prefixed prop
}) => {
  const [metrics, setMetrics] = useState<ESGDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [frameworkFilter, setFrameworkFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [isAddMetricOpen, setIsAddMetricOpen] = useState(false);
  const [isEditMetricOpen, setIsEditMetricOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<ESGDataPoint | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("table-view");
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    loadMetrics();
  }, [resourceId]);

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const allMetrics = await getUserESGDataPoints();

      // Flatten metrics from all resources
      const flattenedMetrics: ESGDataPoint[] = [];
      Object.values(allMetrics).forEach((resourceMetrics) => {
        flattenedMetrics.push(...resourceMetrics);
      });

      setMetrics(flattenedMetrics);

      // Extract all available years from metrics and historical data
      const years = new Set<string>();
      flattenedMetrics.forEach((metric) => {
        if (metric.reporting_year) {
          years.add(metric.reporting_year);
        }
        if (metric.historical_data && metric.historical_data.length > 0) {
          metric.historical_data.forEach((hd) => {
            if (hd.year) years.add(hd.year);
          });
        }
      });

      setAvailableYears(Array.from(years).sort((a, b) => b.localeCompare(a)));
    } catch (err) {
      console.error("Error loading ESG metrics:", err);
      setError("Failed to load ESG metrics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      loadMetrics();
      return;
    }

    setLoading(true);
    try {
      const results = await searchESGDataPoints(searchQuery);
      setMetrics(results.data);
    } catch (err) {
      console.error("Error searching ESG metrics:", err);
      setError("Failed to search ESG metrics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMetric = (newMetric: ESGDataPoint) => {
    setMetrics([newMetric, ...metrics]);
    setIsAddMetricOpen(false);
  };

  const handleEditMetric = (updatedMetric: ESGDataPoint) => {
    setMetrics(
      metrics.map((m) => (m.id === updatedMetric.id ? updatedMetric : m)),
    );
    setIsEditMetricOpen(false);
    setSelectedMetric(null);

    // Update available years if a new year is added
    const allYears = new Set(availableYears);

    // Add reporting year if it's new
    if (updatedMetric.reporting_year) {
      allYears.add(updatedMetric.reporting_year);
    }

    // Add historical years if they're new
    if (
      updatedMetric.historical_data &&
      updatedMetric.historical_data.length > 0
    ) {
      updatedMetric.historical_data.forEach((hd) => {
        if (hd.year) allYears.add(hd.year);
      });
    }

    // Update available years if changed
    if (allYears.size !== availableYears.length) {
      setAvailableYears(
        Array.from(allYears).sort((a, b) => b.localeCompare(a)),
      );
    }
  };

  const handleDeleteMetric = async () => {
    if (!selectedMetric || !selectedMetric.id) return;

    try {
      const success = await deleteESGDataPoint(selectedMetric.id);
      if (success) {
        setMetrics(metrics.filter((m) => m.id !== selectedMetric.id));
        setIsDeleteDialogOpen(false);
        setSelectedMetric(null);
      } else {
        throw new Error("Failed to delete metric");
      }
    } catch (err) {
      console.error("Error deleting metric:", err);
      setError("Failed to delete metric. Please try again.");
    }
  };

  const handleExportData = () => {
    // Prepare data for export
    const exportData = metrics.map((metric) => ({
      Metric: getMetricLabel(metric.metric_id),
      Value: metric.value,
      "Reporting Year": metric.reporting_year || new Date().getFullYear(),
      Framework: metric.framework_id || "",
      "Disclosure ID": metric.disclosure_id || "",
      Source: metric.source || "",
      Context: metric.context || "",
      "Last Updated": metric.updated_at
        ? new Date(metric.updated_at).toLocaleDateString()
        : "",
    }));

    // Add historical data as separate rows
    metrics.forEach((metric) => {
      if (metric.historical_data && metric.historical_data.length > 0) {
        metric.historical_data.forEach((hd) => {
          exportData.push({
            Metric: getMetricLabel(metric.metric_id),
            Value: hd.value,
            "Reporting Year": hd.year,
            Framework: metric.framework_id || "",
            "Disclosure ID": metric.disclosure_id || "",
            Source: hd.source || "",
            Context: "Historical data",
            "Last Updated": "",
          });
        });
      }
    });

    // Export to Excel
    exportToExcel(exportData, "esg-metrics-export.xlsx");
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

  const getFrameworkColor = (frameworkId: string) => {
    switch (frameworkId) {
      case "GRI":
        return "bg-blue-100 text-blue-800";
      case "SASB":
        return "bg-green-100 text-green-800";
      case "TCFD":
        return "bg-purple-100 text-purple-800";
      case "CDP":
        return "bg-amber-100 text-amber-800";
      case "SDG":
        return "bg-cyan-100 text-cyan-800";
      case "IIRC":
        return "bg-indigo-100 text-indigo-800";
      case "CSRD":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter metrics based on search, framework, and year
  const filteredMetrics = metrics.filter((metric) => {
    const matchesFramework =
      frameworkFilter === "all" || metric.framework_id === frameworkFilter;

    const matchesYear =
      yearFilter === "all" ||
      metric.reporting_year === yearFilter ||
      (metric.historical_data &&
        metric.historical_data.some((hd) => hd.year === yearFilter));

    return matchesFramework && matchesYear;
  });

  // Group metrics by type for the chart view
  const metricsByType = filteredMetrics.reduce(
    (acc, metric) => {
      const type = metric.metric_id;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(metric);
      return acc;
    },
    {} as Record<string, ESGDataPoint[]>,
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>ESG Metrics Dashboard</span>
          <div className="flex gap-2">
            <Dialog open={isAddMetricOpen} onOpenChange={setIsAddMetricOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-1" /> Add Metric
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Add ESG Metric</DialogTitle>
                </DialogHeader>
                <ESGMetricForm
                  resourceId="default"
                  onSave={handleAddMetric}
                  onCancel={() => setIsAddMetricOpen(false)}
                />
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-1" /> Export Data
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search metrics..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              <Search className="h-4 w-4 mr-1" /> Search
            </Button>
            <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frameworks</SelectItem>
                <SelectItem value="GRI">GRI</SelectItem>
                <SelectItem value="SASB">SASB</SelectItem>
                <SelectItem value="TCFD">TCFD</SelectItem>
                <SelectItem value="CDP">CDP</SelectItem>
                <SelectItem value="SDG">SDG</SelectItem>
                <SelectItem value="IIRC">IIRC</SelectItem>
                <SelectItem value="CSRD">CSRD</SelectItem>
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="table-view">
              <FileText className="h-4 w-4 mr-1" /> Table View
            </TabsTrigger>
            <TabsTrigger value="chart-view">
              <BarChart3 className="h-4 w-4 mr-1" /> Chart View
            </TabsTrigger>
            <TabsTrigger value="historical-view">
              <Calendar className="h-4 w-4 mr-1" /> Historical Data
            </TabsTrigger>
            <TabsTrigger value="analysis-view">
              <TrendingUp className="h-4 w-4 mr-1" /> Trend Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table-view">
            {filteredMetrics.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Framework</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMetrics.map((metric) => (
                    <TableRow key={metric.id}>
                      <TableCell className="font-medium">
                        {getMetricLabel(metric.metric_id)}
                        {metric.context && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {metric.context}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{metric.value}</TableCell>
                      <TableCell>{metric.reporting_year}</TableCell>
                      <TableCell>
                        {metric.framework_id && (
                          <Badge
                            variant="outline"
                            className={getFrameworkColor(metric.framework_id)}
                          >
                            {metric.framework_id}
                            {metric.disclosure_id && ` ${metric.disclosure_id}`}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{metric.source}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedMetric(metric);
                              setIsEditMetricOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedMetric(metric);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No ESG metrics found. Add your first metric to get started.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chart-view">
            {Object.keys(metricsByType).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(metricsByType).map(([metricType, metrics]) => (
                  <div key={metricType} className="border rounded-md p-4">
                    <h3 className="font-medium text-lg mb-4">
                      {getMetricLabel(metricType)}
                    </h3>
                    <div className="h-64">
                      <ESGMetricChart metrics={metrics} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No metrics available for charting. Add metrics to see charts.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="historical-view">
            {filteredMetrics.some(
              (m) => m.historical_data && m.historical_data.length > 0,
            ) ? (
              <div className="space-y-6">
                {filteredMetrics
                  .filter(
                    (m) => m.historical_data && m.historical_data.length > 0,
                  )
                  .map((metric) => (
                    <div key={metric.id} className="border rounded-md p-4">
                      <h3 className="font-medium text-lg mb-2">
                        {getMetricLabel(metric.metric_id)}
                        {metric.framework_id && (
                          <Badge
                            variant="outline"
                            className={`ml-2 ${getFrameworkColor(
                              metric.framework_id,
                            )}`}
                          >
                            {metric.framework_id}
                            {metric.disclosure_id && ` ${metric.disclosure_id}`}
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Current value: {metric.value} ({metric.reporting_year})
                      </p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Year</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Source</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(metric.historical_data || [])
                            .sort((a, b) => b.year.localeCompare(a.year))
                            .map((hd, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{hd.year}</TableCell>
                                <TableCell>{hd.value}</TableCell>
                                <TableCell>{hd.source}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No historical data available. Add historical data to your
                  metrics to see them here.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analysis-view">
            {filteredMetrics.some(
              (m) => m.historical_data && m.historical_data.length > 1,
            ) ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredMetrics
                  .filter(
                    (m) => m.historical_data && m.historical_data.length > 1,
                  )
                  .map((metric) => (
                    <ESGHistoricalAnalysis key={metric.id} metric={metric} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Insufficient historical data for analysis. Add at least two
                  historical data points to your metrics to enable trend
                  analysis.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Metric Dialog */}
        <Dialog open={isEditMetricOpen} onOpenChange={setIsEditMetricOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit ESG Metric</DialogTitle>
            </DialogHeader>
            {selectedMetric && (
              <ESGMetricForm
                resourceId={selectedMetric.resource_id}
                initialData={selectedMetric}
                onSave={handleEditMetric}
                onCancel={() => {
                  setIsEditMetricOpen(false);
                  setSelectedMetric(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                metric
                {selectedMetric &&
                  ` "${getMetricLabel(selectedMetric.metric_id)}"`}{" "}
                and all its historical data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedMetric(null);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteMetric}
                className="bg-red-500 hover:bg-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default ESGMetricDashboard;
