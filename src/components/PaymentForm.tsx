// import React from 'react'; // Unused
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { createPaymentIntent } from "@/lib/stripe-service";
import { confirmPaymentIntent } from "@/lib/stripe-service";
import { useStripeKey } from "@/lib/stripe-key-provider";

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().min(1, "Currency is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const PaymentFormContent = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "10.00",
      currency: "usd",
      description: "Test payment",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!stripe || !elements) {
      setError("Stripe has not loaded yet. Please try again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert amount to cents
      const amountInCents = Math.round(parseFloat(values.amount) * 100);

      // Mock user for demo purposes
      const user = {
        id: "user_123",
        email: "test@example.com",
      };

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

      // Step 2: Confirm the payment with the card details
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error, paymentIntent: confirmedIntent } =
        await stripe.confirmCardPayment(paymentIntent.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: user.email,
            },
          },
        });

      if (error) {
        throw new Error(error.message);
      }

      if (confirmedIntent.status === "succeeded") {
        // Step 3: Verify the payment on the server
        await confirmPaymentIntent(confirmedIntent.id);
        setSuccess(true);
      } else {
        throw new Error(
          `Payment status: ${confirmedIntent.status}. Please try again.`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5">$</span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.50"
            className="pl-7"
            {...register("amount")}
          />
        </div>
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Input id="currency" {...register("currency")} />
        {errors.currency && (
          <p className="text-sm text-red-500">{errors.currency.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register("description")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="card">Card Details</Label>
        <div className="border rounded-md p-3">
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
      </div>

      {error && <div className="text-red-500">{error}</div>}

      {success ? (
        <div className="bg-green-100 text-green-800 p-3 rounded-md">
          Payment successful! Thank you for your purchase.
        </div>
      ) : (
        <Button type="submit" disabled={loading || !stripe} className="w-full">
          {loading ? "Processing..." : "Pay Now"}
        </Button>
      )}
    </form>
  );
};

const PaymentForm = () => {
  const { publishableKey, loading, error, isMockMode } = useStripeKey();

  if (loading) {
    return <div className="p-4">Loading payment system...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      {isMockMode && (
        <div className="bg-yellow-100 text-yellow-800 p-3 mb-4 rounded-md">
          <p className="font-medium">Test Mode Active</p>
          <p className="text-sm">
            Use test card: 4242 4242 4242 4242 with any future date and CVC.
          </p>
        </div>
      )}

      {publishableKey && (
        <Elements stripe={loadStripe(publishableKey)}>
          <PaymentFormContent />
        </Elements>
      )}
    </div>
  );
};

export default PaymentForm;
