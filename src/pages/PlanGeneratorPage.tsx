import { Suspense } from "react";
import PlanGenerator from "../components/PlanGenerator";
import LoadingSpinner from "../components/LoadingSpinner";

export default function PlanGeneratorPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PlanGenerator />
    </Suspense>
  );
}
