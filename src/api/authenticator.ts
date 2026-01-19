import axios from 'axios';

// Authenticator API Base URLs
const API_URLS = {
  production: 'https://aqo35wclm7.execute-api.us-east-1.amazonaws.com/prod/v1',
  dev: 'https://localhost:5002/v1',
} as const;

// Use production by default, can be overridden via environment variable
const baseURL = import.meta.env.VITE_AUTHENTICATOR_URL || API_URLS.production;

// API Key for subscription creation
const API_KEY = 'f1aa4012-2a62-4f6c-b50d-b38857239d01';

/**
 * Axios instance configured for the Authenticator API
 * Used for subscription management (signup, reactivation, billing)
 */
export const authenticatorClient = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Quest product identifier for Chargify
export const QUEST_PRODUCT = {
  name: 'Quest',
} as const;

export { API_KEY, baseURL as authenticatorBaseURL };
