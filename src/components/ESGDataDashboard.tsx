import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Loader2,
  Search,
  Download,
  Filter,
  Plus,
  FileText,
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
  getFrameworkMappings,
  saveESGDataPoint,
  ESGDataPoint,
} from "@/lib/esg-data-services";
import ResourceAnalyzer from "./ResourceAnalyzer";
import { exportToExcel } from "@/components/ExportUtils";
import ESGDataVisualization from "./ESGDataVisualization";
import ESGDataInsights from "./ESGDataInsights";
import ESGMetricDashboard from "./ESGMetricDashboard";

interface ESGDataDashboardProps {
  onSelectResource?: (resourceId: string) => void;
}

const ESGDataDashboard: React.FC<ESGDataDashboardProps> = ({
  onSelectResource,
}) => {
  const [dataByResource, setDataByResource] = useState<Record<string, any[]>>(
    {},
  );
  const [frameworkMappings, setFrameworkMappings] = useState<
    Record<string, any[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("by-resource");
  const [extractedDataPoints, setExtractedDataPoints] = useState<
    Record<string, any>
  >({});
  const [isExtractDialogOpen, setIsExtractDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [frameworkFilter, setFrameworkFilter] = useState("all");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const handleDataExtracted = (dataPoints: Record<string, any>) => {
    setExtractedDataPoints(dataPoints);
    setIsExtractDialogOpen(false);
    setActiveTab("extracted-data");
  };

  const handleAddExtractedDataPoint = async (
    metricId: string,
    dataPoint: any,
  ) => {
    try {
      // Get the first resource ID (this is a simplification - in a real app you'd select the right resource)
      const resourceKeys = Object.keys(dataByResource);
      if (resourceKeys.length === 0) {
        setError(
          "No resources available to add data to. Please add a resource first.",
        );
        return;
      }

      const resourceName = resourceKeys[0];
      const resourceDataPoints = dataByResource[resourceName];
      if (!resourceDataPoints || resourceDataPoints.length === 0) {
        setError("No data points available for the selected resource.");
        return;
      }

      const resourceId = resourceDataPoints[0].resource_id;

      // Create a new data point with current year as reporting year
      const currentYear = new Date().getFullYear().toString();
      const newDataPoint: ESGDataPoint = {
        resource_id: resourceId,
        metric_id: metricId,
        value: dataPoint.value,
        context: dataPoint.context || "",
        confidence: dataPoint.confidence || 0.8,
        source: dataPoint.source || "Extracted data",
        framework_id: dataPoint.frameworkId,
        disclosure_id: dataPoint.disclosureId,
        reporting_year: currentYear,
      };

      await saveESGDataPoint(newDataPoint);

      // Remove from extracted data points
      const updatedExtractedDataPoints = { ...extractedDataPoints };
      delete updatedExtractedDataPoints[metricId];
      setExtractedDataPoints(updatedExtractedDataPoints);

      // Show success message
      const successMessage = `Successfully added ${metricId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} metric to your dashboard`;
      alert(successMessage);

      // Reload data to show the newly added data point
      await loadData();
    } catch (err) {
      console.error("Error adding extracted data point:", err);
      setError("Failed to add extracted data point. Please try again.");
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all ESG data points grouped by resource
      const dataPoints = await getUserESGDataPoints();
      setDataByResource(dataPoints);

      // Get framework mappings
      const frameworks = ["GRI", "SASB", "TCFD", "CDP", "SDG"];
      const mappings: Record<string, any[]> = {};
      for (const framework of frameworks) {
        const frameworkMappings = await getFrameworkMappings(framework);
        if (frameworkMappings.length > 0) {
          mappings[framework] = frameworkMappings;
        }
      }
      setFrameworkMappings(mappings);
    } catch (err) {
      console.error("Error loading ESG data:", err);
      setError("Failed to load ESG data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;

    try {
      const results = await searchESGDataPoints(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error("Error searching ESG data:", err);
      setError("Failed to search ESG data. Please try again.");
    }
  };

  const handleExportData = () => {
    // Prepare data for export
    const exportData = [];

    // Add all data points
    for (const [resourceName, dataPoints] of Object.entries(dataByResource)) {
      for (const dataPoint of dataPoints) {
        exportData.push({
          Resource: resourceName,
          Metric: getMetricLabel(dataPoint.metric_id),
          Value: dataPoint.value,
          Framework: dataPoint.framework_id || "",
          Disclosure: dataPoint.disclosure_id || "",
          Source: dataPoint.source || "",
          Confidence: dataPoint.confidence || "",
          "Last Updated": dataPoint.updated_at
            ? new Date(dataPoint.updated_at).toLocaleDateString()
            : "",
        });
      }
    }

    // Export to Excel
    exportToExcel(exportData, "esg-data-export.xlsx", "ESG Data");
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
          <span>ESG Data Dashboard</span>
          <div className="flex gap-2">
            <Dialog
              open={isExtractDialogOpen}
              onOpenChange={setIsExtractDialogOpen}
            >
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <FileText className="h-4 w-4 mr-1" /> Extract Data
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Extract ESG Data</DialogTitle>
                </DialogHeader>
                <ResourceAnalyzer onDataExtracted={handleDataExtracted} />
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-1" /> Export Data
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ESG data..."
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
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="by-resource">By Resource</TabsTrigger>
            <TabsTrigger value="by-framework">By Framework</TabsTrigger>
            <TabsTrigger value="search-results">
              Search Results
              {searchResults.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {searchResults.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="extracted-data">
              Extracted Data
              {Object.keys(extractedDataPoints).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {Object.keys(extractedDataPoints).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="metrics-dashboard">
              Metrics Dashboard
            </TabsTrigger>
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
          </TabsList>

          <TabsContent value="by-resource">
            {Object.keys(dataByResource).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(dataByResource).map(
                  ([resourceName, dataPoints]) => (
                    <div key={resourceName} className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-lg">{resourceName}</h3>
                        {onSelectResource && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Find resource ID from the first data point
                              if (dataPoints.length > 0) {
                                onSelectResource(dataPoints[0].resource_id);
                              }
                            }}
                          >
                            View Resource
                          </Button>
                        )}
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Metric</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Framework</TableHead>
                            <TableHead>Source</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dataPoints
                            .filter(
                              (dp) =>
                                frameworkFilter === "all" ||
                                dp.framework_id === frameworkFilter,
                            )
                            .map((dataPoint) => (
                              <TableRow key={dataPoint.id}>
                                <TableCell className="font-medium">
                                  {getMetricLabel(dataPoint.metric_id)}
                                </TableCell>
                                <TableCell>{dataPoint.value}</TableCell>
                                <TableCell>
                                  {dataPoint.framework_id &&
                                    dataPoint.disclosure_id && (
                                      <Badge
                                        variant="outline"
                                        className={
                                          dataPoint.framework_id
                                            ? getFrameworkColor(
                                                dataPoint.framework_id,
                                              )
                                            : ""
                                        }
                                      >
                                        {dataPoint.framework_id}{" "}
                                        {dataPoint.disclosure_id}
                                      </Badge>
                                    )}
                                </TableCell>
                                <TableCell>{dataPoint.source}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No ESG data points found. Try analyzing some resources first.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="by-framework">
            {Object.keys(frameworkMappings).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(frameworkMappings)
                  .filter(
                    ([framework]) =>
                      frameworkFilter === "all" ||
                      framework === frameworkFilter,
                  )
                  .map(([framework, mappings]) => (
                    <div key={framework} className="border rounded-md p-4">
                      <h3 className="font-medium text-lg mb-4">
                        <Badge className={getFrameworkColor(framework)}>
                          {framework}
                        </Badge>
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Disclosure</TableHead>
                            <TableHead>Resource</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mappings.map((mapping) => (
                            <TableRow key={mapping.id}>
                              <TableCell className="font-medium">
                                {mapping.disclosure_id}
                              </TableCell>
                              <TableCell>
                                {mapping.resource_id}
                                {onSelectResource && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2"
                                    onClick={() =>
                                      onSelectResource(mapping.resource_id)
                                    }
                                  >
                                    View
                                  </Button>
                                )}
                              </TableCell>
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
                  No framework mappings found. Try analyzing some resources
                  first.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="search-results">
            {searchResults.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Framework</TableHead>
                    <TableHead>Resource</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((dataPoint) => (
                    <TableRow key={dataPoint.id}>
                      <TableCell className="font-medium">
                        {getMetricLabel(dataPoint.metric_id)}
                      </TableCell>
                      <TableCell>{dataPoint.value}</TableCell>
                      <TableCell>
                        {dataPoint.framework_id && dataPoint.disclosure_id && (
                          <Badge
                            variant="outline"
                            className={
                              dataPoint.framework_id
                                ? getFrameworkColor(dataPoint.framework_id)
                                : ""
                            }
                          >
                            {dataPoint.framework_id} {dataPoint.disclosure_id}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {dataPoint.resource_id}
                        {onSelectResource && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2"
                            onClick={() =>
                              onSelectResource(dataPoint.resource_id)
                            }
                          >
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : searchQuery ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No results found for "{searchQuery}". Try a different search
                  term.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Enter a search term to find ESG data points.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="extracted-data">
            {Object.keys(extractedDataPoints).length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    Recently Extracted ESG Data
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    Click "Add to Dashboard" to incorporate data points into
                    your ESG dashboard
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(extractedDataPoints).map(
                    ([metricId, dataPoint]: [string, any]) => (
                      <div
                        key={metricId}
                        className="border rounded-md p-4 flex justify-between items-start"
                      >
                        <div>
                          <h4 className="font-medium">
                            {getMetricLabel(metricId)}
                          </h4>
                          <div className="mt-1 text-lg">{dataPoint.value}</div>
                          {dataPoint.frameworkId && dataPoint.disclosureId && (
                            <Badge variant="outline" className="mt-2">
                              {dataPoint.frameworkId} {dataPoint.disclosureId}
                            </Badge>
                          )}
                          <div className="mt-2 text-sm text-muted-foreground">
                            Source: {dataPoint.source || "Extracted data"}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleAddExtractedDataPoint(metricId, dataPoint)
                          }
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add to Dashboard
                        </Button>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No extracted data points available. Click "Extract Data" to
                  analyze a document or URL.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="metrics-dashboard">
            <ESGMetricDashboard />
          </TabsContent>

          <TabsContent value="visualization">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ESGDataVisualization />
              <ESGDataInsights className="h-full" />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ESGDataDashboard;
