import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import MaterialityMatrixPage from "./pages/MaterialityMatrixPage";
import PlanGeneratorPage from "./pages/PlanGeneratorPage";
import ResourcesPage from "./pages/ResourcesPage";
import AdvisoryServicesPage from "./pages/AdvisoryServicesPage";
import BenchmarkingPage from "./pages/BenchmarkingPage";
import ESGMetricsPage from "./pages/ESGMetricsPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginForm from "./components/auth/LoginForm";
import SignUpForm from "./components/auth/SignUpForm";
import ProfileForm from "./components/auth/ProfileForm";
import ResetPasswordForm from "./components/auth/ResetPasswordForm";
import UpdatePasswordForm from "./components/auth/UpdatePasswordForm";
import { AuthGuard } from "./components/auth/AuthGuard";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";

const Questionnaire = lazy(() => import("./components/Questionnaire"));
const ResourceAdmin = lazy(() => import("./components/ResourceAdmin"));
const ESGDataDashboard = lazy(() => import("./components/ESGDataDashboard"));
const ESGDataEditor = lazy(() => import("./components/ESGDataEditor"));
const ESGDataVisualization = lazy(() => import("./components/ESGDataVisualization"));
const ESGDataInsights = lazy(() => import("./components/ESGDataInsights"));
const ESGHistoricalAnalysis = lazy(() => import("./components/ESGHistoricalAnalysis"));
const ComparativeAnalysis = lazy(() => import("./components/ComparativeAnalysis"));
const TailoredRecommendations = lazy(() => import("./components/TailoredRecommendations"));
const SubscriptionPlans = lazy(() => import("./components/SubscriptionPlans"));
const PaymentForm = lazy(() => import("./components/PaymentForm"));
const PaymentHistory = lazy(() => import("./components/PaymentHistory"));
const ImplementationSupport = lazy(() =>
  import("./components/ImplementationSupport").then(m => ({ default: m.ImplementationSupport }))
);

export default function AppRouter() {
  return (
    <Routes future={{ v7_relativeSiblings: true }}>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
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
          path="materiality-matrix"
          element={
            <AuthGuard>
              <ErrorBoundary>
                <MaterialityMatrixPage />
              </ErrorBoundary>
            </AuthGuard>
          }
        />
        <Route
          path="plan-generator"
          element={
            <AuthGuard>
              <ErrorBoundary>
                <PlanGeneratorPage />
              </ErrorBoundary>
            </AuthGuard>
          }
        />
        <Route path="plan-generator" element={<PlanGeneratorPage />} />
        <Route
          path="resources"
          element={
            <AuthGuard>
              <ErrorBoundary>
                <ResourcesPage />
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
        <Route path="benchmarking" element={<BenchmarkingPage />} />
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
          path="advisory-services"
          element={
            <AuthGuard>
              <ErrorBoundary>
                <AdvisoryServicesPage />
              </ErrorBoundary>
            </AuthGuard>
          }
        />
        <Route path="advisory-services" element={<AdvisoryServicesPage />} />
        <Route
          path="implementation-support"
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
        <Route path="esg-metrics" element={<ESGMetricsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
