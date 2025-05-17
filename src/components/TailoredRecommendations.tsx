import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useAppContext, MaterialityTopic as AppContextMaterialityTopic } from "./AppContext";
import {
  getTailoredRecommendations,
  parseRecommendations,
  MaterialityTopic as TailoredMaterialityTopic,
  ParsedRecommendations,
} from "@/lib/tailored-recommendations";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  Sparkles,
  Edit,
  Save,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TailoredRecommendationsProps {
  onApplyRecommendations?: (recommendations: ParsedRecommendations) => void;
}

// Convert AppContext MaterialityTopic to the tailored-recommendations MaterialityTopic
const convertToTailoredMaterialityTopic = (topics: AppContextMaterialityTopic[]): TailoredMaterialityTopic[] => {
  return topics.map(topic => ({
    id: topic.id,
    name: topic.name,
    category: topic.category,
    stakeholderImpact: topic.stakeholderImportance, // Map stakeholderImportance to stakeholderImpact
    businessImpact: topic.businessImpact,
    description: topic.description || ""
  }));
};

const TailoredRecommendations: React.FC<TailoredRecommendationsProps> = ({
  onApplyRecommendations,
}) => {
  const { questionnaireData, materialityTopics } = useAppContext();
  const [url, setUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("materiality");
  const [recommendations, setRecommendations] =
    useState<ParsedRecommendations | null>(null);
  const [rawRecommendations, setRawRecommendations] = useState<string>("");
  const [editingTopic, setEditingTopic] = useState<TailoredMaterialityTopic | null>(
    null,
  );
  const [editedTopics, setEditedTopics] = useState<TailoredMaterialityTopic[]>([]);

  const generateRecommendations = async () => {
    if (!questionnaireData) {
      setError("Please complete the questionnaire first.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await getTailoredRecommendations({
        url: url || undefined,
        surveyAnswers: questionnaireData,
        materialityTopics: convertToTailoredMaterialityTopic(materialityTopics || []),
      });

      if (!response.success || response.error) {
        throw new Error(response.error || "Failed to generate recommendations");
      }

      setRawRecommendations(response.recommendations.content);
      const parsed = parseRecommendations(response.recommendations.content);
      setRecommendations(parsed);
      setEditedTopics(parsed.materialityTopics);
    } catch (err) {
      console.error("Error generating recommendations:", err);
      let message = "Failed to generate recommendations. Please try again.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditTopic = (topic: TailoredMaterialityTopic) => {
    setEditingTopic({ ...topic });
  };

  const handleSaveTopic = () => {
    if (!editingTopic) return;

    const updatedTopics = editedTopics.map((topic) =>
      topic.id === editingTopic.id ? editingTopic : topic,
    );

    setEditedTopics(updatedTopics);
    setEditingTopic(null);
  };

  const handleApplyRecommendations = () => {
    if (!recommendations) return;

    // Create a new recommendations object with the edited topics
    const updatedRecommendations = {
      ...recommendations,
      materialityTopics: editedTopics,
    };

    if (onApplyRecommendations) {
      onApplyRecommendations(updatedRecommendations);
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

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case "GRI":
        return "bg-blue-100 text-blue-800";
      case "SASB":
        return "bg-green-100 text-green-800";
      case "TCFD":
        return "bg-purple-100 text-purple-800";
      case "SDG":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Tailored ESG Recommendations</span>
          <Button
            onClick={generateRecommendations}
            disabled={isGenerating}
            className="ml-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Recommendations
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="Optional: Enter URL of relevant ESG document or website"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              disabled={isGenerating}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {recommendations && (
            <div className="mt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="materiality">
                    Materiality Topics
                  </TabsTrigger>
                  <TabsTrigger value="frameworks">
                    Framework Recommendations
                  </TabsTrigger>
                  <TabsTrigger value="implementation">
                    Implementation Steps
                  </TabsTrigger>
                  <TabsTrigger value="resources">
                    Resource Recommendations
                  </TabsTrigger>
                  <TabsTrigger value="raw">Raw Output</TabsTrigger>
                </TabsList>

                <TabsContent value="materiality" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Tailored Materiality Topics
                    </h3>
                    <Button
                      onClick={handleApplyRecommendations}
                      variant="outline"
                    >
                      Apply to Materiality Matrix
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {editedTopics.map((topic) => (
                      <div key={topic.id} className="border rounded-md p-4">
                        {editingTopic && editingTopic.id === topic.id ? (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="topic-name">Topic Name</Label>
                              <Input
                                id="topic-name"
                                value={editingTopic.name}
                                onChange={(e) =>
                                  setEditingTopic({
                                    ...editingTopic,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div>
                              <Label htmlFor="topic-description">
                                Description
                              </Label>
                              <Textarea
                                id="topic-description"
                                value={editingTopic.description}
                                onChange={(e) =>
                                  setEditingTopic({
                                    ...editingTopic,
                                    description: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div>
                              <div className="flex justify-between mb-1">
                                <Label>
                                  Stakeholder Impact:{" "}
                                  {editingTopic.stakeholderImpact.toFixed(1)}
                                </Label>
                              </div>
                              <Slider
                                value={[editingTopic.stakeholderImpact * 100]}
                                min={0}
                                max={100}
                                step={5}
                                onValueChange={(value) => {
                                  setEditingTopic({
                                    ...editingTopic,
                                    stakeholderImpact: value[0] / 100,
                                  });
                                }}
                              />
                            </div>

                            <div>
                              <div className="flex justify-between mb-1">
                                <Label>
                                  Business Impact:{" "}
                                  {editingTopic.businessImpact.toFixed(1)}
                                </Label>
                              </div>
                              <Slider
                                value={[editingTopic.businessImpact * 100]}
                                min={0}
                                max={100}
                                step={5}
                                onValueChange={(value) => {
                                  setEditingTopic({
                                    ...editingTopic,
                                    businessImpact: value[0] / 100,
                                  });
                                }}
                              />
                            </div>

                            <div>
                              <Label>Category</Label>
                              <Select
                                value={editingTopic.category}
                                onValueChange={(value) => {
                                  setEditingTopic({
                                    ...editingTopic,
                                    category: value as
                                      | "environmental"
                                      | "social"
                                      | "governance",
                                  });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="environmental">
                                    Environmental
                                  </SelectItem>
                                  <SelectItem value="social">Social</SelectItem>
                                  <SelectItem value="governance">
                                    Governance
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingTopic(null)}
                              >
                                <X className="h-4 w-4 mr-1" /> Cancel
                              </Button>
                              <Button size="sm" onClick={handleSaveTopic}>
                                <Save className="h-4 w-4 mr-1" /> Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-lg">
                                  {topic.name}
                                </h4>
                                <Badge
                                  variant="secondary"
                                  className={getCategoryColor(topic.category)}
                                >
                                  {topic.category.charAt(0).toUpperCase() +
                                    topic.category.slice(1)}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTopic(topic)}
                              >
                                <Edit className="h-4 w-4 mr-1" /> Edit
                              </Button>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {topic.description}
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Stakeholder Impact
                                </div>
                                <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500"
                                    style={{
                                      width: `${topic.stakeholderImpact * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="mt-1 text-xs font-medium">
                                  {topic.stakeholderImpact.toFixed(1)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Business Impact
                                </div>
                                <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-500"
                                    style={{
                                      width: `${topic.businessImpact * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="mt-1 text-xs font-medium">
                                  {topic.businessImpact.toFixed(1)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="frameworks" className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Framework Recommendations
                  </h3>
                  <div className="space-y-3">
                    {recommendations.frameworks.map((framework, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge
                              className={getFrameworkColor(framework.framework)}
                            >
                              {framework.framework}
                            </Badge>
                          </div>
                        </div>
                        <p className="mt-2 text-sm">{framework.description}</p>
                        {framework.indicators.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs font-medium mb-1">
                              Key Indicators:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {framework.indicators.map((indicator, i) => (
                                <Badge key={i} variant="outline">
                                  {indicator}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="implementation" className="space-y-4">
                  <h3 className="text-lg font-medium">Implementation Steps</h3>
                  <div className="space-y-3">
                    {recommendations.implementationSteps.map((step, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{step.phase}</h4>
                          {step.timeline && (
                            <Badge variant="outline">{step.timeline}</Badge>
                          )}
                        </div>
                        <ul className="mt-2 space-y-1 list-disc pl-5">
                          {step.tasks.map((task, i) => (
                            <li key={i} className="text-sm">
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Resource Recommendations
                  </h3>
                  <div className="space-y-3">
                    {recommendations.resourceRecommendations.map(
                      (resource, index) => (
                        <div key={index} className="border rounded-md p-4">
                          <h4 className="font-medium">{resource.topic}</h4>
                          <ul className="mt-2 space-y-1 list-disc pl-5">
                            {resource.resources.map((item, i) => (
                              <li key={i} className="text-sm">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ),
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="raw">
                  <div className="border rounded-md p-4 bg-gray-50">
                    <pre className="whitespace-pre-wrap text-sm">
                      {rawRecommendations}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleApplyRecommendations}>
                  Apply Recommendations
                </Button>
              </div>
            </div>
          )}

          {!recommendations && !isGenerating && (
            <div className="text-center py-8 border rounded-md">
              <Sparkles className="h-12 w-12 mx-auto text-primary opacity-50" />
              <p className="mt-4 text-lg font-medium">
                Generate Tailored Recommendations
              </p>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Click the &quot;Generate Recommendations&quot; button to get AI-powered
                ESG recommendations tailored to your company profile and survey
                answers.
              </p>
              <Button
                onClick={generateRecommendations}
                className="mt-4"
                disabled={isGenerating}
              >
                <Sparkles className="mr-2 h-4 w-4" /> Generate Recommendations
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TailoredRecommendations;
