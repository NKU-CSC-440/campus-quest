import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import AppTheme from "./components/AppTheme";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <AppTheme>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppTheme>
    </HelmetProvider>
  </React.StrictMode>
);
