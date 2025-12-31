import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPhoto();
      else if (e.key === 'ArrowLeft') prevPhoto();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPhoto, prevPhoto, onClose]);

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextPhoto() : prevPhoto();
    }
    setTouchStart(null);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black px-16 py-12"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20 hover:text-white"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
          className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white/70 hover:bg-white/20 hover:text-white"
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
        className="max-h-full max-w-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next */}
      {currentIndex < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
          className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white/70 hover:bg-white/20 hover:text-white"
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
    </div>,
    document.body
  );
}
