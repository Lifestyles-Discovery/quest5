import { useState, useEffect } from 'react';
import { Modal } from '@components/ui/modal';
import Label from '@components/form/Label';
import Button from '@components/ui/button/Button';
import Alert from '@components/ui/alert/Alert';
import { useCreateNote, useUpdateNote } from '@hooks/api/useNotes';
import { PROPERTY_STAGES } from '@app-types/property.types';
import type { NoteFormData } from '@app-types/note.types';

// Simplified type for the note prop - needs id, content, and stage
interface EditableNote {
  id: string;
  theNote: string;
  stage: string;
}

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  note?: EditableNote; // If provided, we're editing
  stage?: string; // Property stage for new notes
}

export function NoteModal({ isOpen, onClose, propertyId, note, stage: defaultStage }: NoteModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [theNote, setTheNote] = useState('');
  const [stage, setStage] = useState('');

  // Mutations
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  const isPending = createNote.isPending || updateNote.isPending;
  const isEditing = !!note;

  // Populate form when editing or set default stage for new notes
  useEffect(() => {
    if (note) {
      setTheNote(note.theNote);
      setStage(note.stage);
    } else {
      resetForm();
      setStage(defaultStage || 'Finding');
    }
  }, [note, isOpen, defaultStage]);

  const resetForm = () => {
    setTheNote('');
    setStage('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    setError(null);

    if (!theNote.trim()) {
      setError('Entry content is required');
      return;
    }

    const data: NoteFormData = { theNote: theNote.trim(), stage };

    if (isEditing && note) {
      updateNote.mutate(
        {
          propertyId,
          noteId: note.id,
          data,
        },
        {
          onSuccess: () => {
            handleClose();
          },
          onError: () => {
            setError('Failed to update entry');
          },
        }
      );
    } else {
      createNote.mutate(
        {
          propertyId,
          data,
          stage: data.stage,
        },
        {
          onSuccess: () => {
            handleClose();
          },
          onError: () => {
            setError('Failed to create entry');
          },
        }
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {isEditing ? 'Edit Activity Entry' : 'New Activity Entry'}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isEditing ? 'Update this activity log entry' : 'Add an entry to the activity log'}
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error" title="Error" message={error} />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label>Stage</Label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            disabled={isPending}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
          >
            {PROPERTY_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Entry</Label>
          <textarea
            value={theNote}
            onChange={(e) => setTheNote(e.target.value)}
            disabled={isPending}
            rows={6}
            placeholder="What happened with this deal?"
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isPending}>
            {isPending
              ? isEditing
                ? 'Saving...'
                : 'Adding...'
              : isEditing
                ? 'Save Changes'
                : 'Add Entry'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
