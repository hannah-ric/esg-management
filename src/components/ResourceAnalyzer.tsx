import React, { useState, /*useCallback*/ } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Link as LinkIcon,
  Check,
  AlertCircle,
  Edit,
  Save,
  FileText,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import ResourceExporter from "./ResourceExporter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { AnalyzedContentResult, AnalyzedContentDataPoint, AnalyzedContentFrameworkMapping } from "@/lib/plan-enhancement";
import type { ResourceExporterResourcePropsLocal } from "@/components/ResourceExporter";

interface ResourceAnalyzerProps {
  onResourceAdded?: (resource: AnalyzedContentResult) => void;
  onDataExtracted?: (dataPoints: Record<string, AnalyzedContentDataPoint>) => void;
}

const ResourceAnalyzer: React.FC<ResourceAnalyzerProps> = ({
  onResourceAdded,
  onDataExtracted,
}) => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzedContentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingDataPoint, setEditingDataPoint] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const analyzeUrl = async () => {
    if (!url && !file) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      let sourceUrl = url;

      if (file) {
        setIsUploading(true);
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
        const filePath = `temp/${fileName}`;

        const { /*data: uploadData,*/ error: uploadError } = await supabase.storage
          .from("resources")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("resources")
          .getPublicUrl(filePath);

        sourceUrl = publicUrlData.publicUrl;
        setIsUploading(false);
      }

      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-analyze-esg-content",
        {
          body: { url: sourceUrl, extractText: true },
        },
      );

      if (error) throw new Error(error.message);

      setResult(data);
      if (onResourceAdded && data) {
        const fileTypeFromUrl = data.url?.split('.').pop()?.toLowerCase();
        const dataForExporter: AnalyzedContentResult = {
            ...data,
            id: data.id || data.url || `analyzed-${Date.now()}`,
            fileType: data.fileType || fileTypeFromUrl || "unknown",
        };
        onResourceAdded(dataForExporter);
      }

      if (onDataExtracted && data?.esgData?.dataPoints) {
        onDataExtracted(data.esgData.dataPoints);
      }
    } catch (err) {
      console.error("Error analyzing content:", err);
      let message = "Failed to analyze the content. Please try again.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setError(message);
    } finally {
      setIsAnalyzing(false);
      setIsUploading(false);
      setFile(null);
    }
  };

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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "guide":
        return "Guide";
      case "template":
        return "Template";
      case "framework":
        return "Framework";
      case "case-study":
        return "Case Study";
      default:
        return "Article";
    }
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

  const handleEditDataPoint = (metricId: string) => {
    setEditingDataPoint(metricId);
    if (result?.esgData?.dataPoints && result.esgData.dataPoints[metricId]) {
      setEditedValues({
        ...editedValues,
        [metricId]: result.esgData.dataPoints[metricId].value,
      });
    }
  };

  const handleSaveDataPoint = async (metricId: string) => {
    if (!result || !result.esgData || !result.esgData.dataPoints || !result.esgData.dataPoints[metricId])
      return;

    try {
      const updatedDataPoints = {
        ...result.esgData.dataPoints,
        [metricId]: {
          ...result.esgData.dataPoints[metricId],
          value: editedValues[metricId],
          is_edited: true,
        },
      };

      setResult({
        ...result,
        esgData: {
          ...result.esgData,
          dataPoints: updatedDataPoints,
        },
      });

      const { data: resourceData } = await supabase
        .from("resources")
        .select("id")
        .eq("url", result.url)
        .single();

      if (resourceData?.id) {
        const { data: existingDataPoint } = await supabase
          .from("esg_data_points")
          .select("id")
          .eq("resource_id", resourceData.id)
          .eq("metric_id", metricId)
          .single();

        if (existingDataPoint?.id) {
          await supabase
            .from("esg_data_points")
            .update({
              value: editedValues[metricId],
              updated_at: new Date().toISOString(),
              is_edited: true,
              user_id: (await supabase.auth.getUser()).data.user?.id,
            })
            .eq("id", existingDataPoint.id);
        } else {
          const dataPoint = result.esgData.dataPoints[metricId];
          await supabase.from("esg_data_points").insert({
            resource_id: resourceData.id,
            metric_id: metricId,
            value: editedValues[metricId],
            context: dataPoint.context,
            confidence: dataPoint.confidence,
            source: dataPoint.source,
            framework_id: dataPoint.framework_id,
            disclosure_id: dataPoint.disclosure_id,
            is_edited: true,
            user_id: (await supabase.auth.getUser()).data.user?.id,
          });
        }
      }
    } catch (err) {
      console.error("Error saving data point:", err);
      let message = "Failed to save data point. Please try again.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setError(message);
    } finally {
      setEditingDataPoint(null);
    }
  };

  const resourceForExporter: ResourceExporterResourcePropsLocal | undefined = result ? {
    id: result.id || result.url || `res-${Date.now()}`,
    title: result.title,
    description: result.description,
    type: result.type,
    category: result.category,
    fileType: result.fileType || result.url?.split('.').pop()?.toLowerCase() || "unknown",
    url: result.url,
    rawContent: result.rawContent,
    esgData: result.esgData
  } : undefined;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Analyze ESG Content</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Enter URL of ESG report, article, or resource"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                disabled={isAnalyzing || isUploading}
              />
              <Button
                onClick={analyzeUrl}
                disabled={isAnalyzing || isUploading || (!url && !file)}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Or upload a document:
              </div>
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.xlsx,.xls"
                className="flex-1"
                disabled={isAnalyzing || isUploading}
              />
              {file && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm truncate max-w-[150px]">
                    {file.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-md p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{result.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <LinkIcon className="h-3 w-3 mr-1" />
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline truncate max-w-md"
                    >
                      {result.url}
                    </a>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="secondary"
                    className={getCategoryColor(result.category)}
                  >
                    {result.category.charAt(0).toUpperCase() +
                      result.category.slice(1)}
                  </Badge>
                  <Badge variant="outline">{getTypeLabel(result.type)}</Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {result.description}
              </p>

              {result.tags && result.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {result.tags.map((tag: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center mt-4 mb-2">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="esg-data">
                      ESG Data
                      {result.esgData?.dataPoints &&
                        Object.keys(result.esgData.dataPoints).length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {Object.keys(result.esgData.dataPoints).length}
                          </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="frameworks">
                      Frameworks
                      {result.esgData?.mappings &&
                        Object.keys(result.esgData.mappings).length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {Object.keys(result.esgData.mappings).length}
                          </Badge>
                        )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <Alert>
                      <Check className="h-4 w-4" />
                      <AlertTitle>Analysis Complete</AlertTitle>
                      <AlertDescription>
                        This content has been analyzed and categorized as{" "}
                        {result.category} content.
                        {result.type === "framework" &&
                          " It appears to be a reporting framework or standard."}
                        {result.type === "guide" &&
                          " It appears to be a guide or instructional content."}
                        {result.type === "template" &&
                          " It appears to be a template or example document."}
                      </AlertDescription>
                    </Alert>
                  </TabsContent>

                  <TabsContent value="esg-data">
                    {result?.esgData?.dataPoints &&
                    Object.keys(result.esgData.dataPoints).length > 0 ? (
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">
                          Extracted ESG Data Points
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(result.esgData.dataPoints).map(
                            ([metricId, dataPoint]: [string, AnalyzedContentDataPoint]) => (
                              <div
                                key={metricId}
                                className="border rounded-md p-3"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="font-medium">
                                      {getMetricLabel(metricId)}
                                    </h5>
                                    {dataPoint.framework_id &&
                                      dataPoint.disclosure_id && (
                                        <Badge
                                          variant="outline"
                                          className="mt-1"
                                        >
                                          {dataPoint.framework_id} {dataPoint.disclosure_id}
                                        </Badge>
                                      )}
                                  </div>
                                  <div>
                                    {editingDataPoint === metricId ? (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          handleSaveDataPoint(metricId)
                                        }
                                      >
                                        <Save className="h-4 w-4 mr-1" /> Save
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          handleEditDataPoint(metricId)
                                        }
                                      >
                                        <Edit className="h-4 w-4 mr-1" /> Edit
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                {editingDataPoint === metricId ? (
                                  <div className="mt-2">
                                    <Label htmlFor={`edit-${metricId}`}>
                                      Value
                                    </Label>
                                    <Input
                                      id={`edit-${metricId}`}
                                      value={
                                        editedValues[metricId] ||
                                        dataPoint.value
                                      }
                                      onChange={(e) =>
                                        setEditedValues({
                                          ...editedValues,
                                          [metricId]: e.target.value,
                                        })
                                      }
                                      className="mt-1"
                                    />
                                  </div>
                                ) : (
                                  <div className="mt-2">
                                    <div className="text-sm font-medium">
                                      Value:
                                    </div>
                                    <div className="text-lg">
                                      {dataPoint.value}
                                    </div>
                                    {dataPoint.is_edited && (
                                      <Badge
                                        variant="outline"
                                        className="mt-1 text-xs"
                                      >
                                        Edited
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                <Accordion
                                  type="single"
                                  collapsible
                                  className="mt-2"
                                >
                                  <AccordionItem value="context">
                                    <AccordionTrigger className="text-xs py-1">
                                      Show Context
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                        {dataPoint.context}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">
                          No ESG data points were extracted from this content.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="frameworks">
                    {result.esgData?.mappings &&
                    Object.keys(result.esgData.mappings).length > 0 ? (
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">
                          Detected Framework References
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(result.esgData.mappings).map(
                            ([frameworkId, disclosures]: [string, AnalyzedContentFrameworkMapping[]]) => (
                              <div
                                key={frameworkId}
                                className="border rounded-md p-3"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <Badge
                                      className={getFrameworkColor(frameworkId)}
                                    >
                                      {frameworkId}
                                    </Badge>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {disclosures.map(
                                        (disclosure: AnalyzedContentFrameworkMapping, i: number) => (
                                          <Badge
                                            key={i}
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {disclosure.disclosure_id}
                                          </Badge>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">
                          No framework references were detected in this content.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                {resourceForExporter && <ResourceExporter resource={resourceForExporter} />}
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Powered by Diffbot AI content analysis
      </CardFooter>
    </Card>
  );
};

export default ResourceAnalyzer;
