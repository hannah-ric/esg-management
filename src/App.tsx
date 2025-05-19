import { useRoutes } from "react-router-dom";
import { AppProvider } from "./components/AppContext";
import { Toaster } from "./components/ui/toaster";
import routes from "tempo-routes";
import { StripeKeyProvider } from "./lib/stripe-key-provider";
import AppRouter from "./Router";
function App() {
  const tempoAppRoutes = useRoutes(routes);

  return (
    <AppProvider>
      <StripeKeyProvider>
        <Toaster />
        {/* Tempo routes for storyboards */}
        {import.meta.env.VITE_TEMPO && tempoAppRoutes}

        <AppRouter />
      </StripeKeyProvider>
    </AppProvider>
  );
}

export default App;
