import React, { useState } from "react";
// import { logger } from "@/lib/logger"; // Commented out unused logger
import { 
  analyzeExternalContent, 
  searchResourceLibrary, 
  generateAIRecommendations, 
  AnalyzedContentESGData 
} from "@/lib/plan-enhancement";
import type { EnhancedPlanData } from "@/lib/plan-enhancement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, AlertCircle, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TailoredRecommendations from "@/components/TailoredRecommendations";
import type { ESGPlan, MaterialityTopic } from "@/components/AppContext";
import type { ParsedRecommendations } from "@/lib/tailored-recommendations";

interface AnalyzedUrlData { 
  [key: string]: unknown;
  id?: string;
  title: string;
  url: string;
  category: string;
  type: string;
  description: string;
  tags: string[];
  rawContent?: string;
  esgData?: AnalyzedContentESGData;
}

interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  category: string;
  // Add other relevant fields from the 'resources' table that searchResourceLibrary returns
}

interface UrlAnalysisEnhancement {
  source: "diffbot" | "url_analysis"; // Keeping 'diffbot' if it was a possible source name
  type: "url_analysis";
  data: AnalyzedUrlData; 
}

interface ResourceSelectionEnhancement {
  source: "resource_library";
  type: "resource_selection";
  data: SearchResultItem[];
}

interface AiRecommendationsEnhancement {
  source: "ai";
  type: "ai_recommendations";
  data: EnhancedPlanData | null; // From plan-enhancement.ts
}

interface TailoredRecommendationsEnhancement {
  source: "tailored";
  type: "tailored_recommendations";
  data: ParsedRecommendations; // From tailored-recommendations.ts
}

type EnhancementData = 
  | UrlAnalysisEnhancement 
  | ResourceSelectionEnhancement 
  | AiRecommendationsEnhancement
  | TailoredRecommendationsEnhancement;

interface PlanGeneratorEnhancedProps {
  onEnhancementComplete?: (data: EnhancementData) => void; // Typed data
  companyName?: string;
  industry?: string;
  materialityTopics?: Partial<MaterialityTopic>[];
  esgPlan?: Partial<ESGPlan>;
}

const PlanGeneratorEnhanced: React.FC<PlanGeneratorEnhancedProps> = ({
  onEnhancementComplete,
  companyName = "",
  industry = "",
  materialityTopics = [],
  esgPlan = null,
}) => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("url");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<EnhancedPlanData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResults, setSelectedResults] = useState<SearchResultItem[]>([]);

  const analyzeUrl = async () => {
    if (!url) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await analyzeExternalContent(url);
      if (onEnhancementComplete && data) {
        onEnhancementComplete({
          source: "diffbot",
          type: "url_analysis",
          data: data as unknown as AnalyzedUrlData,
        });
      }
    } catch (err) {
      setError("Failed to analyze the URL. Please try again.");
    }
    
    setIsAnalyzing(false);
  };

  const searchResources = async () => {
    if (!searchQuery) return;

    setIsSearching(true);
    setError(null);

    try {
      const { results } = await searchResourceLibrary(searchQuery);
      setSearchResults(results as SearchResultItem[]);
    } catch (err) {
      setError("Failed to search resources. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const toggleResultSelection = (result: SearchResultItem) => {
    if (selectedResults.some((r) => r.id === result.id)) {
      setSelectedResults(selectedResults.filter((r) => r.id !== result.id));
    } else {
      setSelectedResults([...selectedResults, result]);
    }
  };

  const applySelectedResources = () => {
    if (selectedResults.length === 0) return;

    if (onEnhancementComplete) {
      onEnhancementComplete({
        source: "resource_library",
        type: "resource_selection",
        data: selectedResults,
      });
    }
  };

  const generateIndustrySearch = () => {
    if (!industry) return;
    setSearchQuery(industry);
    searchResources();
  };

  const handleGenerateAIRecommendations = async () => {
    setIsGeneratingAI(true);
    setError(null);

    const result = await generateAIRecommendations({
      companyName,
      industry,
      materialityTopics,
      esgPlan: esgPlan || {},
    });
    
    if (result.success) {
      setAiRecommendations({ recommendations: result.recommendations });

      if (onEnhancementComplete) {
        onEnhancementComplete({
          source: "ai",
          type: "ai_recommendations",
          data: result.recommendations,
        });
      }
    } else {
      setError(result.error || "Failed to generate AI recommendations. Please try again.");
    }
    
    setIsGeneratingAI(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Enhance Your ESG Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="url">Analyze External Content</TabsTrigger>
            <TabsTrigger value="search">Search Resource Library</TabsTrigger>
            <TabsTrigger value="ai">AI Recommendations</TabsTrigger>
            <TabsTrigger value="tailored">Tailored Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Enter the URL of a sustainability report, ESG policy, or other
                relevant document to analyze and incorporate into your plan.
              </p>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com/sustainability-report.pdf"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={analyzeUrl} disabled={isAnalyzing || !url}>
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
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Search our resource library for relevant ESG frameworks,
                templates, and guides to enhance your plan.
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search for ESG resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={searchResources}
                  disabled={isSearching || !searchQuery}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {industry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateIndustrySearch}
                  className="mt-2"
                >
                  Search for {industry} resources
                </Button>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Search Results</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((resultItem: SearchResultItem) => (
                    <div
                      key={resultItem.id}
                      className={`p-3 border rounded-md cursor-pointer ${selectedResults.some((r) => r.id === resultItem.id) ? "border-primary bg-primary/5" : ""}`}
                      onClick={() => toggleResultSelection(resultItem)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{resultItem.title}</h4>
                        <div className="text-xs bg-muted px-2 py-1 rounded">
                          {resultItem.category}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {resultItem.description}
                      </p>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={applySelectedResources}
                  disabled={selectedResults.length === 0}
                  className="w-full"
                >
                  Apply {selectedResults.length} Selected Resources
                </Button>
              </div>
            )}

            {isSearching && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Searching resources...
                </p>
              </div>
            )}

            {!isSearching && searchQuery && searchResults.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No resources found matching your search.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Generate AI-powered recommendations to enhance your ESG plan
                based on your company profile, industry, and materiality
                assessment.
              </p>
              <Button
                onClick={handleGenerateAIRecommendations}
                disabled={isGeneratingAI}
                className="w-full"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Recommendations
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate AI Recommendations
                  </>
                )}
              </Button>
            </div>

            {aiRecommendations && (
              <div className="space-y-4 mt-4">
                <div className="border rounded-md p-4 bg-primary/5">
                  <h3 className="font-medium mb-2">
                    Framework Recommendations
                  </h3>
                  <div className="text-sm whitespace-pre-line">
                    {typeof aiRecommendations.frameworks === 'string' 
                      ? aiRecommendations.frameworks 
                      : aiRecommendations.frameworks && typeof aiRecommendations.frameworks === 'object' && 'content' in aiRecommendations.frameworks 
                        ? String(aiRecommendations.frameworks.content) 
                        : "No framework recommendations available."}
                  </div>
                </div>

                {aiRecommendations.resources && (
                  <div className="border rounded-md p-4 bg-primary/5">
                    <h3 className="font-medium mb-2">
                      Resource Recommendations
                    </h3>
                    <div className="text-sm whitespace-pre-line">
                      {typeof aiRecommendations.resources === 'string'
                        ? aiRecommendations.resources
                        : aiRecommendations.resources && typeof aiRecommendations.resources === 'object' && 'content' in aiRecommendations.resources
                          ? String(aiRecommendations.resources.content)
                          : "No resource recommendations available."}
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="tailored">
            <TailoredRecommendations
              onApplyRecommendations={(recommendations) => {
                if (onEnhancementComplete) {
                  onEnhancementComplete({
                    source: "tailored",
                    type: "tailored_recommendations",
                    data: recommendations,
                  });
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PlanGeneratorEnhanced;
