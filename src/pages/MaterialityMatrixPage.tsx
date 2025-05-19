import { Suspense } from "react";
import MaterialityMatrix from "../components/MaterialityMatrix";
import LoadingSpinner from "../components/LoadingSpinner";

export default function MaterialityMatrixPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MaterialityMatrix />
    </Suspense>
  );
}
