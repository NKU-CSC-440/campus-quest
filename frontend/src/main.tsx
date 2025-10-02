import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import AppTheme from "./components/AppTheme";
import Layout from "./components/Layout";
import QuestDashboard from "./components/QuestDashboard";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <AppTheme>
        <Layout>
          <QuestDashboard currentUserId={1} />
        </Layout>
      </AppTheme>
    </HelmetProvider>
  </React.StrictMode>
);
