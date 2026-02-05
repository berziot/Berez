"use client";

import { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fountain, Review, Photo } from "@/app/types";
import { useFountains } from "@/contexts/FountainContext";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/app/consts";
import AddReviewCard from "@/components/AddReviewCard";
import PhotoCarousel from "@/components/PhotoCarousel";
import StarRating from "@/components/StarRating";
import { FountainDetailSkeleton } from "@/components/LoadingSkeleton";
import ReportFountainSheet from "@/components/ReportFountainSheet";

// Calculate distance between two coordinates in meters
function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371e3;
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
        return `${Math.round(meters)} מ'`;
    }
    return `${(meters / 1000).toFixed(1)} ק"מ`;
}

export default function FountainPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { fountains } = useFountains();
    const { user, isAuthenticated } = useAuth();

    const [currentFountain, setCurrentFountain] = useState<Fountain | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showReportSheet, setShowReportSheet] = useState(false);

    // Parse fountain ID from URL
    const segments = pathname.split('/');
    const fountain_id = parseInt(segments[segments.length - 1]);

    // Check if we should auto-open review form
    useEffect(() => {
        if (searchParams.get('review') === 'true') {
            setShowReviewForm(true);
        }
    }, [searchParams]);

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                () => {
                    // Ignore location errors on detail page
                }
            );
        }
    }, []);

    // Fetch fountain data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            // Try to get fountain from context first
            const contextFountain = fountains.find(f => f.id === fountain_id);
            if (contextFountain) {
                setCurrentFountain(contextFountain);
            } else {
                // Fetch from API
                try {
                    const response = await fetch(`${API_URL}/fountains/${fountain_id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setCurrentFountain(data);
                    }
                } catch (error) {
                    console.error('Error fetching fountain:', error);
                }
            }

            // Fetch reviews
            try {
                const reviewsResponse = await fetch(`${API_URL}/reviews/${fountain_id}`);
                if (reviewsResponse.ok) {
                    const reviewsData = await reviewsResponse.json();
                    const formattedReviews = reviewsData.map((review: Review) => ({
                        ...review,
                        creation_date: new Date(review.creation_date),
                    }));
                    setReviews(formattedReviews);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }

            // Fetch photos
            try {
                const photosResponse = await fetch(`${API_URL}/photos/fountain/${fountain_id}`);
                if (photosResponse.ok) {
                    const photosData = await photosResponse.json();
                    setPhotos(photosData.map((p: any) => ({
                        ...p,
                        url: `${API_URL}${p.url}`,
                    })));
                }
            } catch (error) {
                console.error('Error fetching photos:', error);
            }

            setIsLoading(false);
        };

        fetchData();
    }, [fountain_id, fountains]);

    // Calculate distance
    const distance = useMemo(() => {
        if (!currentFountain || !userLocation) return null;
        return calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            currentFountain.latitude,
            currentFountain.longitude
        );
    }, [currentFountain, userLocation]);

    // Open Google Maps for navigation
    const openGoogleMaps = () => {
        if (currentFountain) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${currentFountain.latitude},${currentFountain.longitude}`,
                '_blank'
            );
        }
    };

    // Handle new review added
    const handleReviewAdded = (newReview: Review) => {
        setReviews(prev => [newReview, ...prev]);
        setShowReviewForm(false);
        
        // Update fountain rating in state
        if (currentFountain) {
            const newCount = currentFountain.number_of_ratings + 1;
            const newAvg = (
                (currentFountain.average_general_rating * currentFountain.number_of_ratings) +
                newReview.general_rating
            ) / newCount;
            
            setCurrentFountain({
                ...currentFountain,
                average_general_rating: newAvg,
                number_of_ratings: newCount,
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
                <FountainDetailSkeleton />
            </div>
        );
    }

    if (!currentFountain) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">הברזייה לא נמצאה</p>
                    <button onClick={() => router.back()} className="btn-primary">
                        חזרה
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
            {/* Header */}
            <header className="bg-white sticky top-0 z-20 border-b border-gray-100">
                <div className="px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                        aria-label="חזרה"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                            <path d="M9 18l6-12" />
                            <path d="M15 18l-6-12" transform="rotate(90 12 12)" />
                        </svg>
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">
                        ברזייה #{currentFountain.id}
                    </h1>
                </div>
            </header>

            {/* Photo Carousel */}
            <div className="p-4">
                <PhotoCarousel photos={photos} />
            </div>

            {/* Fountain Info */}
            <div className="px-4 pb-4">
                <div className="card">
                    {/* Address */}
                    <p className="text-gray-600 mb-3">{currentFountain.address}</p>

                    {/* Features and distance */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                        {distance !== null && (
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                {formatDistance(distance)}
                            </span>
                        )}
                        {currentFountain.dog_friendly && (
                            <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                🐕 ידידותי לכלבים
                            </span>
                        )}
                        {currentFountain.bottle_refill && (
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                🍼 מילוי בקבוקים
                            </span>
                        )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                        <StarRating rating={currentFountain.average_general_rating} size="md" />
                        <span className="text-gray-600">
                            {currentFountain.average_general_rating.toFixed(1)}
                        </span>
                        <span className="text-gray-400">
                            ({currentFountain.number_of_ratings} דירוגים)
                        </span>
                    </div>

                    {/* Report button */}
                    <button
                        onClick={() => setShowReportSheet(true)}
                        className="w-full py-2 px-4 rounded-xl font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        דווח על בעיה
                    </button>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="px-4 pb-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-gray-900">
                        ביקורות
                    </h2>
                    {reviews.length > 0 && (
                        <span className="text-gray-500 text-sm">
                            {reviews.length} ביקורות
                        </span>
                    )}
                </div>

                {reviews.length === 0 ? (
                    <div className="card text-center py-8">
                        <p className="text-gray-500 mb-2">עדיין אין ביקורות</p>
                        <p className="text-gray-400 text-sm">היה הראשון לדרג את הברזייה!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                )}
            </div>

            {/* Review Form (expandable) */}
            {showReviewForm && (
                <div className="px-4 pb-4">
                    <AddReviewCard
                        fountain_id={fountain_id}
                        onReviewAdded={handleReviewAdded}
                        onCancel={() => setShowReviewForm(false)}
                    />
                </div>
            )}

            {/* Sticky bottom actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe z-10">
                <div className="flex gap-3">
                    {!showReviewForm && (
                        <button
                            onClick={() => setShowReviewForm(true)}
                            className="flex-1 btn-primary flex items-center justify-center gap-2"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            הוסף ביקורת
                        </button>
                    )}
                    <button
                        onClick={openGoogleMaps}
                        className={`${showReviewForm ? 'flex-1' : ''} btn-secondary flex items-center justify-center gap-2`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                            <circle cx="12" cy="9" r="2.5" />
                        </svg>
                        ניווט
                    </button>
                </div>
            </div>

            {/* Report Sheet */}
            <ReportFountainSheet
                fountainId={fountain_id}
                isOpen={showReportSheet}
                onClose={() => setShowReportSheet(false)}
            />
        </div>
    );
}

// Review Card Component
function ReviewCard({ review }: { review: Review }) {
    return (
        <div className="card">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                            {review.username?.charAt(0).toUpperCase() || '?'}
                        </span>
                    </div>
                    <span className="font-medium text-gray-900">
                        {review.username || 'אנונימי'}
                    </span>
                </div>
                <span className="text-gray-400 text-sm">
                    {review.creation_date.toLocaleDateString('he-IL')}
                </span>
            </div>

            {/* Main rating */}
            <div className="mb-2">
                <StarRating rating={review.general_rating} size="sm" />
            </div>

            {/* Additional ratings */}
            {(review.temp_rating || review.stream_rating || review.quenching_rating) && (
                <div className="flex flex-wrap gap-2 mb-2 text-sm">
                    {review.temp_rating && (
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">
                            טמפרטורה: {review.temp_rating}/5
                        </span>
                    )}
                    {review.stream_rating && (
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">
                            זרם: {review.stream_rating}/5
                        </span>
                    )}
                    {review.quenching_rating && (
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">
                            רוויה: {review.quenching_rating}/5
                        </span>
                    )}
                </div>
            )}

            {/* Description */}
            {review.description && (
                <p className="text-gray-600 text-sm">{review.description}</p>
            )}
        </div>
    );
}
