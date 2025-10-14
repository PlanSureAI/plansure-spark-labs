import { useEffect } from "react";
import Joyride, { CallBackProps, STATUS, ACTIONS, EVENTS, Step } from "react-joyride";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { trackEvent } from "@/lib/analytics";

const tourSteps: Step[] = [
  {
    target: "body",
    content: (
      <div className="p-2">
        <h2 className="text-xl font-bold mb-2">Welcome to PlansureAI Compliance Command Center!</h2>
        <p className="text-sm text-muted-foreground">
          Quickly manage and track your property compliance status across your portfolio with ease and security. Let's take a quick tour!
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: ".add-property-button",
    content: (
      <div className="p-2">
        <h3 className="font-semibold mb-1">Add Your First Property</h3>
        <p className="text-sm text-muted-foreground">
          Begin by adding a property with the 'Add Property' button. You can track compliance standards and upload audit documents for each property.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: ".compliance-standards-area",
    content: (
      <div className="p-2">
        <h3 className="font-semibold mb-1">Assign Compliance Standards</h3>
        <p className="text-sm text-muted-foreground">
          Select applicable UK compliance standards for each property, set deadlines, and enter audit data to stay ahead of regulatory requirements.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: ".document-upload-area",
    content: (
      <div className="p-2">
        <h3 className="font-semibold mb-1">Upload Compliance Documents</h3>
        <p className="text-sm text-muted-foreground">
          Drag and drop audit certificates and reports to keep all your records secured and tracked automatically with audit trails.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: ".dashboard-overview",
    content: (
      <div className="p-2">
        <h3 className="font-semibold mb-1">Monitor Compliance Status</h3>
        <p className="text-sm text-muted-foreground">
          Your Portfolio Overview dashboard gives you clear compliance status by property with intuitive green, amber, and red indicators, plus upcoming deadlines.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: ".help-menu",
    content: (
      <div className="p-2">
        <h3 className="font-semibold mb-1">Need Help?</h3>
        <p className="text-sm text-muted-foreground">
          Access tooltips, documentation links, or restart this tour anytime from your account menu.
        </p>
      </div>
    ),
    placement: "bottom",
  },
];

export const WelcomeTour = () => {
  const { showTour, completeTour } = useOnboarding();

  useEffect(() => {
    if (showTour) {
      trackEvent('Onboarding Tour Started');
    }
  }, [showTour]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;
    
    // Track individual step interactions
    if (type === EVENTS.STEP_AFTER) {
      trackEvent('Onboarding Tour Step Completed', {
        stepIndex: index,
        stepName: `Step ${index + 1}`,
        action: action,
      });
    }

    // Track step navigation
    if (action === ACTIONS.NEXT) {
      trackEvent('Onboarding Tour Next Clicked', { stepIndex: index });
    } else if (action === ACTIONS.PREV) {
      trackEvent('Onboarding Tour Back Clicked', { stepIndex: index });
    }

    // Track completion or skip
    if (status === STATUS.FINISHED) {
      trackEvent('Onboarding Tour Completed', {
        totalSteps: tourSteps.length,
        completedAt: new Date().toISOString(),
      });
      completeTour();
    } else if (status === STATUS.SKIPPED) {
      trackEvent('Onboarding Tour Skipped', {
        skippedAtStep: index,
        totalSteps: tourSteps.length,
      });
      completeTour();
    }
  };

  if (!showTour) return null;

  return (
    <Joyride
      steps={tourSteps}
      run={showTour}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      disableScrolling={false}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "hsl(var(--primary))",
          textColor: "hsl(var(--foreground))",
          backgroundColor: "hsl(var(--background))",
          arrowColor: "hsl(var(--background))",
        },
        tooltip: {
          borderRadius: 8,
          padding: 0,
        },
        tooltipContainer: {
          textAlign: "left",
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          borderRadius: 6,
          padding: "8px 16px",
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
          marginRight: 8,
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
        },
      }}
      callback={handleJoyrideCallback}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip tour",
      }}
    />
  );
};
