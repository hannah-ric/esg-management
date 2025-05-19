import { Suspense } from "react";
import ResourceLibrary from "../components/ResourceLibrary";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ResourcesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResourceLibrary />
    </Suspense>
  );
}
