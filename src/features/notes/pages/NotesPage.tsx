import { useState } from 'react';
import PageMeta from '@components/common/PageMeta';
import PageBreadcrumb from '@components/common/PageBreadCrumb';
import { NoteCard } from '../components/NoteCard';
import { NoteModal } from '../components/NoteModal';
import { useNotes, useDeleteNote } from '@hooks/api/useNotes';
import type { Note } from '@app-types/note.types';
import { Skeleton } from '@components/ui/skeleton/Skeleton';
import Checkbox from '@components/form/input/Checkbox';

function NoteCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Note content */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-14 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function NotesPageSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((group) => (
        <div key={group}>
          <Skeleton className="mb-4 h-6 w-56" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[1, 2].map((i) => (
              <NoteCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [includeInactive, setIncludeInactive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: notes, isLoading, error } = useNotes(includeInactive);
  const deleteNote = useDeleteNote();

  // Filter notes by search query
  const filteredNotes = notes?.filter(
    (note) =>
      note.theNote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group notes by property address
  const groupedNotes = filteredNotes?.reduce(
    (acc, note) => {
      if (!acc[note.address]) {
        acc[note.address] = [];
      }
      acc[note.address].push(note);
      return acc;
    },
    {} as Record<string, Note[]>
  );

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setEditingNote(undefined);
    setIsModalOpen(false);
  };

  const handleDelete = (note: Note) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote.mutate({
        propertyId: note.propertyId,
        noteId: note.id,
      });
    }
  };

  return (
    <>
      <PageMeta
        title="Notes | Quest"
        description="View and manage notes across all properties"
      />

      <PageBreadcrumb pageTitle="Notes" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Notes
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filteredNotes?.length ?? 0} notes across all properties
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 sm:max-w-xs">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 bg-transparent pl-10 pr-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
            />
          </div>

          <Checkbox
            label="Include inactive"
            checked={includeInactive}
            onChange={setIncludeInactive}
          />
        </div>

        {/* Note Modal */}
        {editingNote && (
          <NoteModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            propertyId={editingNote.propertyId}
            note={editingNote}
          />
        )}

        {/* Loading State */}
        {isLoading && <NotesPageSkeleton />}

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">
              Error loading notes. Please try again.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredNotes?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mb-1 text-lg font-medium text-gray-800 dark:text-white/90">
              No notes found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Notes can be added from individual property pages.
            </p>
          </div>
        )}

        {/* Notes Grouped by Property */}
        {!isLoading &&
          !error &&
          groupedNotes &&
          Object.keys(groupedNotes).length > 0 && (
            <div className="space-y-8">
              {Object.entries(groupedNotes).map(([address, propertyNotes]) => (
                <div key={address}>
                  <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                    {address}
                  </h2>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {propertyNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        showProperty={false}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </>
  );
}
