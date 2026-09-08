/**
 * Google Identity Services (GIS) OAuth 2.0 Integration.
 * 
 * Provides official token client popup authentication for Google Sign-In,
 * fetching user profile from Google's userinfo endpoint without any browser prompts.
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: unknown) => void;
          }) => GoogleTokenClient;
        };
      };
    };
  }
}

export interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

export interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

export interface GoogleUserProfile {
  email: string;
  displayName: string;
  photoUrl?: string;
  accessToken?: string;
}

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
let scriptLoadingPromise: Promise<void> | null = null;

/**
 * Loads the Google Identity Services client script dynamically if not already loaded.
 */
export function loadGoogleIdentityServices(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Browser window environment required'));
  }

  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise<void>((resolve, reject) => {
    // Check if script element already exists
    const existingScript = document.querySelector(`script[src="${GIS_SCRIPT_SRC}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services script.')));
      return;
    }

    const script = document.createElement('script');
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services SDK. Please check your internet connection.'));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

/**
 * Initiates the Google OAuth 2.0 popup sign-in flow.
 * Returns the authenticated user's email, displayName, and profile photoUrl.
 */
export async function signInWithGoogle(): Promise<GoogleUserProfile> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId || clientId.trim() === '' || clientId === 'your-google-client-id') {
    throw new Error(
      'Google Sign-In is not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment (.env file).'
    );
  }

  await loadGoogleIdentityServices();

  const google = window.google;
  if (!google?.accounts?.oauth2) {
    throw new Error('Google Identity Services failed to initialize. Please check your connection and try again.');
  }

  const oauth2 = google.accounts.oauth2;

  return new Promise<GoogleUserProfile>((resolve, reject) => {
    try {
      const client = oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: 'email profile openid',
        callback: async (response: GoogleTokenResponse) => {
          if (response.error) {
            if (response.error === 'access_denied' || response.error === 'user_cancelled') {
              return reject(new Error('Google sign-in was cancelled.'));
            }
            return reject(new Error(response.error_description || `Google sign-in failed: ${response.error}`));
          }

          if (!response.access_token) {
            return reject(new Error('No access token received from Google.'));
          }

          try {
            // Fetch Google user profile using access token
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${response.access_token}`,
              },
            });

            if (!userInfoRes.ok) {
              throw new Error(`Failed to retrieve user profile from Google (${userInfoRes.status})`);
            }

            const userInfo = await userInfoRes.json();

            if (!userInfo.email) {
              throw new Error('No email address provided by Google account.');
            }

            resolve({
              email: userInfo.email.toLowerCase().trim(),
              displayName: userInfo.name || userInfo.given_name || userInfo.email.split('@')[0],
              photoUrl: userInfo.picture || undefined,
              accessToken: response.access_token,
            });
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch Google profile details.';
            reject(new Error(message));
          }
        },
        error_callback: (error: unknown) => {
          console.error('Google token client error:', error);
          reject(new Error('Google authentication popup was blocked or closed.'));
        },
      });

      // Prompt account selection
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to open Google sign-in window.';
      reject(new Error(message));
    }
  });
}
