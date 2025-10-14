import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingState {
  hasCompletedTour: boolean;
  hasDemoData: boolean;
  hasAddedProperty: boolean;
  hasAssignedCompliance: boolean;
  hasUploadedDocument: boolean;
  showTour: boolean;
}

interface OnboardingContextType extends OnboardingState {
  completeTour: () => void;
  enableDemoData: () => void;
  markPropertyAdded: () => void;
  markComplianceAssigned: () => void;
  markDocumentUploaded: () => void;
  resetOnboarding: () => void;
  startTour: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    hasCompletedTour: false,
    hasDemoData: false,
    hasAddedProperty: false,
    hasAssignedCompliance: false,
    hasUploadedDocument: false,
    showTour: false,
  });

  useEffect(() => {
    if (user) {
      loadOnboardingState();
    }
  }, [user]);

  const loadOnboardingState = async () => {
    if (!user) return;

    try {
      // Load from localStorage for quick access
      const saved = localStorage.getItem(`onboarding_${user.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState((prev) => ({ ...prev, ...parsed }));
      } else {
        // First-time user - show tour
        setState((prev) => ({ ...prev, showTour: true }));
      }
    } catch (error) {
      console.error("Error loading onboarding state:", error);
    }
  };

  const saveState = (updates: Partial<OnboardingState>) => {
    if (!user) return;

    const newState = { ...state, ...updates };
    setState(newState);
    localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(newState));
  };

  const completeTour = () => {
    saveState({ hasCompletedTour: true, showTour: false });
  };

  const enableDemoData = () => {
    saveState({ hasDemoData: true });
  };

  const markPropertyAdded = () => {
    saveState({ hasAddedProperty: true });
  };

  const markComplianceAssigned = () => {
    saveState({ hasAssignedCompliance: true });
  };

  const markDocumentUploaded = () => {
    saveState({ hasUploadedDocument: true });
  };

  const resetOnboarding = () => {
    if (!user) return;
    localStorage.removeItem(`onboarding_${user.id}`);
    setState({
      hasCompletedTour: false,
      hasDemoData: false,
      hasAddedProperty: false,
      hasAssignedCompliance: false,
      hasUploadedDocument: false,
      showTour: false,
    });
  };

  const startTour = () => {
    saveState({ showTour: true });
  };

  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        completeTour,
        enableDemoData,
        markPropertyAdded,
        markComplianceAssigned,
        markDocumentUploaded,
        resetOnboarding,
        startTour,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
};
