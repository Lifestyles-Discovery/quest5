import { useState } from 'react';
import Button from '@components/ui/button/Button';
import {
  useGetDocumentUrl,
  useUpdateDocumentName,
  useDeleteDocument,
} from '@hooks/api/useDocuments';
import type { Document } from '@app-types/document.types';

interface DocumentItemProps {
  document: Document;
  propertyId: string;
}

const FILE_ICONS: Record<string, string> = {
  'application/pdf':
    'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  'image/':
    'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  default:
    'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
};

function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) {
    return FILE_ICONS['image/'];
  }
  return FILE_ICONS[mimeType] || FILE_ICONS.default;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function DocumentItem({ document, propertyId }: DocumentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(document.name);

  const getDocumentUrl = useGetDocumentUrl();
  const updateDocumentName = useUpdateDocumentName();
  const deleteDocument = useDeleteDocument();

  const handleDownload = async () => {
    try {
      const { url } = await getDocumentUrl.mutateAsync({
        propertyId,
        documentId: document.id,
      });
      window.open(url, '_blank');
    } catch {
      // Error handling is done via the mutation state
    }
  };

  const handleSaveName = () => {
    if (editName.trim() && editName !== document.name) {
      updateDocumentName.mutate(
        {
          propertyId,
          documentId: document.id,
          name: editName.trim(),
        },
        {
          onSuccess: () => {
            setIsEditing(false);
          },
        }
      );
    } else {
      setIsEditing(false);
      setEditName(document.name);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${document.name}"?`)) {
      deleteDocument.mutate({
        propertyId,
        documentId: document.id,
      });
    }
  };

  const iconPath = getFileIcon(document.type);

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {/* File Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
        <svg
          className="h-5 w-5 text-gray-500 dark:text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>

      {/* File Info */}
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveName();
              if (e.key === 'Escape') {
                setIsEditing(false);
                setEditName(document.name);
              }
            }}
            autoFocus
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
          />
        ) : (
          <p
            className="cursor-pointer truncate text-sm font-medium text-gray-800 hover:text-brand-500 dark:text-white/90"
            onClick={() => setIsEditing(true)}
            title="Click to rename"
          >
            {document.name}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatFileSize(document.size)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={getDocumentUrl.isPending}
        >
          {getDocumentUrl.isPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={deleteDocument.isPending}
        >
          {deleteDocument.isPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          ) : (
            <svg
              className="h-4 w-4 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
}
