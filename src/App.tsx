import { lazy, Suspense } from "react";
import { Route, useRoutes, Routes } from "react-router-dom";
import { AppProvider } from "./components/AppContext";
import { Toaster } from "./components/ui/toaster";
import routes from "tempo-routes";
import { StripeKeyProvider } from "./lib/stripe-key-provider";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";

// Import components
import Layout from "./components/Layout";
import Home from "./components/home";

// Lazy load non-critical components
const Questionnaire = lazy(() => import("./components/Questionnaire"));
const MaterialityMatrix = lazy(() => import("./components/MaterialityMatrix"));
const PlanGenerator = lazy(() => import("./components/PlanGenerator"));
const ResourceLibrary = lazy(() => import("./components/ResourceLibrary"));
const ResourceAdmin = lazy(() => import("./components/ResourceAdmin"));
const ESGDataDashboard = lazy(() => import("./components/ESGDataDashboard"));
const ESGDataEditor = lazy(() => import("./components/ESGDataEditor"));
const ESGDataVisualization = lazy(
  () => import("./components/ESGDataVisualization"),
);
const ESGDataInsights = lazy(() => import("./components/ESGDataInsights"));
const ESGHistoricalAnalysis = lazy(
  () => import("./components/ESGHistoricalAnalysis"),
);
const ComparativeAnalysis = lazy(
  () => import("./components/ComparativeAnalysis"),
);
const TailoredRecommendations = lazy(
  () => import("./components/TailoredRecommendations"),
);
const SubscriptionPlans = lazy(() => import("./components/SubscriptionPlans"));
const PaymentForm = lazy(() => import("./components/PaymentForm"));
const PaymentHistory = lazy(() => import("./components/PaymentHistory"));
const AdvisoryServices = lazy(() => import("./components/AdvisoryServices"));
const ImplementationSupport = lazy(() =>
  import("./components/ImplementationSupport").then((m) => ({
    default: m.ImplementationSupport,
  }))
);

// Import auth components
import LoginForm from "./components/auth/LoginForm";
import SignUpForm from "./components/auth/SignUpForm";
import ProfileForm from "./components/auth/ProfileForm";
import ResetPasswordForm from "./components/auth/ResetPasswordForm";
import UpdatePasswordForm from "./components/auth/UpdatePasswordForm";
import { AuthGuard } from "./components/auth/AuthGuard";

function App() {
  const tempoAppRoutes = useRoutes(routes);

  return (
    <AppProvider>
      <StripeKeyProvider>
        <Toaster />
        {/* Tempo routes for storyboards */}
        {import.meta.env.VITE_TEMPO && tempoAppRoutes}

        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />

            {/* Auth routes */}
            <Route path="login" element={<LoginForm />} />
            <Route path="signup" element={<SignUpForm />} />
            <Route path="reset-password" element={<ResetPasswordForm />} />
            <Route path="update-password" element={<UpdatePasswordForm />} />
            <Route
              path="profile"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <ProfileForm />
                  </ErrorBoundary>
                </AuthGuard>
              }
            />

            {/* Protected routes with Suspense added to all lazy-loaded components */}
            <Route
              path="questionnaire"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Questionnaire />
                    </Suspense>
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="materiality"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <MaterialityMatrix />
                    </Suspense>
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="plan"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <PlanGenerator />
                    </Suspense>
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="resources"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <ResourceLibrary />
                    </Suspense>
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="resources/admin"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <ResourceAdmin />
                    </Suspense>
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="dashboard"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <ESGDataDashboard />
                    </Suspense>
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="data-editor"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <ESGDataEditor />
                    </Suspense>
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="visualization"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <ESGDataVisualization />
                    </Suspense>
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="insights"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <ESGDataInsights />
                    </Suspense>
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="historical"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <ESGHistoricalAnalysis />
                    </Suspense>
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="comparative"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <ComparativeAnalysis />
                    </Suspense>
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="recommendations"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <TailoredRecommendations />
                    </Suspense>
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="subscription"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <SubscriptionPlans />
                    </Suspense>
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="payment"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <PaymentForm />
                    </Suspense>
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="payment-history"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <PaymentHistory />
                    </Suspense>
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="advisory"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdvisoryServices />
                    </Suspense>
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="implementation"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                      <ImplementationSupport />
                    </Suspense>
                  </ErrorBoundary>
                </AuthGuard>
              }
            />

            {/* Add this before any catchall route */}
            {import.meta.env.VITE_TEMPO && <Route path="/tempobook" />}
          </Route>
        </Routes>
      </StripeKeyProvider>
    </AppProvider>
  );
}

export default App;
