import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Save, Plus, Trash2, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ESGDataPoint,
  ESGFrameworkMapping,
  getAllESGDataPoints,
  getESGFrameworkMappings,
  saveESGDataPoint,
  deleteESGDataPoint,
  saveESGFrameworkMapping,
  deleteESGFrameworkMapping,
} from "@/lib/esg-data-services";
import { sanitizeInput, sanitizeObject } from "@/lib/error-utils";

interface ESGDataEditorProps {
  resourceId?: string;
  resourceTitle?: string;
  onDataChange?: () => void;
}

// Define a resource data type for clarity
interface ResourceData {
  dataPoints: ESGDataPoint[];
  mappings: ESGFrameworkMapping[];
}

const ESGDataEditor: React.FC<ESGDataEditorProps> = ({
  resourceId,
  resourceTitle = "Resource",
  onDataChange,
}) => {
  const [resourceData, setResourceData] = useState<ResourceData>({
    dataPoints: [],
    mappings: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("data-points");
  const [isAddingDataPoint, setIsAddingDataPoint] = useState(false);
  const [isAddingMapping, setIsAddingMapping] = useState(false);
  const [newDataPoint, setNewDataPoint] = useState<Partial<ESGDataPoint>>({
    metric_id: "",
    value: "",
    context: "",
    confidence: 0.8,
    source: "",
  });
  const [newMapping, setNewMapping] = useState<Partial<ESGFrameworkMapping>>({
    framework_id: "",
    disclosure_id: "",
  });

  // Memoize data points and mappings for better performance
  const dataPoints = useMemo(() => resourceData.dataPoints, [resourceData.dataPoints]);
  const mappings = useMemo(() => resourceData.mappings, [resourceData.mappings]);

  const loadData = useCallback(async () => {
    if (!resourceId) return;
    setLoading(true);
    setError(null);

    try {
      const [dataPointsData, mappingsData] = await Promise.all([
        getAllESGDataPoints(resourceId),
        getESGFrameworkMappings(resourceId),
      ]);

      setResourceData({
        dataPoints: dataPointsData,
        mappings: mappingsData
      });
    } catch (err) {
      console.error("Error loading ESG data:", err);
      setError("Failed to load ESG data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [resourceId]);

  useEffect(() => {
    if (resourceId) {
      loadData();
    }
  }, [resourceId, loadData]);

  const handleAddDataPoint = useCallback(async () => {
    if (!resourceId) {
      setError("A resource must be selected to add a data point.");
      return;
    }
    try {
      if (!newDataPoint.metric_id || !newDataPoint.value) {
        setError("Metric ID and value are required.");
        return;
      }

      // Sanitize input data before saving
      const sanitizedDataPoint = sanitizeObject({
        ...(newDataPoint as ESGDataPoint),
        resource_id: resourceId,
      });

      const dataPoint = await saveESGDataPoint(sanitizedDataPoint);

      if (dataPoint) {
        setResourceData(prev => ({
          ...prev,
          dataPoints: [...prev.dataPoints, dataPoint]
        }));
        
        setNewDataPoint({
          metric_id: "",
          value: "",
          context: "",
          confidence: 0.8,
          source: "",
        });
        setIsAddingDataPoint(false);
        if (onDataChange) onDataChange();
      }
    } catch (err) {
      console.error("Error adding data point:", err);
      setError("Failed to add data point. Please try again.");
    }
  }, [newDataPoint, resourceId, onDataChange]);

  const handleDeleteDataPoint = useCallback(async (id: string) => {
    try {
      const success = await deleteESGDataPoint(id);
      if (success) {
        setResourceData(prev => ({
          ...prev,
          dataPoints: prev.dataPoints.filter((dp) => dp.id !== id)
        }));
        
        if (onDataChange) onDataChange();
      }
    } catch (err) {
      console.error("Error deleting data point:", err);
      setError("Failed to delete data point. Please try again.");
    }
  }, [onDataChange]);

  const handleAddMapping = useCallback(async () => {
    if (!resourceId) {
      setError("A resource must be selected to add a framework mapping.");
      return;
    }
    try {
      if (!newMapping.framework_id || !newMapping.disclosure_id) {
        setError("Framework ID and disclosure ID are required.");
        return;
      }

      // Sanitize input data before saving
      const sanitizedMapping = sanitizeObject({
        ...(newMapping as ESGFrameworkMapping),
        resource_id: resourceId,
      });

      const mapping = await saveESGFrameworkMapping(sanitizedMapping);

      if (mapping) {
        setResourceData(prev => ({
          ...prev,
          mappings: [...prev.mappings, mapping]
        }));
        
        setNewMapping({
          framework_id: "",
          disclosure_id: "",
        });
        setIsAddingMapping(false);
        if (onDataChange) onDataChange();
      }
    } catch (err) {
      console.error("Error adding mapping:", err);
      setError("Failed to add mapping. Please try again.");
    }
  }, [newMapping, resourceId, onDataChange]);

  const handleDeleteMapping = useCallback(async (id: string) => {
    try {
      const success = await deleteESGFrameworkMapping(id);
      if (success) {
        setResourceData(prev => ({
          ...prev,
          mappings: prev.mappings.filter((m) => m.id !== id)
        }));
        
        if (onDataChange) onDataChange();
      }
    } catch (err) {
      console.error("Error deleting mapping:", err);
      setError("Failed to delete mapping. Please try again.");
    }
  }, [onDataChange]);

  // Memoize these functions to prevent unnecessary rerenders
  const handleDataPointChange = useCallback((field: string, value: any) => {
    setNewDataPoint(prev => ({
      ...prev,
      [field]: field === 'value' || field === 'context' ? sanitizeInput(value) : value
    }));
  }, []);

  const handleMappingChange = useCallback((field: string, value: string) => {
    setNewMapping(prev => ({
      ...prev,
      [field]: sanitizeInput(value)
    }));
  }, []);

  // Memoize these pure functions
  const getMetricLabel = useMemo(() => {
    return (metricId: string) => {
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
  }, []);

  const getFrameworkColor = useMemo(() => {
    return (frameworkId: string) => {
      switch (frameworkId) {
        case "GRI":
          return "bg-blue-100 text-blue-800";
        case "SASB":
          return "bg-green-100 text-green-800";
        case "TCFD":
          return "bg-purple-100 text-purple-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };
  }, []);

  if (!resourceId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>ESG Data Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="default">
            <AlertTitle>No Resource Selected</AlertTitle>
            <AlertDescription>
              Please select a resource to edit its ESG data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading && resourceId) {
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
          <span>ESG Data for {resourceTitle}</span>
          <div className="flex gap-2">
            <Dialog
              open={isAddingDataPoint}
              onOpenChange={setIsAddingDataPoint}
            >
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Add Data Point
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add ESG Data Point</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="metric-id">Metric ID</Label>
                    <Input
                      id="metric-id"
                      placeholder="e.g., carbon-emissions"
                      value={newDataPoint.metric_id}
                      onChange={(e) =>
                        handleDataPointChange("metric_id", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      placeholder="e.g., 45.2 tonnes CO2e"
                      value={newDataPoint.value}
                      onChange={(e) =>
                        handleDataPointChange("value", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="context">Context (Optional)</Label>
                    <Textarea
                      id="context"
                      placeholder="Additional context for this data point"
                      value={newDataPoint.context || ""}
                      onChange={(e) =>
                        handleDataPointChange("context", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confidence">Confidence (0-1)</Label>
                    <Input
                      id="confidence"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={newDataPoint.confidence}
                      onChange={(e) =>
                        handleDataPointChange(
                          "confidence",
                          parseFloat(e.target.value),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Input
                      id="source"
                      placeholder="e.g., Internal records, 2023"
                      value={newDataPoint.source}
                      onChange={(e) =>
                        handleDataPointChange("source", e.target.value)
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingDataPoint(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDataPoint}>
                    <Save className="h-4 w-4 mr-1" /> Save Data Point
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isAddingMapping}
              onOpenChange={setIsAddingMapping}
            >
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Add Framework Mapping
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Framework Mapping</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="framework-id">Framework</Label>
                    <Select
                      value={newMapping.framework_id}
                      onValueChange={(value) =>
                        handleMappingChange("framework_id", value)
                      }
                    >
                      <SelectTrigger id="framework-id">
                        <SelectValue placeholder="Select a framework" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GRI">GRI</SelectItem>
                        <SelectItem value="SASB">SASB</SelectItem>
                        <SelectItem value="TCFD">TCFD</SelectItem>
                        <SelectItem value="CDP">CDP</SelectItem>
                        <SelectItem value="SDG">SDG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disclosure-id">Disclosure ID</Label>
                    <Input
                      id="disclosure-id"
                      placeholder="e.g., GRI 305-1"
                      value={newMapping.disclosure_id || ""}
                      onChange={(e) =>
                        handleMappingChange("disclosure_id", e.target.value)
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingMapping(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMapping}>
                    <Save className="h-4 w-4 mr-1" /> Save Mapping
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="data-points">Data Points</TabsTrigger>
            <TabsTrigger value="framework-mappings">Framework Mappings</TabsTrigger>
          </TabsList>

          <TabsContent value="data-points">
            {dataPoints.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No data points added yet. Click "Add Data Point" to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataPoints.map((dp) => (
                    <TableRow key={dp.id}>
                      <TableCell className="font-medium">
                        {getMetricLabel(dp.metric_id)}
                      </TableCell>
                      <TableCell>{dp.value}</TableCell>
                      <TableCell>{dp.source}</TableCell>
                      <TableCell>{(dp.confidence * 100).toFixed(0)}%</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDataPoint(dp.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="framework-mappings">
            {mappings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No framework mappings added yet. Click "Add Framework Mapping" to
                get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Framework</TableHead>
                    <TableHead>Disclosure ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell>
                        <Badge
                          className={getFrameworkColor(mapping.framework_id)}
                        >
                          {mapping.framework_id}
                        </Badge>
                      </TableCell>
                      <TableCell>{mapping.disclosure_id}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMapping(mapping.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ESGDataEditor;
