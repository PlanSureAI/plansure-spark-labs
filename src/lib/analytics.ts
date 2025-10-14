import posthog from 'posthog-js';

// Initialize PostHog (call this once in your app)
export const initAnalytics = () => {
  if (typeof window !== 'undefined') {
    posthog.init(
      import.meta.env.VITE_POSTHOG_KEY || 'phc_placeholder', 
      {
        api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
        loaded: (posthog) => {
          if (import.meta.env.DEV) posthog.opt_out_capturing();
        },
      }
    );
  }
};

// Track custom events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(eventName, properties);
  }
};

// Identify user
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.identify(userId, traits);
  }
};

// Track page views
export const trackPageView = () => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('$pageview');
  }
};

// Reset on logout
export const resetAnalytics = () => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.reset();
  }
};
