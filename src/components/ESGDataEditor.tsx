import React, { useState, useEffect } from "react";
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
  getESGDataPoints,
  getESGFrameworkMappings,
  saveESGDataPoint,
  deleteESGDataPoint,
  saveESGFrameworkMapping,
  deleteESGFrameworkMapping,
} from "@/lib/esg-data-services";

interface ESGDataEditorProps {
  resourceId: string;
  resourceTitle?: string;
  onDataChange?: () => void;
}

const ESGDataEditor: React.FC<ESGDataEditorProps> = ({
  resourceId,
  resourceTitle = "Resource",
  onDataChange,
}) => {
  const [dataPoints, setDataPoints] = useState<ESGDataPoint[]>([]);
  const [mappings, setMappings] = useState<ESGFrameworkMapping[]>([]);
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

  useEffect(() => {
    loadData();
  }, [resourceId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [dataPointsData, mappingsData] = await Promise.all([
        getESGDataPoints(resourceId),
        getESGFrameworkMappings(resourceId),
      ]);

      setDataPoints(dataPointsData);
      setMappings(mappingsData);
    } catch (err) {
      console.error("Error loading ESG data:", err);
      setError("Failed to load ESG data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDataPoint = async () => {
    try {
      if (!newDataPoint.metric_id || !newDataPoint.value) {
        setError("Metric ID and value are required.");
        return;
      }

      const dataPoint = await saveESGDataPoint({
        ...(newDataPoint as ESGDataPoint),
        resource_id: resourceId,
      });

      if (dataPoint) {
        setDataPoints([...dataPoints, dataPoint]);
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
  };

  const handleDeleteDataPoint = async (id: string) => {
    try {
      const success = await deleteESGDataPoint(id);
      if (success) {
        setDataPoints(dataPoints.filter((dp) => dp.id !== id));
        if (onDataChange) onDataChange();
      }
    } catch (err) {
      console.error("Error deleting data point:", err);
      setError("Failed to delete data point. Please try again.");
    }
  };

  const handleAddMapping = async () => {
    try {
      if (!newMapping.framework_id || !newMapping.disclosure_id) {
        setError("Framework ID and disclosure ID are required.");
        return;
      }

      const mapping = await saveESGFrameworkMapping({
        ...(newMapping as ESGFrameworkMapping),
        resource_id: resourceId,
      });

      if (mapping) {
        setMappings([...mappings, mapping]);
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
  };

  const handleDeleteMapping = async (id: string) => {
    try {
      const success = await deleteESGFrameworkMapping(id);
      if (success) {
        setMappings(mappings.filter((m) => m.id !== id));
        if (onDataChange) onDataChange();
      }
    } catch (err) {
      console.error("Error deleting mapping:", err);
      setError("Failed to delete mapping. Please try again.");
    }
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

  const getFrameworkColor = (frameworkId: string) => {
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
                        setNewDataPoint({
                          ...newDataPoint,
                          metric_id: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      placeholder="e.g., 1000 tCO2e"
                      value={newDataPoint.value}
                      onChange={(e) =>
                        setNewDataPoint({
                          ...newDataPoint,
                          value: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="context">Context</Label>
                    <Textarea
                      id="context"
                      placeholder="Context for this data point"
                      value={newDataPoint.context}
                      onChange={(e) =>
                        setNewDataPoint({
                          ...newDataPoint,
                          context: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="framework-id">Framework ID</Label>
                      <Input
                        id="framework-id"
                        placeholder="e.g., GRI"
                        value={newDataPoint.framework_id}
                        onChange={(e) =>
                          setNewDataPoint({
                            ...newDataPoint,
                            framework_id: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="disclosure-id">Disclosure ID</Label>
                      <Input
                        id="disclosure-id"
                        placeholder="e.g., 305"
                        value={newDataPoint.disclosure_id}
                        onChange={(e) =>
                          setNewDataPoint({
                            ...newDataPoint,
                            disclosure_id: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Input
                      id="source"
                      placeholder="e.g., Page 42"
                      value={newDataPoint.source}
                      onChange={(e) =>
                        setNewDataPoint({
                          ...newDataPoint,
                          source: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingDataPoint(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddDataPoint}>
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddingMapping} onOpenChange={setIsAddingMapping}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Add Mapping
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Framework Mapping</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="framework-id">Framework ID</Label>
                    <Select
                      value={newMapping.framework_id}
                      onValueChange={(value) =>
                        setNewMapping({
                          ...newMapping,
                          framework_id: value,
                        })
                      }
                    >
                      <SelectTrigger id="framework-id">
                        <SelectValue placeholder="Select framework" />
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
                      placeholder="e.g., 305-1 or E1"
                      value={newMapping.disclosure_id}
                      onChange={(e) =>
                        setNewMapping({
                          ...newMapping,
                          disclosure_id: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingMapping(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddMapping}>
                    <Save className="h-4 w-4 mr-1" /> Save
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
            <TabsTrigger value="data-points">
              Data Points
              <Badge variant="secondary" className="ml-2">
                {dataPoints.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="mappings">
              Framework Mappings
              <Badge variant="secondary" className="ml-2">
                {mappings.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data-points">
            {dataPoints.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Framework</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataPoints.map((dataPoint) => (
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
                      <TableCell>{dataPoint.source}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            dataPoint.id && handleDeleteDataPoint(dataPoint.id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No ESG data points found for this resource.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="mappings">
            {mappings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Framework</TableHead>
                    <TableHead>Disclosure</TableHead>
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
                          size="sm"
                          onClick={() =>
                            mapping.id && handleDeleteMapping(mapping.id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No framework mappings found for this resource.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ESGDataEditor;
