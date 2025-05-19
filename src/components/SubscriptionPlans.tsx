import { useState, useEffect } from "react";
import { useAppContext } from "@/components/AppContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { createSubscription } from "@/lib/stripe-service";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
// import type { Subscription, Plan as StripePlan } from "@stripe/stripe-js"; // StripePlan unused

// Define our own Subscription type instead of importing from @stripe/stripe-js
interface StripeSubscription {
  id: string;
  status?: string;
  plan?: {
    id: string;
    amount?: number;
    nickname?: string;
  };
  current_period_end: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: string;
  interval_count: number;
  trial_period_days: number | null;
  stripe_price_id: string;
  stripe_product_id: string;
  features: string[];
}

const defaultPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Essential ESG reporting tools for small businesses",
    amount: 2900,
    currency: "usd",
    interval: "month",
    interval_count: 1,
    trial_period_days: 14,
    stripe_price_id: "price_basic",
    stripe_product_id: "prod_basic",
    features: [
      "ESG Materiality Assessment",
      "Basic Reporting Templates",
      "5 ESG Metrics Tracking",
      "Email Support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "Comprehensive ESG management for growing organizations",
    amount: 7900,
    currency: "usd",
    interval: "month",
    interval_count: 1,
    trial_period_days: 14,
    stripe_price_id: "price_professional",
    stripe_product_id: "prod_professional",
    features: [
      "Everything in Basic",
      "Advanced Reporting Templates",
      "20 ESG Metrics Tracking",
      "Benchmarking Tools",
      "Priority Support",
      "Quarterly Strategy Sessions",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Full-scale ESG management for large organizations",
    amount: 19900,
    currency: "usd",
    interval: "month",
    interval_count: 1,
    trial_period_days: 14,
    stripe_price_id: "price_enterprise",
    stripe_product_id: "prod_enterprise",
    features: [
      "Everything in Professional",
      "Unlimited ESG Metrics Tracking",
      "Custom Reporting Templates",
      "Advanced Analytics",
      "Dedicated Account Manager",
      "API Access",
      "White-labeling Options",
    ],
  },
];

// Type for data fetched from your 'subscriptions' table
interface CurrentSubscriptionData {
  id?: string; // from your DB
  user_id?: string;
  plan_id: string; // FK to your subscription_plans table
  stripe_subscription_id?: string;
  status: string; // e.g., 'active', 'canceled', 'trialing'
  current_period_end: string; // ISO date string
  subscription_plans?: Partial<SubscriptionPlan>; // If you select joined data
  // Add other relevant fields from your DB 'subscriptions' table
}

// CustomerObjectFromStripe was unused
// interface CustomerObjectFromStripe {
//   id: string; 
//   subscriptions?: {
//     data: Subscription[]; 
//   };
//   // Add other Stripe.Customer fields you might use
// }

// Type for data fetched from your own 'customers' table
interface CustomerFromDB {
  id: string; // Your DB customer ID
  stripe_customer_id?: string | null;
  // Add the subscriptions field
  subscriptions?: {
    data: StripeSubscription[]
  };
}

export default function SubscriptionPlans() {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>(defaultPlans);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscriptionData | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerFromDB | null>(null);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("active", true);

        if (error) throw error;

        if (data && data.length > 0) {
          // Transform the data to match our SubscriptionPlan interface
          const formattedPlans = data.map((plan) => ({
            ...plan,
            features: plan.metadata?.features || [],
          }));
          setPlans(formattedPlans);
        }
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
      }
    }

    async function fetchCurrentSubscription() {
      if (!user) return;
      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("stripe_customer_id")
          .eq("id", user.id)
          .single();
        if (userError && userError.code !== "PGRST116") throw userError;
        if (userData?.stripe_customer_id) {
          setCustomerId(userData.stripe_customer_id);
        }

        const { data, error } = await supabase
          .from("subscriptions")
          .select("*, subscription_plans(*)")
          .eq("user_id", user.id)
          .in("status", ["active", "trialing"])
          .single();

        if (error && error.code !== "PGRST116") throw error;
        if (data) {
          setCurrentSubscription(data as CurrentSubscriptionData);
          setSelectedPlan(data.plan_id);
        }
      } catch (fetchError) {
        console.error("Error fetching current subscription:", fetchError);
      }
    }

    async function fetchCustomer() {
      if (!customerId) return;
      try {
        const { data, error } = await supabase
          .from("customers")
          .select("id, stripe_customer_id, /* other fields you store */")
          .eq("stripe_customer_id", customerId)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        if (data) {
          setCustomer(data as CustomerFromDB | null);
        }
      } catch (fetchError) {
        console.error("Error fetching customer:", fetchError);
      }
    }

    fetchPlans();
    fetchCurrentSubscription();
    if (customerId) fetchCustomer();
  }, [user, customerId]);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to subscribe to a plan",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSelectedPlan(plan.id);

    try {
      // If we don't have a customer ID, we need to redirect to the payment form
      if (!customerId) {
        // Store the selected plan in session storage
        sessionStorage.setItem("selectedPlanId", plan.stripe_price_id);
        navigate("/payment");
        return;
      }

      // Create subscription with existing customer
      const subscription = await createSubscription({
        customerId: customerId,
        priceId: plan.stripe_price_id,
        metadata: {
          user_id: user.id,
          plan_name: plan.name,
        },
        trialPeriodDays: plan.trial_period_days || undefined,
      });

      toast({
        title: "Subscription created",
        description: `You are now subscribed to the ${plan.name} plan!`,
      });

      // Update the current subscription state
      setCurrentSubscription({
        plan_id: plan.id,
        status: subscription.status,
        current_period_end: new Date(
          subscription.current_period_end * 1000,
        ).toISOString(),
      });
    } catch (error) {
      console.error("Error subscribing to plan:", error);
      toast({
        title: "Subscription failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 bg-white">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight">
          Subscription Plans
        </h2>
        <p className="text-muted-foreground mt-2">
          Choose the plan that best fits your organization's ESG reporting
          needs.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col h-full ${plan.id === "professional" ? "border-primary shadow-lg" : ""}`}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{plan.name}</CardTitle>
                {plan.id === "professional" && (
                  <Badge variant="default">Most Popular</Badge>
                )}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mb-6">
                <span className="text-3xl font-bold">
                  {formatCurrency(plan.amount, plan.currency)}
                </span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {currentSubscription && currentSubscription.plan_id === plan.id ? (
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={loading}
                  onClick={() => handleSubscribe(plan)}
                >
                  {loading && selectedPlan === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : "Manage Subscription"}
                </Button>
              ) : customer?.subscriptions && Array.isArray(customer.subscriptions.data) && 
                 customer.subscriptions.data.some((sub) => sub.plan?.id === plan.id) ? (
                <Badge variant="outline">Subscribed (Inactive)</Badge>
              ) : (
                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading || Boolean(currentSubscription && currentSubscription.plan_id === plan.id)}
                  className="w-full"
                >
                  {loading && selectedPlan === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : "Subscribe"}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {currentSubscription && (
        <div className="mt-8 p-4 border rounded-md bg-muted">
          <h3 className="font-medium">Your Current Subscription</h3>
          <p className="text-sm text-muted-foreground">
            You&apos;re currently on the{" "}
            <strong>
              {plans.find((p) => p.id === currentSubscription.plan_id)?.name ||
                "Unknown"}
            </strong>{" "}
            plan. Your subscription will renew on{" "}
            {new Date(
              currentSubscription.current_period_end,
            ).toLocaleDateString()}
            .
          </p>
        </div>
      )}
    </div>
  );
}
