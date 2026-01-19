import { useState, useRef, useEffect } from 'react';
import { useCopyEvaluation, useUpdateAttributes, useUpdateNotes } from '@hooks/api/useEvaluations';
import type { Property } from '@app-types/property.types';

/**
 * Helper to truncate notes and strip any HTML for preview display
 */
function getNotesPreview(notes: string | undefined | null, maxLength: number = 80): string {
  if (!notes) return '';
  // Strip HTML tags and decode entities
  const stripped = notes.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).trim() + '...';
}

interface ScenarioHistoryProps {
  property: Property;
  currentEvaluationId: string;
  onScenarioSelect: (evaluationId: string) => void;
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * ScenarioHistory - Shows previous evaluations and allows creating new scenarios.
 *
 * - Collapsed by default
 * - "New Scenario" copies current evaluation for what-if analysis
 * - Lists previous evaluations with name (or date) and key metrics
 * - Click name/date to rename inline
 * - Click row to switch to that scenario
 */
export function ScenarioHistory({
  property,
  currentEvaluationId,
  onScenarioSelect,
}: ScenarioHistoryProps) {
  const copyEvaluation = useCopyEvaluation();
  const updateAttributes = useUpdateAttributes();
  const updateNotes = useUpdateNotes();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Notes editing state
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesEditValue, setNotesEditValue] = useState('');
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  // Focus notes textarea when entering notes edit mode
  useEffect(() => {
    if (editingNotesId && notesTextareaRef.current) {
      notesTextareaRef.current.focus();
      notesTextareaRef.current.select();
    }
  }, [editingNotesId]);

  const handleNewScenario = () => {
    copyEvaluation.mutate(
      { propertyId: property.id, evaluationId: currentEvaluationId },
      {
        onSuccess: (newEval) => {
          onScenarioSelect(newEval.id);
        },
      }
    );
  };

  const startEditing = (evaluationId: string, currentName: string | undefined) => {
    setEditingId(evaluationId);
    setEditValue(currentName || '');
  };

  const saveEdit = (evaluationId: string) => {
    const trimmedName = editValue.trim();
    updateAttributes.mutate({
      propertyId: property.id,
      evaluationId,
      attributes: { name: trimmedName },
    });
    setEditingId(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, evaluationId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit(evaluationId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  // Notes editing functions
  const startEditingNotes = (evaluationId: string, currentNotes: string | undefined) => {
    setEditingNotesId(evaluationId);
    setNotesEditValue(currentNotes || '');
  };

  const saveNotesEdit = (evaluationId: string) => {
    const trimmedNotes = notesEditValue.trim();
    updateNotes.mutate({
      propertyId: property.id,
      evaluationId,
      notes: trimmedNotes,
    });
    setEditingNotesId(null);
    setNotesEditValue('');
  };

  const cancelNotesEdit = () => {
    setEditingNotesId(null);
    setNotesEditValue('');
  };

  const handleNotesKeyDown = (e: React.KeyboardEvent, evaluationId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveNotesEdit(evaluationId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelNotesEdit();
    }
  };

  const otherEvaluations = property.evaluations?.filter(
    (e) => e.id !== currentEvaluationId
  );

  // If only one evaluation, just show New Scenario button
  if (!otherEvaluations?.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              Want to try different assumptions?
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Create a new scenario to compare different numbers
            </p>
          </div>
          <button
            onClick={handleNewScenario}
            disabled={copyEvaluation.isPending}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {copyEvaluation.isPending ? 'Creating...' : 'New Scenario'}
          </button>
        </div>
      </div>
    );
  }

  // Multiple evaluations - show collapsible history
  return (
    <details className="group rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <summary className="cursor-pointer list-none px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              Previous Scenarios
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({otherEvaluations.length})
            </span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleNewScenario();
            }}
            disabled={copyEvaluation.isPending}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {copyEvaluation.isPending ? 'Creating...' : '+ New Scenario'}
          </button>
        </div>
      </summary>

      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <div className="space-y-2">
          {otherEvaluations.map((evaluation) => (
            <div
              key={evaluation.id}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-brand-600 dark:hover:bg-gray-800"
            >
              <div className="flex-1 min-w-0">
                {editingId === evaluation.id ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveEdit(evaluation.id)}
                    onKeyDown={(e) => handleKeyDown(e, evaluation.id)}
                    placeholder={formatDate(evaluation.created)}
                    className="w-full rounded border border-brand-300 bg-white px-2 py-1 text-sm font-medium text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-brand-600 dark:bg-gray-800 dark:text-white"
                  />
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(evaluation.id, evaluation.name);
                    }}
                    className="text-left group/name"
                  >
                    <p className="text-sm font-medium text-gray-800 dark:text-white group-hover/name:text-brand-600 dark:group-hover/name:text-brand-400">
                      {evaluation.name || formatDate(evaluation.created)}
                    </p>
                    {evaluation.name && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(evaluation.created)}
                      </p>
                    )}
                  </button>
                )}
                {/* Notes preview/editing */}
                {editingNotesId === evaluation.id ? (
                  <div className="mt-1">
                    <textarea
                      ref={notesTextareaRef}
                      value={notesEditValue}
                      onChange={(e) => setNotesEditValue(e.target.value)}
                      onBlur={() => saveNotesEdit(evaluation.id)}
                      onKeyDown={(e) => handleNotesKeyDown(e, evaluation.id)}
                      placeholder="Add notes..."
                      rows={2}
                      className="w-full rounded border border-brand-300 bg-white px-2 py-1 text-xs text-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-brand-600 dark:bg-gray-800 dark:text-gray-300"
                    />
                    <p className="mt-0.5 text-xs text-gray-400">
                      Enter to save, Shift+Enter for new line, Esc to cancel
                    </p>
                  </div>
                ) : (
                  getNotesPreview(evaluation.notes) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingNotes(evaluation.id, evaluation.notes);
                      }}
                      className="mt-1 text-left text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {getNotesPreview(evaluation.notes)}
                    </button>
                  )
                )}
                {/* Add notes link if no notes exist */}
                {!editingNotesId && !getNotesPreview(evaluation.notes) && editingId !== evaluation.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingNotes(evaluation.id, evaluation.notes);
                    }}
                    className="mt-1 text-xs text-gray-400 hover:text-brand-500 dark:hover:text-brand-400"
                  >
                    + Add notes
                  </button>
                )}
              </div>
              <button
                onClick={() => onScenarioSelect(evaluation.id)}
                className="flex items-center gap-2 pl-3"
              >
                {evaluation.listPrice && (
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    ${evaluation.listPrice.toLocaleString()}
                  </span>
                )}
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
