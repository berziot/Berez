"use client";

import { Fountain } from '@/app/types';
import { useRouter } from 'next/navigation';
import StarRating from './StarRating';

interface FountainCardProps {
    fountain: Fountain;
    distance: number | null;
    onNavigate?: () => void;
}

// Format distance for display
function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)} מ'`;
    }
    return `${(meters / 1000).toFixed(1)} ק"מ`;
}

export default function FountainCard({ fountain, distance, onNavigate }: FountainCardProps) {
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/${fountain.id}`);
    };

    const handleRateClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/${fountain.id}?review=true`);
    };

    const handleNavigateClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onNavigate) {
            onNavigate();
        } else {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${fountain.latitude},${fountain.longitude}`,
                '_blank'
            );
        }
    };

    return (
        <div 
            className="card cursor-pointer active:scale-[0.99] transition-transform"
            onClick={handleCardClick}
        >
            {/* Header row */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    {/* Fountain icon */}
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2">
                            <path d="M12 2v4M5 12H2M22 12h-3M12 22v-4" />
                            <circle cx="12" cy="12" r="4" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">#{fountain.id}</h3>
                        <p className="text-sm text-gray-500 truncate max-w-[180px]">
                            {fountain.address}
                        </p>
                    </div>
                </div>
                
                {/* Distance badge */}
                {distance !== null && (
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                        {formatDistance(distance)}
                    </div>
                )}
            </div>

            {/* Rating and features row */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                    <StarRating rating={fountain.average_general_rating} size="sm" />
                    <span className="text-gray-500 text-sm">
                        ({fountain.number_of_ratings})
                    </span>
                </div>
                
                {/* Feature icons */}
                <div className="flex items-center gap-1">
                    {fountain.dog_friendly && (
                        <span 
                            className="text-lg bg-amber-50 rounded-full p-1" 
                            title="ידידותי לכלבים"
                            aria-label="ידידותי לכלבים"
                        >
                            🐕
                        </span>
                    )}
                    {fountain.bottle_refill && (
                        <span 
                            className="text-lg bg-blue-50 rounded-full p-1" 
                            title="מילוי בקבוקים"
                            aria-label="מילוי בקבוקים"
                        >
                            🍼
                        </span>
                    )}
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
                <button
                    onClick={handleRateClick}
                    className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-xl font-medium active:bg-blue-700 transition-colors text-sm min-h-[44px] flex items-center justify-center gap-2"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    דרג
                </button>
                <button
                    onClick={handleNavigateClick}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl font-medium active:bg-gray-200 transition-colors text-sm min-h-[44px] flex items-center justify-center gap-2"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                        <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    ניווט
                </button>
            </div>
        </div>
    );
}
