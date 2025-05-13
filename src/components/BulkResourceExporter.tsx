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
import { exportToMultipleSheets } from "./ExportUtils";
import {
  FileDown,
  FileText,
  FileSpreadsheet,
  Loader2,
  Search,
  Filter,
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

const BulkResourceExporter: React.FC = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from("resources").select("*");

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedResources = data.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            type: item.type,
            category: item.category,
            fileType: item.file_type || "url",
            url: item.url,
            dateAdded: new Date(item.date_added).toLocaleDateString(),
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

  const handleExportToExcel = async () => {
    if (selectedResources.length === 0) return;

    setIsExporting(true);
    setExportError(null);

    try {
      // Fetch full resource data for selected resources
      const selectedResourcesData = [];

      for (const resourceId of selectedResources) {
        const { data: resourceData } = await supabase
          .from("resources")
          .select("*")
          .eq("id", resourceId)
          .single();

        if (resourceData) {
          // Fetch ESG data points for this resource
          const { data: dataPoints } = await supabase
            .from("esg_data_points")
            .select("*")
            .eq("resource_id", resourceId);

          // Fetch framework mappings for this resource
          const { data: frameworkMappings } = await supabase
            .from("esg_framework_mappings")
            .select("*")
            .eq("resource_id", resourceId);

          selectedResourcesData.push({
            ...resourceData,
            dataPoints: dataPoints || [],
            frameworkMappings: frameworkMappings || [],
          });
        }
      }

      // Prepare data for Excel export
      const excelData: Record<string, any[]> = {
        resources: selectedResourcesData.map((resource) => ({
          Title: resource.title,
          Description: resource.description,
          Category: resource.category,
          Type: resource.type,
          URL: resource.url,
          Source: resource.source,
          DateAdded: resource.date_added,
        })),
      };

      // Add data points sheet
      const allDataPoints = selectedResourcesData.flatMap((resource) =>
        resource.dataPoints.map((dataPoint: any) => ({
          ResourceTitle: resource.title,
          MetricID: dataPoint.metric_id,
          Value: dataPoint.value,
          Framework: dataPoint.framework_id || "N/A",
          Disclosure: dataPoint.disclosure_id || "N/A",
          Confidence: dataPoint.confidence || "N/A",
        })),
      );

      if (allDataPoints.length > 0) {
        excelData.dataPoints = allDataPoints;
      }

      // Add framework mappings sheet
      const allMappings = selectedResourcesData.flatMap((resource) =>
        resource.frameworkMappings.map((mapping: any) => ({
          ResourceTitle: resource.title,
          Framework: mapping.framework_id,
          Disclosure: mapping.disclosure_id,
        })),
      );

      if (allMappings.length > 0) {
        excelData.frameworkMappings = allMappings;
      }

      // Export to Excel
      exportToMultipleSheets(
        excelData,
        `ESG_Resources_Export_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setExportError("Failed to export resources. Please try again.");
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
    <div className="w-full bg-background p-6">
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
            <Button
              onClick={handleExportToExcel}
              disabled={isExporting || selectedResources.length === 0}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
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
                  {selectedResources.length === filteredResources.length ? (
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
              onClick={handleExportToExcel}
              disabled={isExporting || selectedResources.length === 0}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
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
