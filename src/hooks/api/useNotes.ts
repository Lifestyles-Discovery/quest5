import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notesService } from '@services/notes.service';
import type { NoteFormData } from '@app-types/note.types';

/**
 * Query keys for notes-related queries
 */
export const notesKeys = {
  all: ['notes'] as const,
  list: (includeInactive: boolean = false) =>
    [...notesKeys.all, 'list', { includeInactive }] as const,
};

/**
 * Hook to fetch all notes across properties
 */
export function useNotes(includeInactive: boolean = false) {
  return useQuery({
    queryKey: notesKeys.list(includeInactive),
    queryFn: () => notesService.getAllNotes(includeInactive),
  });
}

/**
 * Hook to create a new note for a property
 */
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      data,
      stage,
    }: {
      propertyId: string;
      data: NoteFormData;
      stage?: string;
    }) => notesService.createNote(propertyId, data, stage),
    onSuccess: () => {
      // Invalidate all notes queries
      queryClient.invalidateQueries({ queryKey: notesKeys.all });
      // Also invalidate properties since notes are tied to them
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

/**
 * Hook to update a note
 */
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      noteId,
      data,
    }: {
      propertyId: string;
      noteId: string;
      data: NoteFormData;
    }) => notesService.updateNote(propertyId, noteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.all });
      // Also invalidate properties since notes are nested in property data
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

/**
 * Hook to delete a note
 */
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      noteId,
    }: {
      propertyId: string;
      noteId: string;
    }) => notesService.deleteNote(propertyId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.all });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
