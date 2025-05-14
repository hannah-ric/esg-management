import { Routes, Route } from "react-router-dom";
import { AppProvider } from "./components/AppContext";
import { Toaster } from "./components/ui/toaster";
import { useRoutes } from "react-router-dom";
import routes from "tempo-routes";
import { StripeKeyProvider } from "./lib/stripe-key-provider";

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
                  <ProfileForm />
                </AuthGuard>
              }
            />

            {/* Protected routes */}
            <Route
              path="questionnaire"
              element={
                <AuthGuard>
                  <Questionnaire />
                </AuthGuard>
              }
            />
            <Route
              path="materiality"
              element={
                <AuthGuard>
                  <MaterialityMatrix />
                </AuthGuard>
              }
            />
            <Route
              path="plan"
              element={
                <AuthGuard>
                  <PlanGenerator />
                </AuthGuard>
              }
            />
            <Route
              path="resources"
              element={
                <AuthGuard>
                  <ResourceLibrary />
                </AuthGuard>
              }
            />
            <Route
              path="resources/admin"
              element={
                <AuthGuard>
                  <ResourceAdmin />
                </AuthGuard>
              }
            />
            <Route
              path="dashboard"
              element={
                <AuthGuard>
                  <ESGDataDashboard />
                </AuthGuard>
              }
            />
            <Route
              path="data-editor"
              element={
                <AuthGuard>
                  <ESGDataEditor />
                </AuthGuard>
              }
            />
            <Route
              path="visualization"
              element={
                <AuthGuard>
                  <ESGDataVisualization />
                </AuthGuard>
              }
            />
            <Route
              path="insights"
              element={
                <AuthGuard>
                  <ESGDataInsights />
                </AuthGuard>
              }
            />
            <Route
              path="historical"
              element={
                <AuthGuard>
                  <ESGHistoricalAnalysis />
                </AuthGuard>
              }
            />
            <Route
              path="comparative"
              element={
                <AuthGuard>
                  <ComparativeAnalysis />
                </AuthGuard>
              }
            />
            <Route
              path="recommendations"
              element={
                <AuthGuard>
                  <TailoredRecommendations />
                </AuthGuard>
              }
            />
            <Route
              path="subscription"
              element={
                <AuthGuard>
                  <SubscriptionPlans />
                </AuthGuard>
              }
            />
            <Route
              path="payment"
              element={
                <AuthGuard>
                  <PaymentForm />
                </AuthGuard>
              }
            />
            <Route
              path="payment-history"
              element={
                <AuthGuard>
                  <PaymentHistory />
                </AuthGuard>
              }
            />
            <Route
              path="advisory"
              element={
                <AuthGuard>
                  <AdvisoryServices />
                </AuthGuard>
              }
            />
            <Route
              path="implementation"
              element={
                <AuthGuard>
                  <ImplementationSupport />
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
