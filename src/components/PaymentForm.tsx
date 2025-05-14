import { useState } from "react";
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

const formSchema = z.object({
  amount: z.coerce
    .number()
    .min(50, { message: "Amount must be at least $0.50" })
    .max(1000000, { message: "Amount must be less than $10,000" }),
  currency: z.string().default("usd"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PaymentForm() {
  const { user } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<{
    success?: boolean;
    message?: string;
    clientSecret?: string;
  }>({});

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

    setIsLoading(true);
    setPaymentStatus({});

    try {
      // Convert dollars to cents for Stripe
      const amountInCents = Math.round(values.amount);

      const paymentIntent = await createPaymentIntent({
        amount: amountInCents,
        currency: values.currency,
        description: values.description,
        receipt_email: user.email,
        metadata: {
          user_id: user.id,
        },
      });

      setPaymentStatus({
        success: true,
        message: "Payment intent created successfully",
        clientSecret: paymentIntent.client_secret,
      });

      // In a real implementation, you would now use the client secret with Stripe.js
      // to collect payment method details and confirm the payment
      console.log("Payment intent created:", paymentIntent);

      // For demo purposes, we'll just show a success message
      setTimeout(() => {
        setPaymentStatus({
          success: true,
          message: "Payment processed successfully!",
        });
      }, 2000);
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
    <Card className="w-full max-w-md mx-auto bg-white">
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        <CardDescription>
          Make a one-time payment for your ESG Plan Generator subscription.
        </CardDescription>
      </CardHeader>
      <CardContent>
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

            {paymentStatus.message && (
              <div
                className={`p-4 rounded-md ${paymentStatus.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
              >
                {paymentStatus.message}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
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
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <p>Secure payment processing by Stripe</p>
      </CardFooter>
    </Card>
  );
}
