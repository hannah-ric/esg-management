export default function BenchmarkingPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Benchmarking</h1>
      <p className="text-muted-foreground">
        This page will display benchmarking data comparing your ESG metrics with industry peers.
      </p>
    </div>
import { Suspense } from "react";
import ComparativeAnalysis from "../components/ComparativeAnalysis";
import LoadingSpinner from "../components/LoadingSpinner";

export default function BenchmarkingPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ComparativeAnalysis />
    </Suspense>
  );
}
