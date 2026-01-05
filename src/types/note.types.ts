/**
 * Note types
 */

export interface Note {
  id: string;
  propertyId: string;
  createdUtc: string;
  stage: string; // Property stage when note was created
  theNote: string;
  address: string; // Property address for display
}

export interface NoteFormData {
  theNote: string;
  stage?: string;
}

export interface NotesFilter {
  includeInactive?: boolean;
}
