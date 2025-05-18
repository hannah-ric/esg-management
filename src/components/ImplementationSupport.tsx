import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { stripeService } from "../lib/stripe-service";
import { LoadingSpinner } from "./LoadingSpinner";

export function ImplementationSupport() {
  const [functionSlug, setFunctionSlug] = useState("");
  const [projectRef, setProjectRef] = useState("");
  const [functionName, setFunctionName] = useState("");
  const [functionBody, setFunctionBody] = useState("");
  const [verifyJwt, setVerifyJwt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let parsedBody = {};
      if (functionBody) {
        try {
          parsedBody = JSON.parse(functionBody);
        } catch (err) {
          throw new Error("Function body must be valid JSON");
        }
      }

      const params = {
        function_slug: functionSlug,
        ref: projectRef,
        name: functionName || undefined,
        body: Object.keys(parsedBody).length > 0 ? parsedBody : undefined,
        verify_jwt: verifyJwt,
      };

      const result = await stripeService.updateSupabaseFunction(params);
      setResult(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Deploy Supabase Function</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="functionSlug"
            className="block text-sm font-medium mb-1"
          >
            Function Slug *
          </label>
          <Input
            id="functionSlug"
            value={functionSlug}
            onChange={(e) => setFunctionSlug(e.target.value)}
            placeholder="my-function-name"
            required
          />
        </div>

        <div>
          <label
            htmlFor="projectRef"
            className="block text-sm font-medium mb-1"
          >
            Project Reference * (20 characters)
          </label>
          <Input
            id="projectRef"
            value={projectRef}
            onChange={(e) => setProjectRef(e.target.value)}
            placeholder="abcdefghijklmnopqrst"
            required
            maxLength={20}
            minLength={20}
          />
          {projectRef && projectRef.length !== 20 && (
            <p className="text-red-500 text-xs mt-1">
              Project reference must be exactly 20 characters
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="functionName"
            className="block text-sm font-medium mb-1"
          >
            Function Name (optional)
          </label>
          <Input
            id="functionName"
            value={functionName}
            onChange={(e) => setFunctionName(e.target.value)}
            placeholder="My Function"
          />
        </div>

        <div>
          <label
            htmlFor="functionBody"
            className="block text-sm font-medium mb-1"
          >
            Function Body - JSON (optional)
          </label>
          <Textarea
            id="functionBody"
            value={functionBody}
            onChange={(e) => setFunctionBody(e.target.value)}
            placeholder='{"key": "value"}'
            rows={5}
          />
        </div>

        <div className="flex items-center">
          <input
            id="verifyJwt"
            type="checkbox"
            checked={verifyJwt}
            onChange={(e) => setVerifyJwt(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor="verifyJwt" className="ml-2 block text-sm">
            Verify JWT
          </label>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <LoadingSpinner size="sm" /> : "Deploy Function"}
        </Button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {result && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Deployment Result:</h3>
          <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
