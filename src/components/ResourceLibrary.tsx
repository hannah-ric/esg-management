import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  // CardContent, // Unused
  // CardDescription, // Unused
  // CardFooter, // Unused
  // CardHeader, // Unused
  // CardTitle, // Unused
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  FileText,
  BookOpen,
  FileSpreadsheet,
  Download,
  ExternalLink,
  // Filter, // Unused
  Plus,
  Sparkles,
  Loader2,
  AlertCircle,
  Upload,
  Target,
  FileDown,
  Edit,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator"; // Unused
import ResourceAnalyzer from "./ResourceAnalyzer";
import ResourceUploader from "./ResourceUploader";
import ResourceExporter from "./ResourceExporter";
import { supabase } from "@/lib/supabase";
import {
  getResourceRecommendations,
  getMaterialityBasedResources,
} from "@/lib/ai-services";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAppContext } from "./AppContext";
import type { AnalyzedContentResult } from "@/lib/plan-enhancement";

interface UploadedResourceData {
  id?: string;
  title: string;
  description: string;
  type: string;
  category: string;
  fileType?: string;
  url: string;
  file_path?: string;
  tags?: string[];
  rawContent?: string;
}

// Sample resource data as fallback - MOVED OUTSIDE COMPONENT
const sampleResources: ResourceItem[] = [
  {
    id: "1",
    title: "GRI Standards Implementation Guide",
    description:
      "Comprehensive guide to implementing the Global Reporting Initiative (GRI) Standards in your ESG reporting.",
    type: "guide",
    category: "general",
    framework: "GRI",
    fileType: "pdf",
    url: "#",
    dateAdded: "2023-06-15",
  },
  {
    id: "2",
    title: "Carbon Emissions Calculation Template",
    description:
      "Excel template for calculating and tracking Scope 1, 2, and 3 greenhouse gas emissions.",
    type: "template",
    category: "environmental",
    framework: "GHG Protocol",
    fileType: "xlsx",
    url: "#",
    dateAdded: "2023-07-22",
  },
  {
    id: "3",
    title: "SASB Industry Standards - Manufacturing",
    description:
      "Sustainability Accounting Standards Board (SASB) disclosure topics and metrics for the manufacturing sector.",
    type: "framework",
    category: "general",
    framework: "SASB",
    fileType: "pdf",
    url: "#",
    dateAdded: "2023-05-10",
  },
  {
    id: "4",
    title: "Diversity & Inclusion Policy Template",
    description:
      "Customizable template for creating a comprehensive diversity and inclusion policy for your organization.",
    type: "template",
    category: "social",
    fileType: "docx",
    url: "#",
    dateAdded: "2023-08-05",
  },
  {
    id: "5",
    title: "ESG Data Collection Methodology",
    description:
      "Best practices for establishing robust ESG data collection processes and systems.",
    type: "guide",
    category: "general",
    fileType: "pdf",
    url: "#",
    dateAdded: "2023-09-12",
  },
  {
    id: "6",
    title: "TCFD Climate Risk Assessment Framework",
    description:
      "Task Force on Climate-related Financial Disclosures (TCFD) framework for assessing and reporting climate-related risks.",
    type: "framework",
    category: "environmental",
    framework: "TCFD",
    fileType: "pdf",
    url: "#",
    dateAdded: "2023-04-18",
  },
  {
    id: "7",
    title: "Board ESG Oversight Guide",
    description:
      "Guide for establishing effective board oversight of ESG matters and integrating sustainability into governance.",
    type: "guide",
    category: "governance",
    fileType: "pdf",
    url: "#",
    dateAdded: "2023-07-30",
  },
  {
    id: "8",
    title: "Sustainable Supply Chain Case Study",
    description:
      "Case study on implementing sustainable practices throughout the supply chain in a manufacturing company.",
    type: "case-study",
    category: "environmental",
    fileType: "pdf",
    url: "#",
    dateAdded: "2023-08-22",
  },
];

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  type: "guide" | "template" | "framework" | "case-study" | "article" | "unknown";
  category: "environmental" | "social" | "governance" | "general" | "unknown";
  framework?: string;
  fileType?: "pdf" | "xlsx" | "docx" | "url" | "unknown";
  url: string;
  dateAdded: string;
  source?: string;
  file_path?: string;
  tags?: string[];
  rawContent?: string;
}

interface ResourceItemFromDB {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  framework?: string;
  file_type?: string;
  url: string;
  date_added?: string;
  source?: string;
  tags?: string[];
  rawContent?: string;
}

// Helper functions moved outside of component to be accessible by ResourceCard
const getFileTypeIcon = (fileType: string | undefined) => {
  switch (fileType) {
    case "pdf":
      return <FileText className="h-4 w-4" />;
    case "xlsx":
      return <FileSpreadsheet className="h-4 w-4" />;
    case "docx":
      return <FileText className="h-4 w-4" />;
    case "url":
      return <ExternalLink className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
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
      return type;
  }
};

const ResourceLibrary: React.FC = () => {
  const navigate = useNavigate();
  const { questionnaireData, esgPlan, materialityTopics, user } =
    useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] =
    useState(false);
  const [
    isGeneratingMaterialityRecommendations,
    setIsGeneratingMaterialityRecommendations,
  ] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string | null>(
    null,
  );
  const [materialityRecommendations, setMaterialityRecommendations] = useState<
    string | null
  >(null);
  const [recommendedResources, setRecommendedResources] = useState<
    ResourceItem[]
  >([]);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from("resources").select("*");
        if (error) throw error;

        if (data && data.length > 0) {
          const formattedResources = (data as ResourceItemFromDB[]).map((item): ResourceItem => {
            const allowedTypes: ResourceItem['type'][] = ["guide", "template", "framework", "case-study", "article"];
            const allowedCategories: ResourceItem['category'][] = ["environmental", "social", "governance", "general"];
            const allowedFileTypes: NonNullable<ResourceItem['fileType']>[] = ["pdf", "xlsx", "docx", "url"];

            const validatedType = item.type && allowedTypes.includes(item.type as ResourceItem['type']) 
              ? item.type as ResourceItem['type'] 
              : "unknown";
            const validatedCategory = item.category && allowedCategories.includes(item.category as ResourceItem['category']) 
              ? item.category as ResourceItem['category'] 
              : "unknown";
            const validatedFileType = item.file_type && allowedFileTypes.includes(item.file_type as NonNullable<ResourceItem['fileType']>) 
              ? item.file_type as NonNullable<ResourceItem['fileType']>
              : "unknown";

            return {
              id: item.id,
              title: item.title || "Untitled Resource",
              description: item.description || "",
              type: validatedType,
              category: validatedCategory,
              framework: item.framework || undefined,
              fileType: validatedFileType,
              url: item.url || "#",
              dateAdded: item.date_added ? new Date(item.date_added).toLocaleDateString() : new Date().toLocaleDateString(),
              source: item.source || undefined,
              tags: item.tags || [],
              rawContent: item.rawContent || undefined,
            };
          });
          setResources(formattedResources);
        } else {
          setResources(sampleResources);
        }
      } catch (fetchErr) {
        console.error("Error fetching resources:", fetchErr);
        setResources(sampleResources);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, []);

  const handleResourceAdded = (newResource: AnalyzedContentResult | UploadedResourceData) => {
    let ft: string | undefined;
    if ('fileType' in newResource && typeof newResource.fileType === 'string') {
      ft = newResource.fileType;
    } else if ('file_path' in newResource && typeof newResource.file_path === 'string') {
      ft = newResource.file_path.split('.').pop() || "unknown";
    }

    let src: string | undefined;
    if ('source' in newResource && typeof newResource.source === 'string') {
      src = newResource.source;
    } else if ('url' in newResource && typeof newResource.url === 'string') { 
      src = newResource.url;
    }

    let addedDateStr: string | undefined;
    if ('date_added' in newResource && typeof newResource.date_added === 'string') {
        addedDateStr = newResource.date_added;
    }
    const dateAdded = addedDateStr ? new Date(addedDateStr).toLocaleDateString() : new Date().toLocaleDateString();
    
    const tagsArray = 'tags' in newResource && Array.isArray(newResource.tags) ? newResource.tags : [];
    const frameworkStr = 'framework' in newResource && typeof newResource.framework === 'string' ? newResource.framework : undefined;

    const allowedTypes: ResourceItem['type'][] = ["guide", "template", "framework", "case-study", "article"];
    const allowedCategories: ResourceItem['category'][] = ["environmental", "social", "governance", "general"];
    const allowedFileTypes: NonNullable<ResourceItem['fileType']>[] = ["pdf", "xlsx", "docx", "url"];

    const validatedType = newResource.type && allowedTypes.includes(newResource.type as ResourceItem['type']) 
      ? newResource.type as ResourceItem['type'] 
      : "unknown";
    const validatedCategory = newResource.category && allowedCategories.includes(newResource.category as ResourceItem['category']) 
      ? newResource.category as ResourceItem['category'] 
      : "unknown";
    const validatedFileType = ft && allowedFileTypes.includes(ft as NonNullable<ResourceItem['fileType']>) 
      ? ft as NonNullable<ResourceItem['fileType']>
      : "unknown";

    const resourceItem: ResourceItem = {
      id: newResource.id || `new-${Date.now()}`,
      title: newResource.title || "Untitled Resource",
      description: newResource.description || "",
      type: validatedType, 
      category: validatedCategory,
      fileType: validatedFileType,
      url: newResource.url || "#",
      dateAdded: dateAdded,
      source: src,
      tags: tagsArray,
      framework: frameworkStr,
      rawContent: newResource.rawContent || undefined,
    };

    setResources((prevResources) => [resourceItem, ...prevResources]);
    setIsAnalyzerOpen(false);
    setIsUploaderOpen(false);
  };

  const generateMaterialityRecommendations = async () => {
    if (!materialityTopics || materialityTopics.length === 0) {
      setAiError(
        "No materiality topics found. Please complete the materiality assessment first.",
      );
      return;
    }

    setIsGeneratingMaterialityRecommendations(true);
    setAiError(null);

    try {
      // Get recommendations based on materiality topics
      const result = await getMaterialityBasedResources(materialityTopics);

      if (result.error) {
        setAiError(result.error);
        return;
      }

      setMaterialityRecommendations(result.content);

      // Extract topic names from high priority materiality topics
      const highPriorityTopics = materialityTopics
        .filter(
          (topic) =>
            topic.stakeholderImportance > 0.6 && topic.businessImpact > 0.6,
        )
        .map((topic) => topic.name);

      // Search for resources related to these topics
      if (highPriorityTopics.length > 0) {
        const { data } = await supabase
          .from("resources")
          .select("*")
          .or(
            highPriorityTopics
              .map(
                (topic) =>
                  `title.ilike.%${topic}%,description.ilike.%${topic}%`,
              )
              .join(","),
          );

        if (data && data.length > 0) {
          // Map database resources to our ResourceItem format
          const recommendedItems = data.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            type: item.type,
            category: item.category,
            framework: item.framework,
            fileType: item.file_type || "url",
            url: item.url,
            dateAdded: new Date(item.date_added).toLocaleDateString(),
            rawContent: item.rawContent || undefined,
          }));

          setRecommendedResources(recommendedItems);
        }
      }
    } catch (err) {
      console.error("Error generating materiality recommendations:", err);
      let message = "Failed to generate recommendations based on materiality.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setAiError(message);
    } finally {
      setIsGeneratingMaterialityRecommendations(false);
    }
  };

  const generateAIRecommendations = async () => {
    if (!questionnaireData) {
      setAiError("Please complete the questionnaire first.");
      return;
    }

    setIsGeneratingRecommendations(true);
    setAiError(null);

    try {
      // Get company profile from context
      const companyProfile = {
        companyName:
          questionnaireData?.["company-profile"]?.companyName ||
          "Your Company",
        industry:
          questionnaireData?.["industry-selection"]?.industry ||
          "General",
        size:
          questionnaireData?.["company-profile"]?.employeeCount ||
          "Medium Enterprise",
        region:
          questionnaireData?.["regulatory-requirements"]
            ?.primaryRegion || "Global",
      };

      // Cast esgPlan to Record<string, unknown> to satisfy the parameter type
      const esgPlanAsRecord = esgPlan as unknown as Record<string, unknown>;

      // Get AI-powered resource recommendations
      const result = await getResourceRecommendations(
        esgPlanAsRecord,
        companyProfile,
        materialityTopics,
      );

      if (result.error) {
        setAiError(result.error);
        return;
      }

      setAiRecommendations(result.content);

      // Auto-search for the first recommended resource type
      const match = result.content.match(
        /recommend\s+([\w\s-]+)\s+resources/i,
      );
      if (match && match[1]) {
        setSearchQuery(match[1]);
      }
    } catch (err) {
      console.error("Error generating AI recommendations:", err);
      let message = "Failed to generate AI recommendations. Please try again.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setAiError(message);
    } finally {
      setIsGeneratingRecommendations(false);
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

  return (
    <div className="w-full bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Resource Library
            </h1>
            <p className="text-muted-foreground mt-1">
              Access guides, templates, frameworks, and best practices for ESG
              management
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="mt-4 md:mt-0"
              onClick={generateAIRecommendations}
              disabled={
                isGeneratingRecommendations ||
                !questionnaireData ||
                !materialityTopics ||
                materialityTopics.length === 0
              }
            >
              {isGeneratingRecommendations ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Recommendations
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="mt-4 md:mt-0"
              onClick={generateMaterialityRecommendations}
              disabled={
                isGeneratingMaterialityRecommendations ||
                !materialityTopics ||
                materialityTopics.length === 0
              }
            >
              {isGeneratingMaterialityRecommendations ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Materiality Recommendations
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="mt-4 md:mt-0"
              onClick={() => {
                navigate("/resources/bulk-export");
              }}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Bulk Export
            </Button>

            {/* Admin button - only shown to admin users */}
            {user && (
              <Button
                variant="outline"
                className="mt-4 md:mt-0"
                onClick={() => navigate("/resources/admin")}
              >
                <Edit className="mr-2 h-4 w-4" />
                Manage Resources
              </Button>
            )}

            <Dialog open={isAnalyzerOpen} onOpenChange={setIsAnalyzerOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Analyze URL
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Analyze ESG Resource</DialogTitle>
                </DialogHeader>
                <ResourceAnalyzer onResourceAdded={handleResourceAdded} />
              </DialogContent>
            </Dialog>

            <Dialog open={isUploaderOpen} onOpenChange={setIsUploaderOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Upload ESG Resource</DialogTitle>
                </DialogHeader>
                <ResourceUploader onResourceAdded={handleResourceAdded} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {aiRecommendations && (
          <div className="mb-6 p-4 border rounded-md bg-primary/5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-primary" />
                  AI Resource Recommendations
                </h3>
                <div className="text-sm whitespace-pre-line">
                  {aiRecommendations}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAiRecommendations(null)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {materialityRecommendations && (
          <div className="mb-6 p-4 border rounded-md bg-green-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-green-600" />
                  Materiality-Based Resource Recommendations
                </h3>
                <div className="text-sm whitespace-pre-line">
                  {materialityRecommendations}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMaterialityRecommendations(null)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {recommendedResources.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-600" />
              Recommended Resources Based on Your Materiality Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedResources.slice(0, 4).map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
            {recommendedResources.length > 4 && (
              <div className="mt-2 text-center">
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setTypeFilter("all");
                  }}
                >
                  View all {recommendedResources.length} recommended resources
                </Button>
              </div>
            )}
          </div>
        )}

        {aiError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{aiError}</AlertDescription>
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

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Resources</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-muted-foreground">
                  Loading resources...
                </p>
              </div>
            ) : filteredResources.length > 0 ? (
              filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No resources found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="guides" className="space-y-4">
            {filteredResources
              .filter((r) => r.type === "guide")
              .map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            {filteredResources
              .filter((r) => r.type === "template")
              .map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
          </TabsContent>

          <TabsContent value="frameworks" className="space-y-4">
            {filteredResources
              .filter((r) => r.type === "framework")
              .map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

interface ResourceCardProps {
  resource: ResourceItem;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  return (
    <Card className="overflow-hidden transition-all hover:border-primary/50">
      <div className="flex flex-col md:flex-row">
        <div className="flex-grow p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className={getCategoryColor(resource.category)}
                >
                  {resource.category.charAt(0).toUpperCase() +
                    resource.category.slice(1)}
                </Badge>
                <Badge variant="outline">{getTypeLabel(resource.type)}</Badge>
                {resource.framework && (
                  <Badge variant="outline">{resource.framework}</Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold">{resource.title}</h3>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-muted-foreground">
                {resource.dateAdded}
              </span>
            </div>
          </div>
          <p className="mt-2 text-muted-foreground">{resource.description}</p>
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Preview
              </Button>
              <Button size="sm">
                <Download className="mr-2 h-4 w-4" />
                {resource.fileType === "url"
                  ? "Open Link"
                  : `Download ${resource.fileType ? resource.fileType.toUpperCase() : 'FILE'}`}
              </Button>
            </div>
            <ResourceExporter resource={{
              id: resource.id || "",
              title: resource.title || "",
              description: resource.description || "",
              type: resource.type || "article",
              category: resource.category || "general",
              fileType: resource.fileType || "pdf",
              url: resource.url || "",
              rawContent: resource.rawContent
            }} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResourceLibrary;
