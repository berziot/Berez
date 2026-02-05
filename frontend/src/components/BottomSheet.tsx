"use client";

import { useEffect, useRef, useState } from 'react';
import { Fountain } from '@/app/types';
import { useRouter } from 'next/navigation';
import StarRating from './StarRating';

interface BottomSheetProps {
    fountain: Fountain | null;
    userLocation: { latitude: number; longitude: number } | null;
    onClose: () => void;
}

// Calculate distance between two coordinates in meters
function calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)} מטר`;
    }
    return `${(meters / 1000).toFixed(1)} ק"מ`;
}

export default function BottomSheet({ fountain, userLocation, onClose }: BottomSheetProps) {
    const router = useRouter();
    const sheetRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [translateY, setTranslateY] = useState(0);

    // Calculate distance if we have both fountain and user location
    const distance = fountain && userLocation
        ? calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            fountain.latitude,
            fountain.longitude
        )
        : null;

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        setStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        if (diff > 0) { // Only allow dragging down
            setTranslateY(diff);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (translateY > 100) {
            onClose();
        }
        setTranslateY(0);
    };

    const openGoogleMaps = () => {
        if (fountain) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${fountain.latitude},${fountain.longitude}`,
                '_blank'
            );
        }
    };

    const goToFountainPage = () => {
        if (fountain) {
            router.push(`/${fountain.id}`);
        }
    };

    if (!fountain) return null;

    return (
        <div 
            className="fixed inset-x-0 bottom-0 z-20 pointer-events-none"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black transition-opacity pointer-events-auto ${fountain ? 'opacity-20' : 'opacity-0'}`}
                onClick={onClose}
            />
            
            {/* Sheet */}
            <div
                ref={sheetRef}
                className="relative bg-white rounded-t-3xl shadow-2xl pointer-events-auto transition-transform"
                style={{ 
                    transform: `translateY(${translateY}px)`,
                    maxHeight: '50vh'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>

                {/* Content */}
                <div className="px-4 pb-4" dir="rtl">
                    {/* Header */}
                    <div 
                        className="flex items-start justify-between mb-3 cursor-pointer"
                        onClick={goToFountainPage}
                    >
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">
                                ברזייה #{fountain.id}
                            </h3>
                            <p className="text-gray-500 text-sm truncate">
                                {fountain.address}
                            </p>
                        </div>
                        {distance !== null && (
                            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                {formatDistance(distance)}
                            </div>
                        )}
                    </div>

                    {/* Rating and features */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                            <StarRating rating={fountain.average_general_rating} size="sm" />
                            <span className="text-gray-500 text-sm">
                                ({fountain.number_of_ratings})
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {fountain.dog_friendly && (
                                <span className="text-lg" title="ידידותי לכלבים">🐕</span>
                            )}
                            {fountain.bottle_refill && (
                                <span className="text-lg" title="מילוי בקבוקים">🍼</span>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={goToFountainPage}
                            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium active:bg-blue-700 transition-colors min-h-[48px]"
                        >
                            פרטים ודירוג
                        </button>
                        <button
                            onClick={openGoogleMaps}
                            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium active:bg-gray-200 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                <circle cx="12" cy="9" r="2.5" />
                            </svg>
                            ניווט
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
