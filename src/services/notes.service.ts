import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Note, NoteFormData } from '@app-types/note.types';

/**
 * Notes service for managing property notes
 */
export const notesService = {
  /**
   * Get all notes across properties
   */
  async getAllNotes(includeInactive: boolean = false): Promise<Note[]> {
    const response = await apiClient.get<Note[]>(ENDPOINTS.notes.listAll, {
      headers: {
        includeInactive: String(includeInactive),
      },
    });
    return response.data;
  },

  /**
   * Create a note for a property
   */
  async createNote(propertyId: string, data: NoteFormData): Promise<Note> {
    const response = await apiClient.post<Note>(
      ENDPOINTS.notes.create(propertyId),
      data
    );
    return response.data;
  },

  /**
   * Update a note
   */
  async updateNote(
    propertyId: string,
    noteId: string,
    data: NoteFormData
  ): Promise<Note> {
    const response = await apiClient.put<Note>(
      ENDPOINTS.notes.update(propertyId, noteId),
      data
    );
    return response.data;
  },

  /**
   * Delete a note
   */
  async deleteNote(propertyId: string, noteId: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.notes.delete(propertyId, noteId));
  },
};
