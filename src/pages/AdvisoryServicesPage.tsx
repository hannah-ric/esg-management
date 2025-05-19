import { Suspense } from "react";
import AdvisoryServices from "../components/AdvisoryServices";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdvisoryServicesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdvisoryServices />
    </Suspense>
  );
}
