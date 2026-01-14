import { useState, useEffect, useCallback } from 'react';

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const VERSION_FILE = '/version.json';

interface VersionCheckResult {
  updateAvailable: boolean;
  dismiss: () => void;
}

/**
 * Hook that periodically checks for app updates by comparing
 * the build-time version against the server's latest version.
 */
export function useVersionCheck(): VersionCheckResult {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const checkVersion = useCallback(async () => {
    try {
      // Add cache-busting timestamp to bypass browser cache
      const response = await fetch(`${VERSION_FILE}?t=${Date.now()}`);
      if (!response.ok) return;

      const data = await response.json();
      const serverVersion = data.version;
      const currentVersion = __APP_VERSION__;

      if (serverVersion && serverVersion !== currentVersion) {
        console.log(`[VersionCheck] Update available: ${currentVersion} → ${serverVersion}`);
        setUpdateAvailable(true);
      }
    } catch (error) {
      // Silently fail - version check is non-critical
      console.debug('[VersionCheck] Failed to check version:', error);
    }
  }, []);

  useEffect(() => {
    // Check immediately on mount
    checkVersion();

    // Then check periodically
    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    // Also check when tab becomes visible (user returns to app)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkVersion]);

  const dismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  return {
    updateAvailable: updateAvailable && !dismissed,
    dismiss,
  };
}
