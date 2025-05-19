import { Suspense } from "react";
import ESGMetricDashboard from "../components/ESGMetricDashboard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function EsgMetricsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ESGMetricDashboard />
    </Suspense>
  );
}
