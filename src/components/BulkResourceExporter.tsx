import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { exportToMultipleSheets, exportToPDFWithWorker } from "./ExportUtils";
import {
  FileDown,
  FileText,
  FileSpreadsheet,
  Loader2,
  Search,
  CheckSquare,
  XSquare,
  ArrowLeft,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  fileType: string;
  url: string;
  dateAdded: string;
  selected?: boolean;
}

// Define types for data coming from DB if they differ from ResourceItem or context types
interface ESGDataPointFromDB {
  metric_id: string;
  value: string | number;
  framework_id?: string | null; // Allow null
  disclosure_id?: string | null; // Allow null
  confidence?: number | null; // Allow null
  // add other fields from your esg_data_points table
}

interface ESGFrameworkMappingFromDB {
  framework_id: string;
  disclosure_id: string;
  // add other fields from your esg_framework_mappings table
}

interface EnrichedResourceItemFromDB { // More specific type for data fetched from Supabase
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string;
  file_type: string | null;
  url: string;
  date_added: string | null;
  source?: string | null;
  dataPoints: ESGDataPointFromDB[];
  frameworkMappings: ESGFrameworkMappingFromDB[];
}

interface BulkResourceExporterProps {
  onExportComplete?: (success: boolean, format: string) => void;
  className?: string;
}

const BulkResourceExporter: React.FC<BulkResourceExporterProps> = ({
  onExportComplete,
  className = "",
}) => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf">("excel");

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from("resources").select("*");

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedResources: ResourceItem[] = data.map((item) => ({
            id: item.id,
            title: item.title || "Untitled Resource",
            description: item.description || "", // Default to empty string if null
            type: item.type || "unknown",
            category: item.category || "unknown",
            fileType: item.file_type || "url",
            url: item.url || "#",
            dateAdded: item.date_added ? new Date(item.date_added).toLocaleDateString() : "N/A", // Handle null date_added
            selected: false,
          }));
          setResources(formattedResources);
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  const toggleResourceSelection = (resourceId: string) => {
    if (selectedResources.includes(resourceId)) {
      setSelectedResources(selectedResources.filter((id) => id !== resourceId));
    } else {
      setSelectedResources([...selectedResources, resourceId]);
    }
  };

  const toggleAllResources = () => {
    if (selectedResources.length === filteredResources.length) {
      setSelectedResources([]);
    } else {
      setSelectedResources(filteredResources.map((resource) => resource.id));
    }
  };

  const handleExport = async () => {
    if (selectedResources.length === 0) return;

    setIsExporting(true);
    setExportError(null);

    try {
      // Fetch full resource data for selected resources
      const selectedResourcesData: EnrichedResourceItemFromDB[] = [];

      for (const resourceId of selectedResources) {
        const { data: resourceData, error: resourceError } = await supabase
          .from("resources")
          .select("*")
          .eq("id", resourceId)
          .single();
        
        if (resourceError) throw resourceError;

        if (resourceData) {
          // Fetch ESG data points for this resource
          const { data: dataPoints, error: dpError } = await supabase
            .from("esg_data_points")
            .select("*")
            .eq("resource_id", resourceId);
          if (dpError) throw dpError;

          // Fetch framework mappings for this resource
          const { data: frameworkMappings, error: fmError } = await supabase
            .from("esg_framework_mappings")
            .select("*")
            .eq("resource_id", resourceId);
          if (fmError) throw fmError;

          selectedResourcesData.push({
            ...(resourceData as EnrichedResourceItemFromDB), // Cast to ensure type compatibility
            dataPoints: dataPoints || [],
            frameworkMappings: frameworkMappings || [],
          });
        }
      }

      let success = false;

      if (exportFormat === "excel") {
        // Prepare data for Excel export
        const excelData: Record<string, Record<string, string | number | null | undefined>[]> = {
          resources: selectedResourcesData.map((resource) => ({
            Title: resource.title,
            Description: resource.description, // Already string | null
            Category: resource.category,
            Type: resource.type,
            URL: resource.url,
            Source: resource.source, // Already string | null | undefined
            DateAdded: resource.date_added, // Already string | null
          })),
        };

        // Add data points sheet
        const allDataPoints = selectedResourcesData.flatMap((resource) =>
          resource.dataPoints.map((dataPoint) => ({
            ResourceTitle: resource.title,
            MetricID: dataPoint.metric_id,
            Value: dataPoint.value,
            Framework: dataPoint.framework_id || "N/A",
            Disclosure: dataPoint.disclosure_id || "N/A",
            Confidence: dataPoint.confidence ?? "N/A", // Use nullish coalescing for number | null
          })),
        );

        if (allDataPoints.length > 0) {
          excelData.dataPoints = allDataPoints;
        }

        // Add framework mappings sheet
        const allMappings = selectedResourcesData.flatMap((resource) =>
          resource.frameworkMappings.map((mapping) => ({
            ResourceTitle: resource.title,
            Framework: mapping.framework_id,
            Disclosure: mapping.disclosure_id,
          })),
        );

        if (allMappings.length > 0) {
          excelData.frameworkMappings = allMappings;
        }

        // Export to Excel
        success = await exportToMultipleSheets(
          excelData as Record<string, Record<string, string | number | undefined>[]>, // Cast to final expected type by utility
          `ESG_Resources_Export_${new Date().toISOString().split("T")[0]}.xlsx`,
        );
      } else if (exportFormat === "pdf") {
        // For PDF, we'll create a temporary div with the content
        const tempDiv = document.createElement("div");
        tempDiv.id = "pdf-export-container";
        tempDiv.style.padding = "20px";
        tempDiv.style.fontFamily = "Arial, sans-serif";

        // Add title
        const title = document.createElement("h1");
        title.textContent = "ESG Resources Export";
        tempDiv.appendChild(title);

        // Group resources by category
        const resourcesByCategory: Record<string, EnrichedResourceItemFromDB[]> = {};
        selectedResourcesData.forEach((resource) => {
          const category = resource.category || "Uncategorized";
          if (!resourcesByCategory[category]) {
            resourcesByCategory[category] = [];
          }
          resourcesByCategory[category].push(resource); 
        });

        // Create sections for each category
        Object.entries(resourcesByCategory).forEach(
          ([category, categoryResources]: [string, EnrichedResourceItemFromDB[]]) => {
            const categoryHeader = document.createElement("h2");
            categoryHeader.textContent =
              category.charAt(0).toUpperCase() + category.slice(1);
            tempDiv.appendChild(categoryHeader);

            categoryResources.forEach((resource) => {
              const resourceDiv = document.createElement("div");
              resourceDiv.style.marginBottom = "15px";
              resourceDiv.style.padding = "10px";
              resourceDiv.style.border = "1px solid #ddd";

              const resourceTitle = document.createElement("h3");
              resourceTitle.textContent = resource.title;
              resourceDiv.appendChild(resourceTitle);

              const resourceDesc = document.createElement("p");
              resourceDesc.textContent = resource.description || ""; // Handle null description
              resourceDiv.appendChild(resourceDesc);

              const resourceType = document.createElement("p");
              resourceType.innerHTML = `<strong>Type:</strong> ${resource.type}`;
              resourceDiv.appendChild(resourceType);

              const resourceUrl = document.createElement("p");
              resourceUrl.innerHTML = `<strong>URL:</strong> ${resource.url}`;
              resourceDiv.appendChild(resourceUrl);

              // Add data points if available
              if (resource.dataPoints && resource.dataPoints.length > 0) {
                const dataPointsTitle = document.createElement("h4");
                dataPointsTitle.textContent = "ESG Data Points";
                resourceDiv.appendChild(dataPointsTitle);

                const dataPointsList = document.createElement("ul");
                resource.dataPoints.forEach((dataPoint) => {
                  const dataPointItem = document.createElement("li");
                  dataPointItem.textContent = `${dataPoint.metric_id}: ${dataPoint.value} (${dataPoint.framework_id || "N/A"} ${dataPoint.disclosure_id || "N/A"})`;
                  dataPointsList.appendChild(dataPointItem);
                });
                resourceDiv.appendChild(dataPointsList);
              }

              tempDiv.appendChild(resourceDiv);
            });
          },
        );

        // Append to body temporarily (hidden)
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        document.body.appendChild(tempDiv);

        // Export to PDF
        await exportToPDFWithWorker(
          "pdf-export-container",
          `ESG_Resources_Export_${new Date().toISOString().split("T")[0]}.pdf`
        );
        success = true;

        // Remove the temporary div
        document.body.removeChild(tempDiv);
      }

      if (onExportComplete) {
        onExportComplete(success, exportFormat);
      }

      if (success) {
        setExportError(null);
      } else {
        setExportError("Failed to export resources. Please try again.");
      }
    } catch (error) {
      console.error("Error exporting resources:", error);
      setExportError("Failed to export resources. Please try again.");

      if (onExportComplete) {
        onExportComplete(false, exportFormat);
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Filter resources based on search query and filters
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      searchQuery === "" ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || resource.category === categoryFilter;

    const matchesType = typeFilter === "all" || resource.type === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

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

  return (
    <div className={`w-full bg-background p-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/resource-library")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Library
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Bulk Resource Export
              </h1>
              <p className="text-muted-foreground mt-1">
                Select resources to export in bulk as Excel or PDF
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={exportFormat}
              onValueChange={(value) =>
                setExportFormat(value as "excel" | "pdf")
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Export Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel (.xlsx)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF (.pdf)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleExport}
              disabled={isExporting || selectedResources.length === 0}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export {selectedResources.length} Resources
                </>
              )}
            </Button>
          </div>
        </div>

        {exportError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Export Error</AlertTitle>
            <AlertDescription>{exportError}</AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Resource Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="guide">Guides</SelectItem>
                  <SelectItem value="template">Templates</SelectItem>
                  <SelectItem value="framework">Frameworks</SelectItem>
                  <SelectItem value="case-study">Case Studies</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Resources ({filteredResources.length})</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllResources}
                >
                  {selectedResources.length === filteredResources.length &&
                  filteredResources.length > 0 ? (
                    <>
                      <XSquare className="h-4 w-4 mr-2" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Select All
                    </>
                  )}
                </Button>
                <Badge variant="secondary">
                  {selectedResources.length} selected
                </Badge>
              </div>
            </div>
            <CardDescription>
              Select resources to include in your bulk export
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-muted-foreground">
                  Loading resources...
                </p>
              </div>
            ) : filteredResources.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedResources.includes(resource.id)}
                          onCheckedChange={() =>
                            toggleResourceSelection(resource.id)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {resource.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getCategoryColor(resource.category)}
                        >
                          {resource.category.charAt(0).toUpperCase() +
                            resource.category.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{resource.type}</TableCell>
                      <TableCell>{resource.dateAdded}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No resources found matching your criteria.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedResources.length} of {filteredResources.length} resources
              selected
            </p>
            <Button
              onClick={handleExport}
              disabled={isExporting || selectedResources.length === 0}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  {exportFormat === "excel" ? (
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  Export Selected
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default BulkResourceExporter;
