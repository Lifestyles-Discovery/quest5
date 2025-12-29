import { useRef, useState } from 'react';
import Alert from '@components/ui/alert/Alert';
import { useUploadDocument } from '@hooks/api/useDocuments';

interface DocumentUploaderProps {
  propertyId: string;
  onUploadComplete?: () => void;
}

export function DocumentUploader({
  propertyId,
  onUploadComplete,
}: DocumentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadDocument = useUploadDocument();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);

    // Upload each file
    for (const file of Array.from(files)) {
      try {
        await uploadDocument.mutateAsync({ propertyId, file });
      } catch {
        setError(`Failed to upload ${file.name}`);
        return;
      }
    }

    onUploadComplete?.();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="error" title="Upload Error" message={error} />
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10'
            : 'border-gray-300 dark:border-gray-700'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {uploadDocument.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              Uploading...
            </span>
          ) : (
            <>
              Drag and drop files here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-medium text-brand-500 hover:text-brand-600"
              >
                browse
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
