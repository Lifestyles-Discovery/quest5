import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

type ViewMode = 'grid' | 'fullscreen';

interface PhotoGalleryProps {
  photos: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function PhotoGallery({
  photos,
  initialIndex = 0,
  onClose,
}: PhotoGalleryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const nextPhoto = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, photos.length]);

  const prevPhoto = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleGridPhotoClick = (index: number) => {
    setCurrentIndex(index);
    setViewMode('fullscreen');
  };

  const handleBackToGrid = () => {
    setViewMode('grid');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === 'fullscreen') {
        if (e.key === 'ArrowRight') nextPhoto();
        else if (e.key === 'ArrowLeft') prevPhoto();
        else if (e.key === 'Escape') handleBackToGrid();
      } else {
        if (e.key === 'Escape') onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, nextPhoto, prevPhoto, onClose]);

  // Touch swipe (fullscreen only)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (viewMode === 'fullscreen') {
      setTouchStart(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (viewMode !== 'fullscreen' || touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextPhoto();
      } else {
        prevPhoto();
      }
    }
    setTouchStart(null);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black"
      onClick={viewMode === 'grid' ? onClose : undefined}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20 hover:text-white"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {viewMode === 'grid' ? (
        // Grid View
        <div
          className="h-full w-full overflow-auto px-4 py-16 sm:px-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => handleGridPhotoClick(index)}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <img
                    src={photo}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                </button>
              ))}
            </div>
            {/* Photo count */}
            <div className="mt-4 text-center text-sm text-white/60">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
            </div>
          </div>
        </div>
      ) : (
        // Fullscreen View
        <>
          {/* Back to grid */}
          <button
            onClick={(e) => { e.stopPropagation(); handleBackToGrid(); }}
            className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/20 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Grid
          </button>

          {/* Previous */}
          {currentIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white/70 hover:bg-white/20 hover:text-white"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Photo */}
          <img
            src={photos[currentIndex]}
            alt=""
            className="max-h-full max-w-full object-contain px-16 py-12"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {currentIndex < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white/70 hover:bg-white/20 hover:text-white"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Counter */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/60">
              {currentIndex + 1} / {photos.length}
            </div>
          )}
        </>
      )}
    </div>,
    document.body
  );
}
