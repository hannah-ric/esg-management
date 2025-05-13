import { Suspense, lazy } from "react";
import { Routes, Route, useRoutes } from "react-router-dom";
import Layout from "./components/Layout";
import { AppProvider } from "./components/AppContext";
import routes from "tempo-routes";

// Lazy load components for better performance
const Home = lazy(() => import("./components/home"));
const Questionnaire = lazy(() => import("./components/Questionnaire"));
const MaterialityMatrix = lazy(() => import("./components/MaterialityMatrix"));
const PlanGenerator = lazy(() => import("./components/PlanGenerator"));
const ResourceLibrary = lazy(() => import("./components/ResourceLibrary"));
const ComparativeAnalysis = lazy(
  () => import("./components/ComparativeAnalysis"),
);
const ESGDataDashboard = lazy(() => import("./components/ESGDataDashboard"));

function App() {
  // Define tempoEnabled based on environment variable
  const tempoEnabled = import.meta.env.VITE_TEMPO === "true";

  // Use the tempo routes if enabled
  const tempoRoutes = tempoEnabled ? useRoutes(routes) : null;

  return (
    <AppProvider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        }
      >
        <>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/questionnaire" element={<Questionnaire />} />
              <Route
                path="/materiality-matrix"
                element={<MaterialityMatrix />}
              />
              <Route path="/plan-generator" element={<PlanGenerator />} />
              <Route path="/resources" element={<ResourceLibrary />} />
              <Route path="/benchmarking" element={<ComparativeAnalysis />} />
              <Route path="/esg-data" element={<ESGDataDashboard />} />
            </Route>
            {tempoEnabled && (
              <Route path="/tempobook/*" element={<div>Tempo Content</div>} />
            )}
          </Routes>
          {tempoRoutes}
        </>
      </Suspense>
    </AppProvider>
  );
}

export default App;
