// Window extension declaration for Google Analytics gtag
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export interface PageViewParams {
  page_location?: string;
  page_path?: string;
  page_title?: string;
}

export interface MotorsportEventParams {
  motorsport?: string;
  championship?: string;
  season?: number | string;
  section?: string;
}

export interface CircuitEventParams {
  circuit_id?: string;
  circuit_name?: string;
  motorsport?: string;
}

export interface DriverEventParams {
  driver_id?: string;
  driver_name?: string;
  team?: string;
  motorsport?: string;
}

export interface TeamEventParams {
  team_id?: string;
  team_name?: string;
  motorsport?: string;
}

export interface CalendarViewParams {
  view_mode?: string;
  series?: string;
  month?: string;
}

export interface CalendarEventParams {
  motorsport?: string;
  season?: number | string;
  event_id?: string;
  event_name?: string;
  round?: number | string;
}

export interface CalendarDateSelectedParams {
  date?: string;
  series?: string;
}

export interface GoogleCalendarClickedParams {
  event_id?: string;
  event_name?: string;
  series?: string;
}

export interface PredictionEventParams {
  motorsport?: string;
  championship?: string;
  season?: number | string;
  event_id?: string;
  event_name?: string;
  round?: number | string;
}

export interface LeaderboardEventParams {
  category?: string;
  season?: number | string;
}

export interface ProfileEventParams {
  is_own_profile?: boolean;
}

export interface AuthEventParams {
  method?: 'password' | 'google' | string;
  user_type?: 'new' | 'returning';
}

export interface ShareEventParams {
  share_type: 'prediction' | 'prediction_result' | 'leaderboard' | string;
  share_method?: 'native_share' | 'download' | 'copy_link' | string;
  event_id?: string;
}

// Blocked keys that must never be transmitted to GA4 to guarantee PII protection
export const BLOCKED_PII_KEYS = new Set([
  'email',
  'user_email',
  'user_id',
  'userid',
  'userId',
  'google_id',
  'google_name',
  'google_email',
  'full_name',
  'name',
  'username',
  'display_name',
  'displayName',
  'password',
  'token',
  'access_token',
  'accessToken',
  'prediction',
  'predictions',
  'prediction_data',
  'predictionData',
  'picks',
  'formData',
]);
