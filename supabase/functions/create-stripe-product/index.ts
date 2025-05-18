import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "@shared/cors";

const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
const PICA_STRIPE_CONNECTION_KEY = Deno.env.get("PICA_STRIPE_CONNECTION_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { name, description, active, default_price_data } = await req.json();

    // Validate required fields
    if (!name) {
      return new Response(
        JSON.stringify({ error: "Product name is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Prepare form data for Stripe API
    const formData = new URLSearchParams();
    formData.append("name", name);

    if (description) formData.append("description", description);
    if (active !== undefined) formData.append("active", String(active));

    // Add default price data if provided
    if (default_price_data) {
      if (default_price_data.currency) {
        formData.append(
          "default_price_data[currency]",
          default_price_data.currency,
        );
      }
      if (default_price_data.unit_amount) {
        formData.append(
          "default_price_data[unit_amount]",
          String(default_price_data.unit_amount),
        );
      }
      if (default_price_data.recurring) {
        if (default_price_data.recurring.interval) {
          formData.append(
            "default_price_data[recurring][interval]",
            default_price_data.recurring.interval,
          );
        }
        if (default_price_data.recurring.interval_count) {
          formData.append(
            "default_price_data[recurring][interval_count]",
            String(default_price_data.recurring.interval_count),
          );
        }
      }
    }

    // Call Stripe API through Pica passthrough
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-pica-secret": PICA_SECRET_KEY || "",
          "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY || "",
          "x-pica-action-id":
            "conn_mod_def::GCmLdKrDHVE::cHqI6YiXQxGPMzx0NJl2OQ",
        },
        body: formData.toString(),
      },
    );

    const data = await response.json();

    // Return the response with CORS headers
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: response.status,
    });
  } catch (error) {
    // Handle errors
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
