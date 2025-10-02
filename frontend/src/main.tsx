import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import AppTheme from "./components/AppTheme";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <AppTheme>
        <App />
      </AppTheme>
    </HelmetProvider>
  </React.StrictMode>
);
