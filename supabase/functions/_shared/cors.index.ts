// Export all named exports from cors module
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export function setCorsHeaders(headers: Headers): void {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
}

export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}
