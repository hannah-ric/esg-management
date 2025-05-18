import { useState } from "react";
import { analyzeExternalContent } from "@/lib/plan-enhancement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ContentAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Call the service function that invokes the Edge Function
      const response = await analyzeExternalContent(url);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Analyze Content with Diffbot</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL to Analyze</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Content"}
          </Button>
        </form>
      </CardContent>

      {error && (
        <CardFooter className="flex flex-col items-start">
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardFooter>
      )}

      {result && (
        <CardFooter className="flex flex-col items-start">
          <p className="font-medium">Analysis Results:</p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto w-full mt-2 max-h-60">
            {JSON.stringify(result, null, 2)}
          </pre>
        </CardFooter>
      )}
    </Card>
  );
}
