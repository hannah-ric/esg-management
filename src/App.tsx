import { Suspense } from "react";
import { Routes, Route, useRoutes } from "react-router-dom";
import Home from "./components/home";
import Questionnaire from "./components/Questionnaire";
import MaterialityMatrix from "./components/MaterialityMatrix";
import PlanGenerator from "./components/PlanGenerator";
import ResourceLibrary from "./components/ResourceLibrary";
import ComparativeAnalysis from "./components/ComparativeAnalysis";
import Layout from "./components/Layout";
import { AppProvider } from "./components/AppContext";
import routes from "tempo-routes";

function App() {
  // Define tempoEnabled based on environment variable
  const tempoEnabled = import.meta.env.VITE_TEMPO === "true";

  // Use the tempo routes if enabled
  const tempoRoutes = tempoEnabled ? useRoutes(routes) : null;

  return (
    <AppProvider>
      <Suspense fallback={<p>Loading...</p>}>
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
