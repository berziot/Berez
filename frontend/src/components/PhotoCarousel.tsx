"use client";

import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

interface Photo {
    id: number;
    url: string;
}

interface PhotoCarouselProps {
    photos: Photo[];
    emptyIcon?: React.ReactNode;
    emptyText?: string;
}

// Default fountain icon for empty state
const DefaultFountainIcon = () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
        <path d="M12 2v6M12 22v-6M5 12H2M22 12h-3M12 8a4 4 0 0 0-4 4c0 2.5 4 8 4 8s4-5.5 4-8a4 4 0 0 0-4-4z" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

export default function PhotoCarousel({ 
    photos, 
    emptyIcon,
    emptyText = "אין תמונות עדיין" 
}: PhotoCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ 
        loop: true,
        direction: 'rtl',
    });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [fullscreenPhoto, setFullscreenPhoto] = useState<Photo | null>(null);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', onSelect);
        onSelect();
    }, [emblaApi, onSelect]);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const scrollTo = useCallback((index: number) => {
        if (emblaApi) emblaApi.scrollTo(index);
    }, [emblaApi]);

    // Empty state
    if (!photos || photos.length === 0) {
        return (
            <div className="bg-gray-100 rounded-2xl aspect-video flex flex-col items-center justify-center gap-3 text-gray-400">
                {emptyIcon || <DefaultFountainIcon />}
                <span className="text-sm">{emptyText}</span>
            </div>
        );
    }

    // Single photo - no carousel needed
    if (photos.length === 1) {
        return (
            <div 
                className="rounded-2xl overflow-hidden aspect-video cursor-pointer"
                onClick={() => setFullscreenPhoto(photos[0])}
            >
                <img
                    src={photos[0].url}
                    alt="תמונת הברזייה"
                    className="w-full h-full object-cover"
                />
                
                {/* Fullscreen modal */}
                {fullscreenPhoto && (
                    <FullscreenModal 
                        photo={fullscreenPhoto} 
                        onClose={() => setFullscreenPhoto(null)} 
                    />
                )}
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Carousel */}
            <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
                <div className="flex">
                    {photos.map((photo, index) => (
                        <div 
                            key={photo.id} 
                            className="flex-[0_0_100%] min-w-0 aspect-video cursor-pointer"
                            onClick={() => setFullscreenPhoto(photo)}
                        >
                            <img
                                src={photo.url}
                                alt={`תמונה ${index + 1}`}
                                className="w-full h-full object-cover"
                                loading={index === 0 ? 'eager' : 'lazy'}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation arrows - only show on larger screens or when > 2 photos */}
            {photos.length > 2 && (
                <>
                    <button
                        onClick={scrollPrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md active:bg-white transition-colors hidden sm:block"
                        aria-label="תמונה קודמת"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <button
                        onClick={scrollNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md active:bg-white transition-colors hidden sm:block"
                        aria-label="תמונה הבאה"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </>
            )}

            {/* Dots indicator */}
            <div className="flex justify-center gap-1.5 mt-3">
                {photos.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                            index === selectedIndex 
                                ? 'bg-blue-600 w-4' 
                                : 'bg-gray-300'
                        }`}
                        aria-label={`עבור לתמונה ${index + 1}`}
                    />
                ))}
            </div>

            {/* Fullscreen modal */}
            {fullscreenPhoto && (
                <FullscreenModal 
                    photo={fullscreenPhoto} 
                    onClose={() => setFullscreenPhoto(null)} 
                />
            )}
        </div>
    );
}

// Fullscreen photo modal
function FullscreenModal({ photo, onClose }: { photo: Photo; onClose: () => void }) {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white p-2 z-10"
                aria-label="סגור"
            >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
            <img
                src={photo.url}
                alt="תמונה בגודל מלא"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}
