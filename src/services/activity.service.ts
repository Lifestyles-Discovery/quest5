/**
 * Activity tracking service for Quest5 usage analytics.
 *
 * Easy to remove:
 * 1. Delete this file
 * 2. Remove 'activity' from endpoints.ts
 * 3. Remove trackActivity() calls (grep for "trackActivity")
 */

import { apiClient } from '@/api/client';

// Feature flag - set to false to disable all tracking
const TRACKING_ENABLED = true;

/**
 * Track a user activity. Fire-and-forget - never blocks UI.
 * @param action - Short action name: 'login', 'create_evaluation', 'export_pdf'
 * @param details - Optional context object (will be JSON stringified)
 */
export function trackActivity(
  action: string,
  details?: Record<string, unknown>
): void {
  if (!TRACKING_ENABLED) return;

  // Fire and forget - don't await, swallow errors
  apiClient
    .post('activity', null, {
      headers: {
        action,
        ...(details && { details: JSON.stringify(details) }),
      },
    })
    .catch(() => {
      // Silently ignore tracking failures
    });
}
