import React, { useState, useEffect, lazy, Suspense, memo, useCallback } from "react";
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
  Plus,
  FileText,
  ChevronLeft,
  ChevronRight,
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
  // getUserESGDataPoints, // Commented out as unused
  searchESGDataPoints,
  // getFrameworkMappings, // Commented out as unused
  saveESGDataPoint,
  ESGDataPoint,
  getESGDataPoints,
  getFrameworks,
  PaginationParams
} from "@/lib/esg-data-services";
import ResourceAnalyzer from "./ResourceAnalyzer";
import { exportToExcel } from "@/components/ExportUtils";
import ESGDataVisualization from "./ESGDataVisualization";
import ESGDataInsights from "./ESGDataInsights";
import ESGMetricDashboard from "./ESGMetricDashboard";
import { Label } from "@/components/ui/label";

// Define specific types for data structures
interface ResourceItemFromDB {
  id: string;
  title: string;
  // Add all other fields expected from the 'resources' table
  // Example:
  description?: string;
  type?: string;
  category?: string;
  file_type?: string;
  url?: string;
  date_added?: string;
  user_id?: string;
}

interface ExtractedDataPoint {
  value: string | number;
  context?: string;
  confidence?: number;
  source?: string;
  frameworkId?: string;
  disclosureId?: string;
  // Any other fields specific to extracted points
}

interface ESGFrameworkMappingFromDB {
  id: string; // Assuming mappings have an id
  framework_id: string;
  disclosure_id: string;
  // any other fields from esg_framework_mappings table
}

interface ESGDataDashboardProps {
  onSelectResource?: (resourceId: string) => void;
}

const ESGDataDashboard: React.FC<ESGDataDashboardProps> = ({
  onSelectResource,
}) => {
  const [dataByResource, setDataByResource] = useState<Record<string, ESGDataPoint[]>>({});
  const [frameworkMappingsByResource, setFrameworkMappingsByResource] = useState<Record<string, Record<string, ESGFrameworkMappingFromDB[]>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("by-resource");
  const [extractedDataPoints, setExtractedDataPoints] = useState<
    Record<string, ExtractedDataPoint>
  >({});
  const [isExtractDialogOpen, setIsExtractDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [frameworkFilter, setFrameworkFilter] = useState("all");
  const [searchResults, setSearchResults] = useState<ESGDataPoint[]>([]);
  const [searchPagination, setSearchPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 20 });
  const [totalPages, setTotalPages] = useState(1);
  const [resources, setResources] = useState<ResourceItemFromDB[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [frameworkList, setFrameworkList] = useState<{ id: string; name: string }[]>([]);

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error("User not authenticated");

      const { data: resourcesData, error: resourcesError } = await supabase
        .from("resources")
        .select("id, title")
        .eq("user_id", userId);

      if (resourcesError) throw resourcesError;
      setResources(resourcesData || []);
      if (resourcesData && resourcesData.length > 0) {
        if (!selectedResourceId) {
             setSelectedResourceId(resourcesData[0].id);
        }
      } else {
        setLoading(false);
        setDataByResource({}); // Clear data if no resources
        setFrameworkMappingsByResource({});
      }
    } catch (err) {
      console.error("Error loading resources:", err);
      setError("Failed to load resources. Please try again.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  useEffect(() => {
    const fetchFrameworks = async () => {
      try {
        const list = await getFrameworks();
        setFrameworkList(list);
      } catch (e) {
        console.error("Error loading frameworks:", e);
      }
    };
    fetchFrameworks();
  }, []);

  const loadResourceDataAndMappings = useCallback(async (resourceId: string) => {
    setLoading(true);
    setError(null);

    const resourceCacheKey = `resourceMappingsCache_${resourceId}`;
    const CACHE_DURATION_MS_RESOURCE = 1000 * 60 * 30; // 30 minutes cache for specific resource mappings

    try {
      const dpResponse = await getESGDataPoints(resourceId, { page: pagination.page, pageSize: pagination.pageSize });
      const resource = resources.find(r => r.id === resourceId);
      const resourceTitle = resource ? resource.title : "Unknown Resource";
      setDataByResource({ [resourceTitle]: dpResponse.data });
      setTotalPages(dpResponse.totalPages);

      let currentResourceMappings: Record<string, ESGFrameworkMappingFromDB[]> = {};
      try {
        const cached = localStorage.getItem(resourceCacheKey);
        if (cached) {
          const { timestamp, data: cachedData } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION_MS_RESOURCE) {
            currentResourceMappings = cachedData;
          } else {
            localStorage.removeItem(resourceCacheKey); // Expired
          }
        }
      } catch (e) { console.error("Error reading resource mappings cache", e); localStorage.removeItem(resourceCacheKey);}

      if (Object.keys(currentResourceMappings).length === 0) { // Not in cache or expired
        const { data: mappingsData, error: mappingsError } = await supabase
          .from("esg_framework_mappings")
          .select("*")
          .eq("resource_id", resourceId);
        
        if (mappingsError) throw mappingsError;

        const organizedMappings: Record<string, ESGFrameworkMappingFromDB[]> = {};
        const frameworks = frameworkList.length > 0
          ? frameworkList.map((f) => f.name)
          : ["GRI", "SASB", "TCFD", "CDP", "SDG"];
        frameworks.forEach((framework) => {
          const frameworkSpecificMappings = mappingsData?.filter(
            (mapping: any): mapping is ESGFrameworkMappingFromDB => mapping.framework_id === framework // Use 'any' and a type guard
          );
          if (frameworkSpecificMappings?.length > 0) {
            organizedMappings[framework] = frameworkSpecificMappings;
          }
        });
        currentResourceMappings = organizedMappings;
        try {
            localStorage.setItem(resourceCacheKey, JSON.stringify({ timestamp: Date.now(), data: currentResourceMappings }));
        } catch (e) { console.error("Error saving resource mappings to cache", e); }
      }
      
      setFrameworkMappingsByResource(prev => ({ ...prev, [resourceId]: currentResourceMappings }));

    } catch (err) {
      console.error(`Error loading data for resource ${resourceId}:`, err);
      setError("Failed to load ESG data or mappings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pagination, resources]);

  useEffect(() => {
    if (selectedResourceId) {
      loadResourceDataAndMappings(selectedResourceId);
    }
  }, [selectedResourceId, loadResourceDataAndMappings, pagination]);

  const handleDataExtracted = (dataPoints: Record<string, ExtractedDataPoint>) => {
    setExtractedDataPoints(dataPoints);
    setIsExtractDialogOpen(false);
    setActiveTab("extracted-data");
  };

  const handleAddExtractedDataPoint = async (
    metricId: string,
    dataPoint: ExtractedDataPoint,
  ) => {
    try {
      // Get the first resource ID or the selected resource
      if (!selectedResourceId && resources.length === 0) {
        setError(
          "No resources available to add data to. Please add a resource first.",
        );
        return;
      }

      const resourceId = selectedResourceId || resources[0].id;

      // Create a new data point with current year as reporting year
      const currentYear = new Date().getFullYear().toString();
      const newDataPoint: ESGDataPoint = {
        resource_id: resourceId,
        metric_id: metricId,
        value: String(dataPoint.value),
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

      // Reload data
      if (selectedResourceId) {
        loadResourceDataAndMappings(selectedResourceId);
      }
    } catch (err) {
      console.error("Error adding extracted data point:", err);
      setError("Failed to add extracted data point. Please try again.");
    }
  };

  const handleSearch = useCallback(async (newPage?: number) => {
    if (!searchQuery) {
      setSearchResults([]);
      setSearchTotalPages(1);
      return;
    }
    setIsSearching(true);
    setError(null);

    const currentPage = newPage || searchPagination.page;

    try {
      const response = await searchESGDataPoints(
        searchQuery,
        { page: currentPage, pageSize: searchPagination.pageSize },
        { frameworkId: frameworkFilter !== "all" ? frameworkFilter : undefined }
      );
      setSearchResults(response.data);
      setSearchTotalPages(response.totalPages);
      setSearchPagination(prev => ({ ...prev, page: currentPage }));
      setActiveTab("search-results");
    } catch (err) {
      console.error("Error searching ESG data:", err);
      setError("Failed to search ESG data. Please try again.");
      setSearchResults([]);
      setSearchTotalPages(1);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, searchPagination]);
  
  const handleSearchPageChange = (newPage: number) => {
    handleSearch(newPage);
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
    exportToExcel(exportData, "esg-data-export.xlsx");
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleResourceSelect = (resourceId: string) => {
    setSelectedResourceId(resourceId);
    // Reset pagination when changing resources
    setPagination({ page: 1, pageSize: pagination.pageSize });
    
    if (onSelectResource) {
      onSelectResource(resourceId);
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    return (
      <div className="flex items-center justify-between mt-4">
        <Button 
          variant="outline" 
          size="sm"
          disabled={(pagination.page || 1) <= 1}
          onClick={() => handlePageChange((pagination.page || 1) - 1)}
          aria-label="Go to previous page of resource data"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <span className="text-sm">
          Page {pagination.page || 1} of {totalPages}
        </span>
        <Button 
          variant="outline" 
          size="sm"
          disabled={(pagination.page || 1) >= totalPages}
          onClick={() => handlePageChange((pagination.page || 1) + 1)}
          aria-label="Go to next page of resource data"
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  };

  // Render pagination controls for search results
  const renderSearchPagination = () => {
    if (searchResults.length === 0 && !isSearching) return null;
    return (
      <div className="flex items-center justify-between mt-4">
        <Button 
          variant="outline" 
          size="sm"
          disabled={(searchPagination.page || 1) <= 1 || isSearching}
          onClick={() => handleSearchPageChange((searchPagination.page || 1) - 1)}
          aria-label="Go to previous page of search results"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <span className="text-sm">
          Page {searchPagination.page || 1} of {searchTotalPages}
        </span>
        <Button 
          variant="outline" 
          size="sm"
          disabled={(searchPagination.page || 1) >= searchTotalPages || isSearching}
          onClick={() => handleSearchPageChange((searchPagination.page || 1) + 1)}
          aria-label="Go to next page of search results"
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
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

  // Create memoized components
  const MemoizedESGMetricDashboard = memo(ESGMetricDashboard);
  const MemoizedESGDataVisualization = memo(ESGDataVisualization);
  const MemoizedESGDataInsights = memo(ESGDataInsights);

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
              <Label htmlFor="esg-data-search" className="sr-only">Search ESG Data</Label>
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="esg-data-search"
                placeholder="Search ESG data..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                aria-label="Search ESG data by metric, value, context, or source"
              />
            </div>
            <Button variant="outline" onClick={() => handleSearch()} aria-label="Submit search">
              <Search className="h-4 w-4 mr-1" /> Search
            </Button>
            <Label htmlFor="framework-filter-select" className="sr-only">Filter by framework</Label>
            <Select value={frameworkFilter} onValueChange={setFrameworkFilter} >
              <SelectTrigger className="w-[180px]" id="framework-filter-select" aria-label="Filter by framework">
                <SelectValue placeholder="Filter by framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frameworks</SelectItem>
                {(frameworkList.length > 0
                  ? frameworkList
                  : [
                      { id: "GRI", name: "GRI" },
                      { id: "SASB", name: "SASB" },
                      { id: "TCFD", name: "TCFD" },
                      { id: "CDP", name: "CDP" },
                      { id: "SDG", name: "SDG" },
                    ]
                ).map((fw) => (
                  <SelectItem key={fw.id} value={fw.name}>
                    {fw.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resource selector */}
        {resources.length > 0 && (
          <div className="mb-4">
            <Label htmlFor="resource-select">Select Resource to View Data</Label>
            <Select
              value={selectedResourceId || ""}
              onValueChange={handleResourceSelect}
            >
              <SelectTrigger id="resource-select" aria-label="Select a resource to view its data">
                <SelectValue placeholder="Select a resource" />
              </SelectTrigger>
              <SelectContent>
                {resources.map((resource) => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4" aria-label="Dashboard data views">
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
                  ([resourceName, dataPoints]: [string, ESGDataPoint[]]) => (
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
            {selectedResourceId && frameworkMappingsByResource[selectedResourceId] && Object.keys(frameworkMappingsByResource[selectedResourceId]).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(frameworkMappingsByResource[selectedResourceId])
                  .filter(
                    ([frameworkName]) =>
                      frameworkFilter === "all" ||
                      frameworkName === frameworkFilter,
                  )
                  .map(([frameworkName, frameworkSpecificMappings]) => (
                    <div key={frameworkName} className="border rounded-md p-4">
                      <h3 className="font-medium text-lg mb-4">
                        <Badge className={getFrameworkColor(frameworkName)}>
                          {frameworkName}
                        </Badge>
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Disclosure</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(frameworkSpecificMappings || []).map((mapping: ESGFrameworkMappingFromDB) => (
                            <TableRow key={mapping.id}>
                              <TableCell className="font-medium">
                                {mapping.disclosure_id}
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
                  {selectedResourceId ? "No framework mappings found for the selected resource or filter." : "Please select a resource to view framework mappings."}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="search-results">
            {isSearching && (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {!isSearching && searchResults.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Context</TableHead>
                    <TableHead>Source</TableHead>
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
                      <TableCell>{dataPoint.context}</TableCell>
                      <TableCell>{dataPoint.source}</TableCell>
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
                        {/* Attempt to find resource title, fallback to ID */}
                        {resources.find(r => r.id === dataPoint.resource_id)?.title || dataPoint.resource_id}
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
            )}
            {!isSearching && searchResults.length === 0 && searchQuery && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No results found for &quot;{searchQuery}&quot;. Try a different search
                  term.
                </p>
              </div>
            )}
            {!isSearching && searchResults.length === 0 && !searchQuery && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Enter a search term to find ESG data points.
                </p>
              </div>
            )}
            {renderSearchPagination()} {/* Add search pagination controls */}
          </TabsContent>

          <TabsContent value="extracted-data">
            {Object.keys(extractedDataPoints).length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    Recently Extracted ESG Data
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    Click &quot;Add to Dashboard&quot; to incorporate data points into
                    your ESG dashboard
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(extractedDataPoints).map(
                    ([metricId, dataPoint]: [string, ExtractedDataPoint]) => (
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
            {activeTab === "metrics-dashboard" && (
              <Suspense fallback={<div className="h-64 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>}>
                <MemoizedESGMetricDashboard />
              </Suspense>
            )}
          </TabsContent>

          <TabsContent value="visualization">
            {activeTab === "visualization" && (
              <Suspense fallback={<div className="h-64 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MemoizedESGDataVisualization />
                  <MemoizedESGDataInsights className="h-full" />
                </div>
              </Suspense>
            )}
          </TabsContent>
        </Tabs>

        {/* Add pagination at the bottom of your data display */}
        {!loading && Object.keys(dataByResource).length > 0 && renderPagination()}
      </CardContent>
    </Card>
  );
};

export default ESGDataDashboard;
