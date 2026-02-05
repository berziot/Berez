"use client";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div className={`skeleton ${className}`} />
    );
}

export function FountainCardSkeleton() {
    return (
        <div className="card animate-pulse">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-4 mb-3">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-12" />
            </div>
            <div className="flex gap-3">
                <Skeleton className="h-12 flex-1 rounded-xl" />
                <Skeleton className="h-12 flex-1 rounded-xl" />
            </div>
        </div>
    );
}

export function FountainListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <FountainCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function FountainDetailSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Photo carousel skeleton */}
            <Skeleton className="w-full aspect-video rounded-2xl mb-4" />
            
            {/* Title and badges */}
            <div className="mb-4">
                <Skeleton className="h-8 w-40 mb-2" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-5 w-16" />
            </div>
            
            {/* Reviews section */}
            <Skeleton className="h-6 w-20 mb-4" />
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="card">
                        <div className="flex items-center gap-2 mb-2">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ReviewFormSkeleton() {
    return (
        <div className="card animate-pulse space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
        </div>
    );
}

export function MapSkeleton() {
    return (
        <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400 text-center">
                <svg 
                    width="48" 
                    height="48" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5"
                    className="mx-auto mb-2"
                >
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                    <line x1="8" y1="2" x2="8" y2="18" />
                    <line x1="16" y1="6" x2="16" y2="22" />
                </svg>
                <span className="text-sm">טוען מפה...</span>
            </div>
        </div>
    );
}
