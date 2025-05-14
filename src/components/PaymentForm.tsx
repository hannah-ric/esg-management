import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createPaymentIntent } from "@/lib/stripe-service";
import { useAppContext } from "./AppContext";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { confirmPaymentIntent } from "@/lib/stripe-service";
import { useStripeKey } from "@/lib/stripe-key-provider";

// Stripe will be initialized in the PaymentFormContent component
// after we get the key from the StripeKeyProvider

const formSchema = z.object({
  amount: z.coerce
    .number()
    .min(50, { message: "Amount must be at least $0.50" })
    .max(1000000, { message: "Amount must be less than $10,000" }),
  currency: z.string().default("usd"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const PaymentFormContent = () => {
  const { user } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<{
    success?: boolean;
    message?: string;
    clientSecret?: string;
  }>({});

  // Stripe hooks
  const stripe = useStripe();
  const elements = useElements();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 1000, // $10.00
      currency: "usd",
      description: "ESG Plan Generator Subscription",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!user) {
      setPaymentStatus({
        success: false,
        message: "You must be logged in to make a payment",
      });
      return;
    }

    if (!stripe || !elements) {
      setPaymentStatus({
        success: false,
        message: "Stripe has not initialized yet. Please try again.",
      });
      return;
    }

    // We already check for publishable key in the parent component

    setIsLoading(true);
    setPaymentStatus({});

    try {
      // Convert dollars to cents for Stripe
      const amountInCents = Math.round(values.amount);

      // Step 1: Create a payment intent
      const paymentIntent = await createPaymentIntent({
        amount: amountInCents,
        currency: values.currency,
        description: values.description,
        receipt_email: user.email,
        metadata: {
          user_id: user.id,
        },
      });

      // Step 2: Confirm the payment with the card element
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error, paymentIntent: confirmedIntent } =
        await stripe.confirmCardPayment(paymentIntent.client_secret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: user.email,
              name:
                user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : undefined,
            },
          },
        });

      if (error) {
        // Show error to your customer
        throw new Error(error.message || "Payment failed");
      }

      if (confirmedIntent.status === "succeeded") {
        setPaymentStatus({
          success: true,
          message: "Payment processed successfully!",
        });

        // You can also call your backend to confirm the payment was successful
        try {
          await confirmPaymentIntent(confirmedIntent.id);
        } catch (confirmError) {
          console.error("Error confirming payment on backend:", confirmError);
          // This is not critical as the payment already succeeded on Stripe's end
        }
      } else {
        setPaymentStatus({
          success: false,
          message: `Payment status: ${confirmedIntent.status}. Please try again.`,
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus({
        success: false,
        message:
          error instanceof Error ? error.message : "Payment processing failed",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="10.00"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Enter the amount in dollars (minimum $0.50).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="Payment description"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                A brief description of what this payment is for.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Card Details</FormLabel>
          <div className="p-3 border rounded-md">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#9e2146",
                  },
                },
              }}
            />
          </div>
          <FormDescription>Enter your card details securely.</FormDescription>
        </div>

        {paymentStatus.message && (
          <div
            className={`p-4 rounded-md ${paymentStatus.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {paymentStatus.message}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !stripe}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Pay Now"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default function PaymentForm() {
  const { publishableKey, loading, error } = useStripeKey();

  return (
    <Card className="w-full max-w-md mx-auto bg-white">
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        <CardDescription>
          Make a one-time payment for your ESG Plan Generator subscription.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading payment system...</span>
          </div>
        )}

        {error && !publishableKey && (
          <div className="p-4 rounded-md bg-red-50 text-red-700">{error}</div>
        )}

        {publishableKey && (
          <Elements stripe={loadStripe(publishableKey)}>
            <PaymentFormContent />
          </Elements>
        )}
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <p>Secure payment processing by Stripe</p>
      </CardFooter>
    </Card>
  );
}
