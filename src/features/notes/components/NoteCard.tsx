import { format, formatDistanceToNow } from 'date-fns';
import { Card } from '@components/ui/card';
import Button from '@components/ui/button/Button';
import type { Note } from '@app-types/note.types';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  showProperty?: boolean;
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
  showProperty = true,
}: NoteCardProps) {
  const createdDate = new Date(note.createdUtc);

  return (
    <Card>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            {showProperty && (
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {note.address}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{format(createdDate, 'MMM d, yyyy')}</span>
              <span>-</span>
              <span>{formatDistanceToNow(createdDate, { addSuffix: true })}</span>
            </div>
          </div>
          <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {note.stage}
          </span>
        </div>

        {/* Note Content */}
        <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
          {note.theNote}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(note)}>
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(note)}>
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
