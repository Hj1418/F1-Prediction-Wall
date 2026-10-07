import { PageViewParams, BLOCKED_PII_KEYS } from './types';

let isInitialized = false;
let lastTrackedPath: string | null = null;

/**
 * Get the current configured Measurement ID from Vite env.
 */
export const getMeasurementId = (): string => {
  return import.meta.env.VITE_GA_MEASUREMENT_ID || '';
};

/**
 * Sanitize event parameters to guarantee non-PII compliance and clean payload.
 */
const sanitizeParams = (params?: Record<string, any>): Record<string, any> => {
  if (!params || typeof params !== 'object') return {};

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (BLOCKED_PII_KEYS.has(key)) {
      continue;
    }
    // Convert functions or non-serializables to string if necessary
    if (typeof value === 'function') continue;
    clean[key] = value;
  }
  return clean;
};

/**
 * Helper to compute canonical page path for HashRouter SPA.
 */
export const getHashPagePath = (): string => {
  if (typeof window === 'undefined') return '/';
  const hash = window.location.hash;
  if (hash && hash.length > 1) {
    const route = hash.substring(1); // remove '#'
    return route.startsWith('/') ? route : `/${route}`;
  }
  return window.location.pathname || '/';
};

/**
 * Initialize GA4 tracking tag once asynchronously.
 */
export const initAnalytics = (): boolean => {
  if (isInitialized) return true;
  if (typeof window === 'undefined') return false;

  const measurementId = getMeasurementId();
  if (!measurementId) {
    // Missing Measurement ID - silently skip without throwing error
    return false;
  }

  try {
    // Inject script if not already present in DOM
    const scriptId = 'ga4-gtag-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
    }

    // Initialize dataLayer and window.gtag
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function () {
        window.dataLayer?.push(arguments);
      };
    }

    window.gtag('js', new Date());

    // Configure GA4:
    // - send_page_view: false prevents GA from automatically sending duplicate page_views on script load.
    // - debug_mode: enabled in Vite development mode for DebugView compatibility.
    const isDev = Boolean(import.meta.env.DEV);
    window.gtag('config', measurementId, {
      send_page_view: false,
      ...(isDev ? { debug_mode: true } : {}),
    });

    isInitialized = true;
    return true;
  } catch (err) {
    console.warn('Analytics initialization error (gracefully caught):', err);
    return false;
  }
};

/**
 * Track route-aware page view event.
 */
export const trackPageView = (params?: PageViewParams): void => {
  const measurementId = getMeasurementId();
  if (!measurementId) return;

  if (!isInitialized) {
    initAnalytics();
  }

  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  try {
    const page_path = params?.page_path || getHashPagePath();

    // Prevent duplicate consecutive page_view calls for the exact same path
    if (lastTrackedPath === page_path) {
      return;
    }
    lastTrackedPath = page_path;

    const page_location = params?.page_location || window.location.href;
    const page_title = params?.page_title || document.title;

    window.gtag('event', 'page_view', {
      page_location,
      page_path,
      page_title,
    });
  } catch (err) {
    console.warn('Failed to track page view:', err);
  }
};

/**
 * Track custom GA4 product event safely with PII sanitization.
 */
export const trackEvent = (eventName: string, eventParams?: Record<string, any>): void => {
  const measurementId = getMeasurementId();
  if (!measurementId) return;

  if (!isInitialized) {
    initAnalytics();
  }

  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  try {
    const safeParams = sanitizeParams(eventParams);
    window.gtag('event', eventName, safeParams);
  } catch (err) {
    console.warn(`Failed to track event "${eventName}":`, err);
  }
};
