import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
// import { AppProvider } from "./components/AppContext"; // Unused
// import { supabase } from "./lib/supabase"; // Unused

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL;

// Create Supabase client (this instance is used if one from lib/supabase is not)
// const supabase = createClient( // This supabase variable is not used further down
//   import.meta.env.VITE_SUPABASE_URL || "",
//   import.meta.env.VITE_SUPABASE_ANON_KEY || "",
// );
createClient( // If not assigning to a var, it's likely for side effects or if App uses a global instance
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || "",
);

// Root component
const Root = () => {
  return (
    <React.StrictMode>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
