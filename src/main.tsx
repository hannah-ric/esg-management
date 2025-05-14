import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL;

// Create Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || "",
);

// Import the AuthProvider
import { AuthProvider } from "./components/AuthProvider";

// Root component
const Root = () => {
  return (
    <React.StrictMode>
      <AuthProvider>
        <BrowserRouter basename={basename}>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
