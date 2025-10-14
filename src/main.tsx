import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <OnboardingProvider>
        <App />
      </OnboardingProvider>
    </AuthProvider>
  </StrictMode>
);
