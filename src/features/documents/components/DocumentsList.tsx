import { DocumentItem } from './DocumentItem';
import { DocumentUploader } from './DocumentUploader';
import type { Document } from '@app-types/document.types';

interface DocumentsListProps {
  documents: Document[];
  propertyId: string;
  showUploader?: boolean;
}

export function DocumentsList({
  documents,
  propertyId,
  showUploader = true,
}: DocumentsListProps) {
  return (
    <div className="space-y-4">
      {showUploader && <DocumentUploader propertyId={propertyId} />}

      {documents.length === 0 ? (
        <div className="py-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600"
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
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No documents yet. Upload files above.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <DocumentItem key={doc.id} document={doc} propertyId={propertyId} />
          ))}
        </div>
      )}
    </div>
  );
}
