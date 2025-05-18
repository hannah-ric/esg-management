import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.index.ts";

const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
const PICA_STRIPE_CONNECTION_KEY = Deno.env.get("PICA_STRIPE_CONNECTION_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { country, email, business_type, business_profile } =
      await req.json();

    // Validate required fields
    if (!country || !email) {
      return new Response(
        JSON.stringify({ error: "Country and email are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Prepare form data for Stripe API
    const formData = new URLSearchParams();
    formData.append("country", country);
    formData.append("email", email);

    if (business_type) formData.append("business_type", business_type);

    // Add business profile data if provided
    if (business_profile) {
      if (business_profile.url) {
        formData.append("business_profile.url", business_profile.url);
      }

      if (business_profile.mcc) {
        formData.append("business_profile.mcc", business_profile.mcc);
      }

      if (business_profile.support_email) {
        formData.append(
          "business_profile.support_email",
          business_profile.support_email,
        );
      }

      if (business_profile.support_url) {
        formData.append(
          "business_profile.support_url",
          business_profile.support_url,
        );
      }

      // Handle support address if provided
      if (business_profile.support_address) {
        const address = business_profile.support_address;
        if (address.line1)
          formData.append(
            "business_profile.support_address.line1",
            address.line1,
          );
        if (address.line2)
          formData.append(
            "business_profile.support_address.line2",
            address.line2,
          );
        if (address.city)
          formData.append(
            "business_profile.support_address.city",
            address.city,
          );
        if (address.state)
          formData.append(
            "business_profile.support_address.state",
            address.state,
          );
        if (address.postal_code)
          formData.append(
            "business_profile.support_address.postal_code",
            address.postal_code,
          );
        if (address.country)
          formData.append(
            "business_profile.support_address.country",
            address.country,
          );
      }
    }

    // Set controller settings
    formData.append("controller[fees][payer]", "account");
    formData.append("controller[losses][payments]", "application");
    formData.append("controller[stripe_dashboard][type]", "express");

    // Call Stripe API through Pica passthrough
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/accounts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-pica-secret": PICA_SECRET_KEY || "",
          "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY || "",
          "x-pica-action-id":
            "conn_mod_def::GCmLPf156ZA::iQGtnirATs25Thi9YZGXfw",
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
