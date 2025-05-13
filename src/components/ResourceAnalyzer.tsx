import React, { useState } from "react";
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
import { Loader2, Link as LinkIcon, Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface ResourceAnalyzerProps {
  onResourceAdded?: (resource: any) => void;
}

const ResourceAnalyzer: React.FC<ResourceAnalyzerProps> = ({
  onResourceAdded,
}) => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeUrl = async () => {
    if (!url) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-analyze-esg-content",
        {
          body: { url },
        },
      );

      if (error) throw new Error(error.message);

      setResult(data);
      if (onResourceAdded && data) {
        onResourceAdded(data);
      }
    } catch (err) {
      console.error("Error analyzing URL:", err);
      setError(err.message || "Failed to analyze the URL. Please try again.");
    } finally {
      setIsAnalyzing(false);
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Analyze ESG Content</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="Enter URL of ESG report, article, or resource"
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
