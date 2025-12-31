import { useState } from 'react';
import PhotoGallery from './PhotoGallery';

interface PhotoThumbnailProps {
  photos: string[];
  size?: 'sm' | 'md';
  className?: string;
}

export default function PhotoThumbnail({
  photos,
  size = 'sm',
  className = '',
}: PhotoThumbnailProps) {
  const [showGallery, setShowGallery] = useState(false);

  const sizeClasses = size === 'sm' ? 'h-10 w-10' : 'h-16 w-16';

  // No photos = show placeholder
  if (!photos || photos.length === 0) {
    return (
      <div className={`${sizeClasses} flex items-center justify-center rounded bg-gray-100 dark:bg-gray-800 ${className}`}>
        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowGallery(true)}
        className={`${sizeClasses} relative overflow-hidden rounded hover:opacity-90 ${className}`}
      >
        <img
          src={photos[0]}
          alt=""
          className="h-full w-full object-cover"
        />
        {photos.length > 1 && (
          <div className="absolute bottom-0 right-0 rounded-tl bg-black/70 px-1 text-[10px] text-white">
            +{photos.length - 1}
          </div>
        )}
      </button>

      {showGallery && (
        <PhotoGallery photos={photos} onClose={() => setShowGallery(false)} />
      )}
    </>
  );
}
