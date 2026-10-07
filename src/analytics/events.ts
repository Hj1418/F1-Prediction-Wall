import { trackEvent } from './analytics';
import {
  MotorsportEventParams,
  CircuitEventParams,
  DriverEventParams,
  TeamEventParams,
  CalendarViewParams,
  CalendarEventParams,
  CalendarDateSelectedParams,
  GoogleCalendarClickedParams,
  PredictionEventParams,
  LeaderboardEventParams,
  ProfileEventParams,
  AuthEventParams,
  ShareEventParams,
} from './types';

// Core Navigation Events
export const trackExploreViewed = (params?: MotorsportEventParams) => {
  trackEvent('explore_viewed', params);
};

export const trackMotorsportViewed = (params?: MotorsportEventParams) => {
  trackEvent('motorsport_viewed', params);
};

export const trackMotorsportSectionViewed = (params?: MotorsportEventParams) => {
  trackEvent('motorsport_section_viewed', params);
};

export const trackCircuitViewed = (params?: CircuitEventParams) => {
  trackEvent('circuit_viewed', params);
};

export const trackDriverViewed = (params?: DriverEventParams) => {
  trackEvent('driver_viewed', params);
};

export const trackTeamViewed = (params?: TeamEventParams) => {
  trackEvent('team_viewed', params);
};

// Calendar Events
export const trackCalendarViewed = (params?: CalendarViewParams) => {
  trackEvent('calendar_viewed', params);
};

export const trackCalendarEventViewed = (params?: CalendarEventParams) => {
  trackEvent('calendar_event_viewed', params);
};

export const trackCalendarDateSelected = (params?: CalendarDateSelectedParams) => {
  trackEvent('calendar_date_selected', params);
};

export const trackGoogleCalendarClicked = (params?: GoogleCalendarClickedParams) => {
  trackEvent('google_calendar_clicked', params);
};

// Prediction Events
export const trackPredictionPageViewed = (params?: PredictionEventParams) => {
  trackEvent('prediction_page_viewed', params);
};

export const trackPredictionStarted = (params?: PredictionEventParams) => {
  trackEvent('prediction_started', params);
};

export const trackPredictionSubmitted = (params?: PredictionEventParams) => {
  trackEvent('prediction_submitted', params);
};

export const trackPredictionLocked = (params?: PredictionEventParams) => {
  trackEvent('prediction_locked', params);
};

export const trackPredictionResultViewed = (params?: PredictionEventParams) => {
  trackEvent('prediction_result_viewed', params);
};

// Leaderboard & Profile Events
export const trackLeaderboardViewed = (params?: LeaderboardEventParams) => {
  trackEvent('leaderboard_viewed', params);
};

export const trackProfileViewed = (params?: ProfileEventParams) => {
  trackEvent('profile_viewed', params);
};

// Auth Events (NO PII transmitted)
export const trackSignupStarted = (params?: AuthEventParams) => {
  trackEvent('signup_started', {
    method: params?.method || 'password',
  });
};

export const trackSignupCompleted = (params?: AuthEventParams) => {
  trackEvent('signup_completed', {
    method: params?.method || 'password',
    user_type: 'new',
  });
};

export const trackLogin = (params?: AuthEventParams) => {
  trackEvent('login', {
    method: params?.method || 'password',
    user_type: params?.user_type || 'returning',
  });
};

// Share Events
export const trackSharePrediction = (params?: Partial<ShareEventParams>) => {
  trackEvent('share_prediction', {
    share_type: 'prediction',
    share_method: params?.share_method || 'native_share',
    event_id: params?.event_id,
  });
};

export const trackShareResult = (params?: Partial<ShareEventParams>) => {
  trackEvent('share_result', {
    share_type: 'prediction_result',
    share_method: params?.share_method || 'native_share',
    event_id: params?.event_id,
  });
};

export const trackShareLeaderboard = (params?: Partial<ShareEventParams>) => {
  trackEvent('share_leaderboard', {
    share_type: 'leaderboard',
    share_method: params?.share_method || 'native_share',
  });
};
