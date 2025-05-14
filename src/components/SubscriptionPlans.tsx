import { useState, useEffect } from "react";
import { useAppContext } from "./AppContext";
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Check, Loader2 } from "lucide-react";

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

export default function SubscriptionPlans() {
  const { user } = useAppContext();
  const [plans, setPlans] = useState<SubscriptionPlan[]>(defaultPlans);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

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
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*, subscription_plans(*)")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setCurrentSubscription(data);
          setSelectedPlan(data.plan_id);
        }
      } catch (error) {
        console.error("Error fetching current subscription:", error);
      }
    }

    fetchPlans();
    fetchCurrentSubscription();
  }, [user]);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user) {
      alert("Please log in to subscribe");
      return;
    }

    setLoading(true);
    setSelectedPlan(plan.id);

    try {
      // In a real implementation, you would redirect to Stripe Checkout or show a payment form
      // For demo purposes, we'll just show a success message after a delay
      setTimeout(() => {
        alert(`Successfully subscribed to ${plan.name} plan!`);
        setCurrentSubscription({
          plan_id: plan.id,
          status: "active",
          current_period_end: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        });
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error subscribing to plan:", error);
      alert("Failed to subscribe. Please try again.");
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
              <Button
                className="w-full"
                variant={plan.id === "professional" ? "default" : "outline"}
                disabled={
                  loading ||
                  (currentSubscription &&
                    currentSubscription.plan_id === plan.id)
                }
                onClick={() => handleSubscribe(plan)}
              >
                {loading && selectedPlan === plan.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : currentSubscription &&
                  currentSubscription.plan_id === plan.id ? (
                  "Current Plan"
                ) : (
                  `Subscribe${plan.trial_period_days ? ` (${plan.trial_period_days} days free)` : ""}`
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {currentSubscription && (
        <div className="mt-8 p-4 border rounded-md bg-muted">
          <h3 className="font-medium">Your Current Subscription</h3>
          <p className="text-sm text-muted-foreground">
            You are currently on the{" "}
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
