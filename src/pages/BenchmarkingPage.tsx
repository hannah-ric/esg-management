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
