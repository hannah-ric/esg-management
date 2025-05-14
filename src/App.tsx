import { Route } from "react-router-dom";
import { AppProvider } from "./components/AppContext";
import { Toaster } from "./components/ui/toaster";
import { useRoutes, Routes } from "react-router-dom";
import routes from "tempo-routes";
import { StripeKeyProvider } from "./lib/stripe-key-provider";
import ErrorBoundary from "./components/ErrorBoundary";

// Import components
import Layout from "./components/Layout";
import Home from "./components/home";
import Questionnaire from "./components/Questionnaire";
import MaterialityMatrix from "./components/MaterialityMatrix";
import PlanGenerator from "./components/PlanGenerator";
import ResourceLibrary from "./components/ResourceLibrary";
import ResourceAdmin from "./components/ResourceAdmin";
import ESGDataDashboard from "./components/ESGDataDashboard";
import ESGDataEditor from "./components/ESGDataEditor";
import ESGDataVisualization from "./components/ESGDataVisualization";
import ESGDataInsights from "./components/ESGDataInsights";
import ESGHistoricalAnalysis from "./components/ESGHistoricalAnalysis";
import ComparativeAnalysis from "./components/ComparativeAnalysis";
import TailoredRecommendations from "./components/TailoredRecommendations";
import SubscriptionPlans from "./components/SubscriptionPlans";
import PaymentForm from "./components/PaymentForm";
import PaymentHistory from "./components/PaymentHistory";
import AdvisoryServices from "./components/AdvisoryServices";
import ImplementationSupport from "./components/ImplementationSupport";

// Import auth components
import LoginForm from "./components/auth/LoginForm";
import SignUpForm from "./components/auth/SignUpForm";
import ProfileForm from "./components/auth/ProfileForm";
import ResetPasswordForm from "./components/auth/ResetPasswordForm";
import UpdatePasswordForm from "./components/auth/UpdatePasswordForm";
import { AuthGuard } from "./components/auth/AuthGuard";

function App() {
  return (
    <AppProvider>
      <StripeKeyProvider>
        <Toaster />
        {/* Tempo routes for storyboards */}
        {import.meta.env.VITE_TEMPO && useRoutes(routes)}

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

            {/* Protected routes */}
            <Route
              path="questionnaire"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <Questionnaire />
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="materiality"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <MaterialityMatrix />
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="plan"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <PlanGenerator />
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="resources"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <ResourceLibrary />
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="resources/admin"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <ResourceAdmin />
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="dashboard"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <ESGDataDashboard />
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="data-editor"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <ESGDataEditor />
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="visualization"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <ESGDataVisualization />
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="insights"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <ESGDataInsights />
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="historical"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <ESGHistoricalAnalysis />
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="comparative"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <ComparativeAnalysis />
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="recommendations"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <TailoredRecommendations />
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="subscription"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <SubscriptionPlans />
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="payment"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <PaymentForm />
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="payment-history"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <PaymentHistory />
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="advisory"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <AdvisoryServices />
                  </ErrorBoundary>
                </AuthGuard>
              }
            />
            <Route
              path="implementation"
              element={
                <AuthGuard>
                  <ErrorBoundary>
                    <ImplementationSupport />
                  </ErrorBoundary>
                </AuthGuard>
              }
            />

            {/* Add this before any catchall route */}
            {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
          </Route>
        </Routes>
      </StripeKeyProvider>
    </AppProvider>
  );
}

export default App;
