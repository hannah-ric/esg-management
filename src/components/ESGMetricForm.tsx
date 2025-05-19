import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Save, Plus, Trash2, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ESGDataPoint,
  ESGHistoricalDataPoint,
  saveESGDataPoint,
  getFrameworkRecommendations,
  FrameworkRecItem
} from "@/lib/esg-data-services";
import { formatLocaleNumber } from '@/lib/utils';
// import { sanitizeInput } from '@/lib/error-utils'; // Unused
import { useToast } from "@/components/ui/use-toast";

interface ESGMetricFormProps {
  resourceId: string;
  initialData?: Partial<ESGDataPoint>;
  onSave: (dataPoint: ESGDataPoint) => void;
  onCancel: () => void;
}

const ESGMetricForm: React.FC<ESGMetricFormProps> = ({
  resourceId,
  initialData,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<ESGDataPoint>>({
    resource_id: resourceId,
    metric_id: "",
    value: "",
    context: "",
    confidence: 0.9,
    source: "Manual entry",
    framework_id: "",
    disclosure_id: "",
    reporting_year: new Date().getFullYear().toString(),
    historical_data: [],
    ...initialData,
  });

  const [historicalEntries, setHistoricalEntries] = useState<
    ESGHistoricalDataPoint[]
  >(initialData?.historical_data || []);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendedFrameworks, setRecommendedFrameworks] = useState<FrameworkRecItem[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);

  const [displayValues, setDisplayValues] = useState({ value: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
        setFormData(prev => ({...prev, ...initialData}));
    }
    setDisplayValues({
      value: initialData?.value !== undefined ? formatLocaleNumber(initialData.value) : '',
    });
  }, [initialData]);

  // const handleInputChange = useCallback((field: keyof ESGDataPoint, value: string | number | boolean | ESGHistoricalDataPoint[] | undefined) => {
  //   let sanitizedValue: string | number | boolean | ESGHistoricalDataPoint[] | undefined | null = value;
  //   if (typeof value === 'string' && (field === 'metric_id' || field === 'value' || field === 'context' || field === 'source')) {
  //     sanitizedValue = sanitizeInput(value);
  //   } else if (field === 'historical_data' && !Array.isArray(value)) {
  //     sanitizedValue = []; // Ensure historical_data is an array
  //   }
  //   setFormData(prev => ({
  //     ...prev,
  //     [field]: sanitizedValue as ESGDataPoint[keyof ESGDataPoint]
  //   }));
  // }, []);

  const handleNumericInputChange = useCallback((displayValue: string) => {
    setDisplayValues(prev => ({ ...prev, value: displayValue }));
    setFormData(prev => ({ ...prev, value: displayValue }));
  }, []);

  // Predefined metric options
  const metricOptions = [
    { value: "carbon-emissions", label: "Carbon Emissions" },
    { value: "energy-consumption", label: "Energy Consumption" },
    { value: "water-usage", label: "Water Usage" },
    { value: "waste-management", label: "Waste Management" },
    { value: "diversity-inclusion", label: "Diversity & Inclusion" },
    { value: "health-safety", label: "Health & Safety" },
    { value: "employee-turnover", label: "Employee Turnover" },
    { value: "board-diversity", label: "Board Diversity" },
    { value: "community-investment", label: "Community Investment" },
    { value: "supply-chain-assessment", label: "Supply Chain Assessment" },
    { value: "customer-privacy", label: "Customer Privacy" },
    { value: "data-security", label: "Data Security" },
    { value: "product-safety", label: "Product Safety" },
    { value: "business-ethics", label: "Business Ethics" },
    { value: "climate-risk", label: "Climate Risk" },
    { value: "renewable-energy", label: "Renewable Energy" },
    { value: "custom", label: "Custom Metric" },
  ];

  // Framework options
  const frameworkOptions = [
    { value: "GRI", label: "Global Reporting Initiative (GRI)" },
    {
      value: "SASB",
      label: "Sustainability Accounting Standards Board (SASB)",
    },
    {
      value: "TCFD",
      label: "Task Force on Climate-related Financial Disclosures (TCFD)",
    },
    { value: "CDP", label: "Carbon Disclosure Project (CDP)" },
    { value: "SDG", label: "UN Sustainable Development Goals (SDGs)" },
    {
      value: "IIRC",
      label: "International Integrated Reporting Council (IIRC)",
    },
    {
      value: "CSRD",
      label: "Corporate Sustainability Reporting Directive (CSRD)",
    },
  ];

  // Add a new historical data entry
  const addHistoricalEntry = () => {
    setHistoricalEntries([
      ...historicalEntries,
      { year: "", value: "", source: "Historical record" },
    ]);
  };

  // Update a historical data entry
  const updateHistoricalEntry = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updatedEntries = [...historicalEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setHistoricalEntries(updatedEntries);
  };

  // Remove a historical data entry
  const removeHistoricalEntry = (index: number) => {
    const updatedEntries = [...historicalEntries];
    updatedEntries.splice(index, 1);
    setHistoricalEntries(updatedEntries);
  };

  // Get framework recommendations based on metric and value
  const getRecommendations = async () => {
    if (!formData.metric_id || !formData.value) {
      setError("Please enter a metric and value to get recommendations");
      return;
    }

    setIsLoadingRecommendations(true);
    setError(null);

    try {
      const recommendations = await getFrameworkRecommendations({
        metricId: formData.metric_id,
        value: String(formData.value),
        context: formData.context || "",
      });

      setRecommendedFrameworks(recommendations);
    } catch (err) {
      console.error("Error getting framework recommendations:", err);
      setError("Failed to get framework recommendations. Please try again.");
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Apply a recommended framework
  const applyRecommendation = (framework: string, disclosure: string) => {
    setFormData({
      ...formData,
      framework_id: framework,
      disclosure_id: disclosure,
    });
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const finalMetric: Partial<ESGDataPoint> = {
        ...formData,
        value: displayValues.value,
        historical_data: historicalEntries,
    };

    if (!finalMetric.metric_id || !finalMetric.value) {
      toast({ title: "Missing Fields", description: "Metric ID and value are required.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const savedDataPoint = await saveESGDataPoint(finalMetric as ESGDataPoint);

      if (savedDataPoint) {
        onSave(savedDataPoint);
      } else {
        throw new Error("Failed to save data point");
      }
    } catch (err) {
      console.error("Error saving ESG data point:", err);
      setError("Failed to save data point. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [formData, displayValues, historicalEntries, onSave, toast]);

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="metric-id">Metric</Label>
            <Select
              value={formData.metric_id}
              onValueChange={(value) => {
                setFormData({
                  ...formData,
                  metric_id: value === "custom" ? "" : value,
                });
              }}
            >
              <SelectTrigger id="metric-id">
                <SelectValue placeholder="Select a metric" />
              </SelectTrigger>
              <SelectContent>
                {metricOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.metric_id === "custom" && (
              <div className="mt-2">
                <Label htmlFor="custom-metric">Custom Metric Name</Label>
                <Input
                  id="custom-metric"
                  placeholder="Enter custom metric name"
                  value={
                    formData.metric_id === "custom" ? "" : formData.metric_id
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, metric_id: e.target.value })
                  }
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reporting-year">Reporting Year</Label>
            <Input
              id="reporting-year"
              type="number"
              placeholder="YYYY"
              value={formData.reporting_year}
              onChange={(e) =>
                setFormData({ ...formData, reporting_year: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            placeholder="e.g., 1000 tCO2e"
            value={displayValues.value}
            onChange={(e) => handleNumericInputChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="context">Context/Description</Label>
          <Textarea
            id="context"
            placeholder="Provide context or description for this metric"
            value={formData.context}
            onChange={(e) =>
              setFormData({ ...formData, context: e.target.value })
            }
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">Data Source</Label>
          <Input
            id="source"
            placeholder="e.g., Internal measurement, Third-party verification"
            value={formData.source}
            onChange={(e) =>
              setFormData({ ...formData, source: e.target.value })
            }
          />
        </div>

        <Tabs defaultValue="historical-data" className="w-full">
          <TabsList>
            <TabsTrigger value="historical-data">Historical Data</TabsTrigger>
            <TabsTrigger value="framework-alignment">
              Framework Alignment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="historical-data" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Historical Data</h3>
              <Button variant="outline" size="sm" onClick={addHistoricalEntry}>
                <Plus className="h-4 w-4 mr-1" /> Add Historical Entry
              </Button>
            </div>

            {historicalEntries.length > 0 ? (
              <div className="space-y-4">
                {historicalEntries.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-end gap-2 border p-3 rounded-md"
                  >
                    <div className="space-y-2 flex-1">
                      <Label htmlFor={`year-${index}`}>Year</Label>
                      <Input
                        id={`year-${index}`}
                        type="number"
                        placeholder="YYYY"
                        value={entry.year}
                        onChange={(e) =>
                          updateHistoricalEntry(index, "year", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor={`value-${index}`}>Value</Label>
                      <Input
                        id={`value-${index}`}
                        placeholder="e.g., 950 tCO2e"
                        value={entry.value}
                        onChange={(e) =>
                          updateHistoricalEntry(index, "value", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor={`source-${index}`}>Source</Label>
                      <Input
                        id={`source-${index}`}
                        placeholder="Data source"
                        value={entry.source}
                        onChange={(e) =>
                          updateHistoricalEntry(index, "source", e.target.value)
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHistoricalEntry(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  No historical data added yet. Click &quot;Add Historical Entry&quot; to
                  add data from previous years.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="framework-alignment" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Framework Alignment</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={getRecommendations}
                disabled={
                  isLoadingRecommendations ||
                  !formData.metric_id ||
                  !formData.value
                }
              >
                {isLoadingRecommendations ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Getting
                    Recommendations...
                  </>
                ) : (
                  <>Get Recommendations</>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="framework-id">Framework</Label>
                <Select
                  value={formData.framework_id || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, framework_id: value })
                  }
                >
                  <SelectTrigger id="framework-id">
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworkOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="disclosure-id">Disclosure ID</Label>
                <Input
                  id="disclosure-id"
                  placeholder="e.g., 305-1 or E1"
                  value={formData.disclosure_id || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, disclosure_id: e.target.value })
                  }
                />
              </div>
            </div>

            {recommendedFrameworks.length > 0 ? (
              <div className="mt-4 border rounded-md p-4">
                <h4 className="font-medium mb-2">Recommended Frameworks</h4>
                <div className="space-y-2">
                  {recommendedFrameworks.map((rec, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-muted/50 rounded-md"
                    >
                      <div>
                        <Badge variant="outline">{rec.framework}</Badge>
                        <span className="ml-2">{rec.disclosure}</span>
                        {rec.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {rec.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          applyRecommendation(rec.framework, rec.disclosure)
                        }
                      >
                        Apply
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground">
                  {isLoadingRecommendations
                    ? "Loading recommendations..."
                    : "Click &quot;Get Recommendations&quot; to see suggested framework alignments based on your metric data."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" /> Save Metric
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ESGMetricForm;
