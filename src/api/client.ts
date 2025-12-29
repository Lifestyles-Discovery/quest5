import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Base URLs
const API_URLS = {
  production: 'https://h59rfx3wm9.execute-api.us-east-1.amazonaws.com/prod/v1',
  test: 'https://jayon7xbeb.execute-api.us-east-1.amazonaws.com/test/v1',
  dev: 'https://localhost:5001/v1',
} as const;

// Use production by default, can be overridden via environment variable
const baseURL = import.meta.env.VITE_API_URL || API_URLS.production;

/**
 * Get the session key from sessionStorage
 */
function getSessionKey(): string {
  const sessionData = sessionStorage.getItem('session');
  if (!sessionData) return '';

  try {
    const session = JSON.parse(sessionData);
    return session.sessionKey || '';
  } catch {
    return '';
  }
}

/**
 * Get the full session object from sessionStorage
 */
export function getStoredSession() {
  const sessionData = sessionStorage.getItem('session');
  if (!sessionData) return null;

  try {
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

/**
 * Store session in sessionStorage
 */
export function storeSession(session: unknown) {
  sessionStorage.setItem('session', JSON.stringify(session));
}

/**
 * Clear session from sessionStorage
 */
export function clearSession() {
  sessionStorage.removeItem('session');
}

/**
 * Axios instance configured for the Liberator API
 */
export const apiClient = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - adds sessionKey header to all requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const sessionKey = getSessionKey();
    if (sessionKey) {
      config.headers.sessionKey = sessionKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handles 401 unauthorized errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear session and redirect to login
      clearSession();

      // Dispatch a custom event that the auth context can listen to
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }
    return Promise.reject(error);
  }
);

export { baseURL };
