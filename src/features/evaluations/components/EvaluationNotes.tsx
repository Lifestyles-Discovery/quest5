import { useState, useCallback, useEffect } from 'react';
import { useUpdateNotes } from '@/hooks/api/useEvaluations';
import { debounce } from '@/utils/debounce';

interface EvaluationNotesProps {
  propertyId: string;
  evaluationId: string;
  notes: string;
}

export default function EvaluationNotes({
  propertyId,
  evaluationId,
  notes: initialNotes,
}: EvaluationNotesProps) {
  const [notes, setNotes] = useState(initialNotes);

  // Sync local state with prop when it changes (e.g., after refresh)
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const updateNotes = useUpdateNotes();

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((value: string) => {
      setIsSaving(true);
      updateNotes.mutate(
        { propertyId, evaluationId, notes: value },
        {
          onSuccess: () => {
            setIsSaving(false);
            setLastSaved(new Date());
          },
          onError: () => {
            setIsSaving(false);
          },
        }
      );
    }, 1000),
    [propertyId, evaluationId]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);
    debouncedSave(value);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notes
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isSaving ? (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : lastSaved ? (
              <span>Saved at {formatTime(lastSaved)}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Interactive textarea - hidden during PDF export */}
        <textarea
          value={notes}
          onChange={handleChange}
          placeholder="Add notes about this evaluation..."
          rows={6}
          className="block w-full resize-none rounded-lg border border-gray-300 p-3 text-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        />
        {/* Static content for PDF export - only visible when printing */}
        <div
          className="hidden whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300"
          data-print-content="true"
        >
          {notes || 'No notes added.'}
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400" data-hide-in-pdf="true">
          Notes are automatically saved as you type.
        </p>
      </div>
    </div>
  );
}
