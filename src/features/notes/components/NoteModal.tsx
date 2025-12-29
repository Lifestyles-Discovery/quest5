import { useState, useEffect } from 'react';
import { Modal } from '@components/ui/modal';
import Label from '@components/form/Label';
import Button from '@components/ui/button/Button';
import Alert from '@components/ui/alert/Alert';
import { useCreateNote, useUpdateNote } from '@hooks/api/useNotes';
import type { Note, NoteFormData } from '@app-types/note.types';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  note?: Note; // If provided, we're editing
}

export function NoteModal({ isOpen, onClose, propertyId, note }: NoteModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [theNote, setTheNote] = useState('');

  // Mutations
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  const isPending = createNote.isPending || updateNote.isPending;
  const isEditing = !!note;

  // Populate form when editing
  useEffect(() => {
    if (note) {
      setTheNote(note.theNote);
    } else {
      resetForm();
    }
  }, [note, isOpen]);

  const resetForm = () => {
    setTheNote('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    setError(null);

    if (!theNote.trim()) {
      setError('Note content is required');
      return;
    }

    const data: NoteFormData = { theNote: theNote.trim() };

    if (isEditing && note) {
      updateNote.mutate(
        {
          propertyId: note.propertyId,
          noteId: note.id,
          data,
        },
        {
          onSuccess: () => {
            handleClose();
          },
          onError: () => {
            setError('Failed to update note');
          },
        }
      );
    } else {
      createNote.mutate(
        {
          propertyId,
          data,
        },
        {
          onSuccess: () => {
            handleClose();
          },
          onError: () => {
            setError('Failed to create note');
          },
        }
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {isEditing ? 'Edit Note' : 'New Note'}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isEditing ? 'Update your note' : 'Add a note to this property'}
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error" title="Error" message={error} />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label>Note</Label>
          <textarea
            value={theNote}
            onChange={(e) => setTheNote(e.target.value)}
            disabled={isPending}
            rows={6}
            placeholder="Enter your note..."
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
                : 'Creating...'
              : isEditing
                ? 'Save Changes'
                : 'Create Note'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
