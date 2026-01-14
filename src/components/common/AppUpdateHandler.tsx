import { useEffect, useState, useCallback } from 'react';
import { useVersionCheck } from '@/hooks/useVersionCheck';
import UpdateNotification from '@/components/ui/notification/UpdateNotification';

const CHUNK_ERROR_KEY = 'chunk_error_reload';

/**
 * Handles app updates and chunk load errors.
 * - Shows notification when a new version is available
 * - Auto-reloads on chunk load errors (with loop prevention)
 */
export function AppUpdateHandler({ children }: { children: React.ReactNode }) {
  const { updateAvailable, dismiss } = useVersionCheck();
  const [showNotification, setShowNotification] = useState(false);

  // Show notification with slight delay to avoid flash on initial load
  useEffect(() => {
    if (updateAvailable) {
      const timer = setTimeout(() => setShowNotification(true), 1000);
      return () => clearTimeout(timer);
    }
    setShowNotification(false);
  }, [updateAvailable]);

  const handleUpdate = useCallback(() => {
    window.location.reload();
  }, []);

  const handleDismiss = useCallback(() => {
    dismiss();
    setShowNotification(false);
  }, [dismiss]);

  // Handle chunk load errors globally
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = event.error;
      const message = event.message || '';

      // Check for chunk load errors (various formats)
      const isChunkError =
        message.includes('Loading chunk') ||
        message.includes('Failed to fetch dynamically imported module') ||
        message.includes('Unable to preload CSS') ||
        (error?.name === 'ChunkLoadError');

      if (isChunkError) {
        // Prevent infinite reload loop
        const lastReload = sessionStorage.getItem(CHUNK_ERROR_KEY);
        const now = Date.now();

        if (lastReload && now - parseInt(lastReload, 10) < 10000) {
          // Already reloaded within 10 seconds, don't reload again
          console.error('[AppUpdateHandler] Chunk error detected but skipping reload (loop prevention)');
          return;
        }

        console.log('[AppUpdateHandler] Chunk load error detected, reloading...');
        sessionStorage.setItem(CHUNK_ERROR_KEY, now.toString());
        window.location.reload();
      }
    };

    // Handle unhandled promise rejections (dynamic imports fail as rejections)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason?.message || String(reason) || '';

      const isChunkError =
        message.includes('Failed to fetch dynamically imported module') ||
        message.includes('Loading chunk') ||
        message.includes('Unable to preload CSS');

      if (isChunkError) {
        const lastReload = sessionStorage.getItem(CHUNK_ERROR_KEY);
        const now = Date.now();

        if (lastReload && now - parseInt(lastReload, 10) < 10000) {
          console.error('[AppUpdateHandler] Chunk error (rejection) but skipping reload (loop prevention)');
          return;
        }

        console.log('[AppUpdateHandler] Chunk load error (rejection) detected, reloading...');
        sessionStorage.setItem(CHUNK_ERROR_KEY, now.toString());
        window.location.reload();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <>
      {children}
      {showNotification && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform">
          <UpdateNotification
            title="Update Available"
            message="A new version of Quest is available. Refresh to get the latest features."
            onLaterClick={handleDismiss}
            onUpdateClick={handleUpdate}
          />
        </div>
      )}
    </>
  );
}
