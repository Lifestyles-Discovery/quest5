import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  useCopyEvaluation,
  useDeleteEvaluation,
  useExportPdf,
  useShareEvaluation,
  useUpdateAttributes,
} from '@/hooks/api/useEvaluations';
import type { Property } from '@app-types/property.types';
import type { Evaluation } from '@app-types/evaluation.types';
import ShareModal from './ShareModal';
import EmailModal from './EmailModal';

interface EvaluationHeaderProps {
  propertyId: string;
  evaluationId: string;
  property?: Property;
  evaluation: Evaluation;
}

export default function EvaluationHeader({
  propertyId,
  evaluationId,
  property,
  evaluation,
}: EvaluationHeaderProps) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const copyEvaluation = useCopyEvaluation();
  const deleteEvaluation = useDeleteEvaluation();
  const exportPdf = useExportPdf();
  const shareEvaluation = useShareEvaluation();
  const updateAttributes = useUpdateAttributes();

  // Inline name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const startEditingName = () => {
    setEditNameValue(evaluation.name || '');
    setIsEditingName(true);
  };

  const saveName = () => {
    const trimmedName = editNameValue.trim();
    updateAttributes.mutate({
      propertyId,
      evaluationId,
      attributes: { name: trimmedName },
    });
    setIsEditingName(false);
  };

  const cancelEditName = () => {
    setIsEditingName(false);
    setEditNameValue('');
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveName();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditName();
    }
  };

  const handleCopy = () => {
    copyEvaluation.mutate(
      { propertyId, evaluationId },
      {
        onSuccess: (newEval) => {
          navigate(`/deals/${propertyId}/scenario/${newEval.id}`);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteEvaluation.mutate(
      { propertyId, evaluationId },
      {
        onSuccess: () => {
          navigate(`/deals/${propertyId}`);
        },
      }
    );
  };

  const handleExportPdf = () => {
    if (!property) {
      alert('Property data not loaded. Please try again.');
      return;
    }
    exportPdf.mutate(
      { evaluation, property },
      {
        onError: (error) => {
          console.error('PDF export failed:', error);
          alert(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        },
      }
    );
  };

  const handleShare = () => {
    shareEvaluation.mutate(
      { propertyId, evaluationId },
      {
        onSuccess: (data) => {
          setShareUrl(data.shareUrl);
          setShowShareModal(true);
        },
      }
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Property Info */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {property?.address || 'Property Evaluation'}
            </h1>
            {property && (
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {property.city}, {property.state} {property.zip}
              </p>
            )}
            {/* Editable Scenario Name */}
            <div className="mt-2">
              {isEditingName ? (
                <input
                  ref={nameInputRef}
                  type="text"
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={handleNameKeyDown}
                  placeholder="Name this scenario..."
                  className="w-full max-w-xs rounded border border-brand-300 bg-white px-2 py-1 text-sm font-medium text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-brand-600 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <button
                  onClick={startEditingName}
                  className="group flex items-center gap-1 text-sm"
                >
                  <span className={evaluation.name
                    ? "font-medium text-gray-700 dark:text-gray-300"
                    : "text-gray-400 dark:text-gray-500 italic"
                  }>
                    {evaluation.name || "Name this scenario..."}
                  </span>
                  <svg
                    className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
              Created: {formatDate(evaluation.created)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              disabled={copyEvaluation.isPending}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copyEvaluation.isPending ? 'Copying...' : 'Copy'}
            </button>

            <button
              onClick={handleExportPdf}
              disabled={exportPdf.isPending}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {exportPdf.isPending ? 'Generating...' : 'PDF'}
            </button>

            <button
              onClick={handleShare}
              disabled={shareEvaluation.isPending}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {shareEvaluation.isPending ? 'Sharing...' : 'Share'}
            </button>

            <button
              onClick={() => setShowEmailModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-600 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Evaluation?
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              This action cannot be undone. All comp data and calculations will be permanently deleted.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteEvaluation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteEvaluation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={shareUrl}
      />

      {/* Email Modal */}
      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        propertyId={propertyId}
        evaluationId={evaluationId}
        propertyAddress={property?.address}
      />
    </>
  );
}
