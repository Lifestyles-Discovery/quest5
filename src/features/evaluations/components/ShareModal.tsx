import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { useGetActiveShare, useCreateShare, useRevokeShare } from '@/hooks/api/useEvaluations';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  evaluationId: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  propertyId,
  evaluationId,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  const { data: activeShare, isLoading, error } = useGetActiveShare(propertyId, evaluationId);
  const createShare = useCreateShare();
  const revokeShare = useRevokeShare();

  const handleCopy = async () => {
    if (!activeShare?.shareUrl) return;
    try {
      await navigator.clipboard.writeText(activeShare.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCreate = () => {
    createShare.mutate({ propertyId, evaluationId });
  };

  const handleRevoke = () => {
    revokeShare.mutate(
      { propertyId, evaluationId },
      {
        onSuccess: () => {
          setShowRevokeConfirm(false);
        },
      }
    );
  };

  const handleClose = () => {
    setCopied(false);
    setShowRevokeConfirm(false);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-6 sm:p-8">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      </Modal>
    );
  }

  // Error state
  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-6 sm:p-8">
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          Share Evaluation
        </h3>
        <p className="text-sm text-error-600 dark:text-error-400">
          Unable to load share status. Please try again.
        </p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </Modal>
    );
  }

  // Revoke confirmation dialog
  if (showRevokeConfirm) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-6 sm:p-8">
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          Revoke Share Link?
        </h3>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Anyone with the current link will no longer be able to view this evaluation.
          This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowRevokeConfirm(false)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRevoke}
            disabled={revokeShare.isPending}
            className="rounded-lg bg-error-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-error-700 disabled:opacity-50"
          >
            {revokeShare.isPending ? 'Revoking...' : 'Revoke Link'}
          </button>
        </div>
      </Modal>
    );
  }

  // No share exists - show create button
  if (!activeShare) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-6 sm:p-8">
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          Share Evaluation
        </h3>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Share this evaluation with partners and investors via a view-only link.
        </p>

        <button
          type="button"
          onClick={handleCreate}
          disabled={createShare.isPending}
          className="w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {createShare.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </span>
          ) : (
            'Create Share Link'
          )}
        </button>

        <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
          Anyone with this link can view the evaluation. They cannot edit it.
        </p>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </Modal>
    );
  }

  // Share exists - show link with copy and revoke
  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-6 sm:p-8">
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        Share Evaluation
      </h3>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        This evaluation has an active share link.
      </p>

      {/* URL Display */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          Share Link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={activeShare.shareUrl}
            className="h-11 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          />
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors ${
              copied
                ? 'bg-success-500 text-white'
                : 'bg-brand-500 text-white hover:bg-brand-600'
            }`}
          >
            {copied ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Created date */}
      <p className="mb-6 text-xs text-gray-500 dark:text-gray-500">
        Created {formatDate(activeShare.createdAt)}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowRevokeConfirm(true)}
          className="text-sm font-medium text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300"
        >
          Revoke Link
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
