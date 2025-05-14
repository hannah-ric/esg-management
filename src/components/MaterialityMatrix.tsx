import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "./AppContext";
import { analyzeMaterialityTopics } from "@/lib/ai-services";
import { logger } from "@/lib/logger";
import { useToast } from "@/components/ui/use-toast";
import { useErrorHandler } from "@/lib/error-utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  InfoIcon,
  Download,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MaterialityMatrixChart from "./MaterialityMatrixChart";

interface MaterialityTopic {
  id: string;
  name: string;
  category: "environmental" | "social" | "governance";
  stakeholderImpact: number;
  businessImpact: number;
  description: string;
}

interface MaterialityMatrixProps {
  topics?: MaterialityTopic[];
  onTopicUpdate?: (topics: MaterialityTopic[]) => void;
  readOnly?: boolean;
}

const defaultTopics: MaterialityTopic[] = [
  {
    id: "1",
    name: "Climate Change",
    category: "environmental",
    stakeholderImpact: 0.8,
    businessImpact: 0.7,
    description:
      "Addressing greenhouse gas emissions and climate adaptation strategies",
  },
  {
    id: "2",
    name: "Water Management",
    category: "environmental",
    stakeholderImpact: 0.6,
    businessImpact: 0.5,
    description: "Water usage, conservation, and quality management",
  },
  {
    id: "3",
    name: "Waste & Hazardous Materials",
    category: "environmental",
    stakeholderImpact: 0.5,
    businessImpact: 0.6,
    description:
      "Waste reduction, recycling, and hazardous materials management",
  },
  {
    id: "4",
    name: "Diversity & Inclusion",
    category: "social",
    stakeholderImpact: 0.7,
    businessImpact: 0.6,
    description: "Workforce diversity, equity, and inclusion practices",
  },
  {
    id: "5",
    name: "Labor Practices",
    category: "social",
    stakeholderImpact: 0.5,
    businessImpact: 0.7,
    description:
      "Fair labor practices, working conditions, and employee rights",
  },
  {
    id: "6",
    name: "Data Privacy & Security",
    category: "governance",
    stakeholderImpact: 0.9,
    businessImpact: 0.8,
    description: "Protection of sensitive data and cybersecurity measures",
  },
  {
    id: "7",
    name: "Board Composition",
    category: "governance",
    stakeholderImpact: 0.4,
    businessImpact: 0.6,
    description: "Board diversity, independence, and expertise",
  },
  {
    id: "8",
    name: "Business Ethics",
    category: "governance",
    stakeholderImpact: 0.7,
    businessImpact: 0.9,
    description: "Ethical business conduct, anti-corruption, and transparency",
  },
];

const MaterialityMatrix = ({
  topics = defaultTopics,
  onTopicUpdate,
  readOnly = false,
}: MaterialityMatrixProps) => {
  const navigate = useNavigate();
  const materialityAppContext = useAppContext();
  const { toast } = useToast();
  const { handleAsync } = useErrorHandler();
  const [matrixTopics, setMatrixTopics] = useState<MaterialityTopic[]>(topics);
  const [selectedTopic, setSelectedTopic] = useState<MaterialityTopic | null>(
    null,
  );
  const [filter, setFilter] = useState<
    "all" | "environmental" | "social" | "governance"
  >("all");
  const [zoom, setZoom] = useState<number>(1);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setMatrixTopics(topics);
  }, [topics]);

  // Save material topics
  const handleSave = async () => {
    setIsSaving(true);
    
    const result = await handleAsync(
      async () => {
        materialityAppContext.updateMaterialityTopics(matrixTopics);
        await materialityAppContext.saveMaterialityTopics();
        setIsSaved(true);
        return true;
      },
      {
        errorMessage: "Error saving materiality topics",
        successMessage: "Materiality topics saved successfully",
        showErrorToast: true,
        showSuccessToast: true
      }
    );
    
    setIsSaving(false);
  };

  // Function to proceed to plan generator
  const handleProceedToPlan = useCallback(() => {
    materialityAppContext.updateMaterialityTopics(matrixTopics);
    navigate("/plan-generator");
  }, [materialityAppContext, matrixTopics, navigate]);

  const handleTopicUpdate = useCallback((updatedTopic: MaterialityTopic) => {
    setMatrixTopics(prevTopics => 
      prevTopics.map(topic => topic.id === updatedTopic.id ? updatedTopic : topic)
    );
    setSelectedTopic(updatedTopic);
    if (onTopicUpdate) {
      onTopicUpdate(matrixTopics.map(topic => 
        topic.id === updatedTopic.id ? updatedTopic : topic
      ));
    }
  }, [onTopicUpdate, matrixTopics]);

  const filteredTopics = matrixTopics.filter((topic) =>
    filter === "all" ? true : topic.category === filter,
  );

  const handleReset = () => {
    setZoom(1);
    setFilter("all");
  };

  const generateAITopics = async () => {
    setIsGeneratingTopics(true);
    setAiError(null);

    try {
      // Get industry, size, and region from the context if available
      const industry =
        materialityAppContext.questionnaireData?.["industry-selection"]?.industry || "General";
      const size =
        materialityAppContext.questionnaireData?.["company-profile"]?.employeeCount ||
        "Medium Enterprise";
      const region =
        materialityAppContext.questionnaireData?.["regulatory-requirements"]?.primaryRegion ||
        "Global";

      // First try to use the tailored recommendations if available
      try {
        const { getTailoredRecommendations, parseRecommendations } =
          await import("@/lib/tailored-recommendations");

        const response = await getTailoredRecommendations({
          surveyAnswers: materialityAppContext.questionnaireData || {},
          materialityTopics: matrixTopics || [],
        });

        if (response.success && !response.error) {
          const parsed = parseRecommendations(response.recommendations.content);

          if (parsed.materialityTopics && parsed.materialityTopics.length > 0) {
            // Update the topics
            setMatrixTopics(parsed.materialityTopics);
            if (onTopicUpdate) {
              onTopicUpdate(parsed.materialityTopics);
            }
            setIsGeneratingTopics(false);
            return;
          }
        }
      } catch (tailoredError) {
        logger.error("Error using tailored recommendations", tailoredError);
        // Fall back to the original method if tailored recommendations fail
      }

      // Fall back to the original method
      const result = await analyzeMaterialityTopics(industry, size, region);

      if (result.error) {
        setAiError(result.error);
        return;
      }

      // Parse the AI response to extract topics
      // This is a simplified implementation - in a real app, you'd want more robust parsing
      try {
        // Extract topics from the AI response text
        // This is a very basic implementation and would need to be enhanced
        const content = result.content;
        const topicMatches = content.match(
          /([\w\s&]+)\s*-\s*Stakeholder Impact:\s*([0-9.]+)\s*,\s*Business Impact:\s*([0-9.]+)/g,
        );

        if (topicMatches && topicMatches.length > 0) {
          const newTopics = topicMatches.map((match, index) => {
            const nameMatch = match.match(/([\w\s&]+)\s*-/);
            const stakeholderMatch = match.match(
              /Stakeholder Impact:\s*([0-9.]+)/,
            );
            const businessMatch = match.match(/Business Impact:\s*([0-9.]+)/);
            const descriptionMatch = match.match(/- (.+)$/);

            const name = nameMatch ? nameMatch[1].trim() : `Topic ${index + 1}`;
            const stakeholderImpact = stakeholderMatch
              ? parseFloat(stakeholderMatch[1])
              : 0.5;
            const businessImpact = businessMatch
              ? parseFloat(businessMatch[1])
              : 0.5;
            const description = descriptionMatch
              ? descriptionMatch[1].trim()
              : "";

            // Determine category based on topic name
            let category: "environmental" | "social" | "governance" =
              "environmental";
            if (
              /diversity|employee|human|community|social|health|safety/i.test(
                name,
              )
            ) {
              category = "social";
            } else if (/governance|board|ethics|compliance|risk/i.test(name)) {
              category = "governance";
            }

            return {
              id: `ai-${index}`,
              name,
              category,
              stakeholderImpact,
              businessImpact,
              description:
                description ||
                `${name} is an important ESG topic for your industry.`,
            };
          });

          // Update the topics
          if (newTopics.length > 0) {
            setMatrixTopics(newTopics);
            if (onTopicUpdate) {
              onTopicUpdate(newTopics);
            }
          }
        } else {
          setAiError(
            "Could not extract topics from AI response. Please try again.",
          );
        }
      } catch (parseError) {
        logger.error("Error parsing AI response", parseError);
        setAiError("Error parsing AI recommendations. Please try again.");
      }
    } catch (err) {
      logger.error("Error generating AI topics", err);
      setAiError(
        err.message || "Failed to generate AI topics. Please try again.",
      );
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  const categoryColors = {
    environmental: "bg-green-500",
    social: "bg-blue-500",
    governance: "bg-purple-500",
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Materiality Matrix</CardTitle>
            <CardDescription>
              Visualize ESG topics by stakeholder and business impact
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoom(Math.min(zoom + 0.2, 1.5))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom In</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom Out</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset View</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download Matrix</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={generateAITopics}
                    disabled={isGeneratingTopics}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate AI Topics</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <Tabs
            defaultValue="all"
            value={filter}
            onValueChange={(value) => setFilter(value as any)}
          >
            <TabsList>
              <TabsTrigger value="all">All Topics</TabsTrigger>
              <TabsTrigger value="environmental">Environmental</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="governance">Governance</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent>
        <div className="border rounded-md p-4">
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="matrix">Matrix View</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="w-full">
              <MaterialityMatrixChart
                topics={filteredTopics}
                onTopicClick={setSelectedTopic}
                selectedTopicId={selectedTopic?.id}
              />
            </TabsContent>

            <TabsContent value="matrix">
              <div
                className="relative h-[500px]"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center",
                }}
              >
                {/* Matrix Axes */}
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  <div className="w-full text-center font-medium text-sm">
                    High Stakeholder Impact
                  </div>
                  <div className="w-full text-center font-medium text-sm">
                    Low Stakeholder Impact
                  </div>
                </div>
                <div className="absolute inset-0 flex justify-between items-center p-4">
                  <div className="h-full flex items-center">
                    <div className="transform -rotate-90 font-medium text-sm whitespace-nowrap">
                      Low Business Impact
                    </div>
                  </div>
                  <div className="h-full flex items-center">
                    <div className="transform -rotate-90 font-medium text-sm whitespace-nowrap">
                      High Business Impact
                    </div>
                  </div>
                </div>

                {/* Quadrant Labels */}
                <div className="absolute inset-0">
                  <div className="absolute top-[25%] left-[25%] transform -translate-x-1/2 -translate-y-1/2 text-xs text-gray-500">
                    Monitor
                  </div>
                  <div className="absolute top-[25%] right-[25%] transform translate-x-1/2 -translate-y-1/2 text-xs text-gray-500">
                    Manage
                  </div>
                  <div className="absolute bottom-[25%] left-[25%] transform -translate-x-1/2 translate-y-1/2 text-xs text-gray-500">
                    Consider
                  </div>
                  <div className="absolute bottom-[25%] right-[25%] transform translate-x-1/2 translate-y-1/2 text-xs font-medium">
                    Focus
                  </div>
                </div>

                {/* Grid Lines */}
                <div className="absolute inset-0">
                  <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-300"></div>
                  <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-gray-300"></div>
                </div>

                {/* Topics */}
                {filteredTopics.map((topic) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`absolute cursor-pointer rounded-full flex items-center justify-center ${selectedTopic?.id === topic.id ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                    style={{
                      left: `${topic.businessImpact * 100}%`,
                      bottom: `${topic.stakeholderImpact * 100}%`,
                      width: "40px",
                      height: "40px",
                      transform: "translate(-50%, 50%)",
                    }}
                    onClick={() => setSelectedTopic(topic)}
                  >
                    <div
                      className={`w-full h-full rounded-full ${categoryColors[topic.category]} flex items-center justify-center text-white font-bold`}
                    >
                      {topic.name.substring(0, 2)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {selectedTopic && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{selectedTopic.name}</h3>
                <p className="text-sm text-gray-600">
                  {selectedTopic.description}
                </p>
                <div
                  className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor:
                      selectedTopic.category === "environmental"
                        ? "rgba(34, 197, 94, 0.2)"
                        : selectedTopic.category === "social"
                          ? "rgba(59, 130, 246, 0.2)"
                          : "rgba(168, 85, 247, 0.2)",
                    color:
                      selectedTopic.category === "environmental"
                        ? "rgb(22, 101, 52)"
                        : selectedTopic.category === "social"
                          ? "rgb(30, 64, 175)"
                          : "rgb(107, 33, 168)",
                  }}
                >
                  {selectedTopic.category.charAt(0).toUpperCase() +
                    selectedTopic.category.slice(1)}
                </div>
              </div>

              {!readOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTopic(null)}
                >
                  Close
                </Button>
              )}
            </div>

            {!readOnly && (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium">
                      Stakeholder Impact:{" "}
                      {selectedTopic.stakeholderImpact.toFixed(1)}
                    </label>
                  </div>
                  <Slider
                    value={[selectedTopic.stakeholderImpact * 100]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => {
                      handleTopicUpdate({
                        ...selectedTopic,
                        stakeholderImpact: value[0] / 100,
                      });
                    }}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium">
                      Business Impact: {selectedTopic.businessImpact.toFixed(1)}
                    </label>
                  </div>
                  <Slider
                    value={[selectedTopic.businessImpact * 100]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => {
                      handleTopicUpdate({
                        ...selectedTopic,
                        businessImpact: value[0] / 100,
                      });
                    }}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Category
                  </label>
                  <Select
                    value={selectedTopic.category}
                    onValueChange={(value) => {
                      handleTopicUpdate({
                        ...selectedTopic,
                        category: value as
                          | "environmental"
                          | "social"
                          | "governance",
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="environmental">
                        Environmental
                      </SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="governance">Governance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )}

        {aiError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{aiError}</AlertDescription>
          </Alert>
        )}

        {isGeneratingTopics && (
          <div className="mt-4 p-4 border rounded-md bg-primary/5">
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <p>
                Generating AI-powered materiality topics based on your industry
                and company profile...
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Environmental</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs">Social</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-xs">Governance</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              variant="outline"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button onClick={handleProceedToPlan}>
              Continue to Plan Generator
            </Button>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm">
                  <InfoIcon className="h-4 w-4 mr-1" /> How to use
                </Button>
              </TooltipTrigger>
              <TooltipContent className="w-80 p-4">
                <p className="font-medium">Using the Materiality Matrix</p>
                <ul className="mt-2 text-sm space-y-1 list-disc pl-4">
                  <li>Topics in the top-right quadrant are high priority</li>
                  <li>
                    Click on any topic to view details or adjust its position
                  </li>
                  <li>Filter topics by category using the tabs above</li>
                  <li>Use zoom controls to focus on specific areas</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaterialityMatrix;
