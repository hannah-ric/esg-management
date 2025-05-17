import { useState, useEffect } from "react";
import { useAppContext } from "./AppContext";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2 } from "lucide-react";
import { type Json } from "../types/supabase";

interface PaymentFromDB {
  id: string;
  payment_intent_id: string | null;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  created_at: string;
  error_message?: string | null;
  metadata?: Json | null;
  user_id?: string;
}

interface Payment {
  id: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  created_at: string;
  error_message?: string;
}

export default function PaymentHistory() {
  const { user } = useAppContext();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayments() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("payments")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formattedPayments: Payment[] = (data || []).map((p: PaymentFromDB) => ({
          id: p.id,
          payment_intent_id: p.payment_intent_id || "N/A",
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          description: p.description || "Payment",
          created_at: p.created_at,
          error_message: p.error_message || undefined,
        }));
        setPayments(formattedPayments);
      } catch (err) {
        console.error("Error fetching payment history:", err);
        setError("Failed to load payment history. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, [user]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return <Badge className="bg-green-500">Succeeded</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>;
      case "requires_payment_method":
        return <Badge className="bg-yellow-500">Requires Payment</Badge>;
      case "requires_action":
        return <Badge className="bg-yellow-500">Requires Action</Badge>;
      case "canceled":
        return <Badge className="bg-gray-500">Canceled</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
        <p>Please log in to view your payment history.</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <Card className="w-full bg-white">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            View your past payments and transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No payment history found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>
          View your past payments and transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Description</th>
                <th className="text-left py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">ID</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">
                    {formatDate(payment.created_at)}
                  </td>
                  <td className="py-3 px-4">
                    {payment.description || "Payment"}
                    {payment.error_message && (
                      <div className="text-xs text-red-500 mt-1">
                        Error: {payment.error_message}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {formatCurrency(payment.amount, payment.currency)}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {payment.payment_intent_id.substring(0, 10)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
