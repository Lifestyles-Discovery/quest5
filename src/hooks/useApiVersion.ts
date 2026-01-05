import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

/**
 * Hook to fetch the API version from the backend
 * Returns the version string or 'unknown' if fetch fails
 */
export function useApiVersion() {
  const [apiVersion, setApiVersion] = useState<string>('');

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        // API returns plain string like "1.10.25"
        const response = await apiClient.get('helpers/version');
        // Remove quotes if present (API returns JSON string)
        const version = typeof response.data === 'string'
          ? response.data.replace(/"/g, '')
          : response.data;
        setApiVersion(version || 'unknown');
      } catch {
        setApiVersion('unknown');
      }
    };

    fetchVersion();
  }, []);

  return apiVersion;
}
