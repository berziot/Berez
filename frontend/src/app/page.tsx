"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { API_URL } from './consts';
import { Fountain } from './types';
import { useFountains } from "@/contexts/FountainContext";
import { useAuth } from "@/contexts/AuthContext";
import FountainCard from '@/components/FountainCard';
import BottomNav from '@/components/BottomNav';
import BottomSheet from '@/components/BottomSheet';
import { FountainListSkeleton, MapSkeleton } from '@/components/LoadingSkeleton';

// Dynamically import map to avoid SSR issues
const FountainMap = dynamic(() => import('@/components/FountainMap'), {
    ssr: false,
    loading: () => <MapSkeleton />,
});

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

// Check if a location is within Tel Aviv
// Tel Aviv center: 32.0853, 34.7818
// Using a radius of 10km to cover the metropolitan area
function isLocationInTelAviv(lat: number, lon: number): boolean {
    const TEL_AVIV_CENTER_LAT = 32.0853;
    const TEL_AVIV_CENTER_LON = 34.7818;
    const TEL_AVIV_RADIUS = 10000; // 10km in meters
    
    const distance = calculateDistance(
        lat,
        lon,
        TEL_AVIV_CENTER_LAT,
        TEL_AVIV_CENTER_LON
    );
    
    return distance <= TEL_AVIV_RADIUS;
}

type ViewMode = 'list' | 'map';

export default function HomePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAuthenticated } = useAuth();

    // State
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [locationWarning, setLocationWarning] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedFountain, setSelectedFountain] = useState<Fountain | null>(null);
    const [showOutsideTelAvivModal, setShowOutsideTelAvivModal] = useState(false);

    const { fountains, setFountains } = useFountains();

    // Check if user is in Tel Aviv
    const isUserInTelAviv = useMemo(() => {
        if (!location) return true; // Default to true if no location yet
        return isLocationInTelAviv(location.latitude, location.longitude);
    }, [location]);

    // Show modal when user is outside Tel Aviv (only once per session)
    useEffect(() => {
        if (location && !isUserInTelAviv && !sessionStorage.getItem('outsideTelAvivModalShown')) {
            setShowOutsideTelAvivModal(true);
            sessionStorage.setItem('outsideTelAvivModalShown', 'true');
        }
    }, [location, isUserInTelAviv]);

    // Get view mode from URL or localStorage
    useEffect(() => {
        const urlView = searchParams.get('view');
        if (urlView === 'map' || urlView === 'list') {
            setViewMode(urlView);
        } else {
            const savedView = localStorage.getItem('berez_view_mode') as ViewMode;
            if (savedView) {
                setViewMode(savedView);
            }
        }
    }, [searchParams]);

    // Save view mode to localStorage
    useEffect(() => {
        localStorage.setItem('berez_view_mode', viewMode);
    }, [viewMode]);

    // Fetch fountains when location is available
    const fetchFountains = useCallback(async () => {
        if (!location) return;

        try {
            const response = await fetch(
                `${API_URL}/fountains/${location.longitude},${location.latitude}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch fountains');
            }

            const data = await response.json();
            setFountains(data.items);
            setFetchError(null);
        } catch (error) {
            console.error('Error fetching fountains:', error);
            setFetchError('שגיאה בטעינת הברזיות');
        } finally {
            setIsLoading(false);
        }
    }, [location, setFountains]);

    useEffect(() => {
        if (location) {
            fetchFountains();
        }
    }, [location, fetchFountains]);

    // Get user location
    const getLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setLocationWarning(null);
                },
                (err) => {
                    console.error('Error getting location:', err);
                    fetchLocationFromIP();
                },
                { timeout: 5000, enableHighAccuracy: true }
            );
        } else {
            fetchLocationFromIP();
        }
    }, []);

    const fetchLocationFromIP = async () => {
        try {
            const response = await fetch('https://ip-api.com/json/');
            const data = await response.json();
            setLocation({
                latitude: data.lat,
                longitude: data.lon,
            });
            setLocationWarning('משתמשים במיקום משוער על פי IP');
        } catch (err) {
            console.error('Error getting IP-based location:', err);
            setLocationError('לא הצלחנו לקבל את המיקום שלך');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getLocation();
        const interval = setInterval(getLocation, 30000);
        return () => clearInterval(interval);
    }, [getLocation]);

    // Calculate distances for all fountains
    const fountainsWithDistance = useMemo(() => {
        if (!location || !fountains) return [];

        return fountains.map(fountain => ({
            ...fountain,
            distance: calculateDistance(
                location.latitude,
                location.longitude,
                fountain.latitude,
                fountain.longitude
            ),
        }));
    }, [fountains, location]);

    // Handle view mode change
    const handleViewChange = (tab: 'home' | 'map' | 'profile') => {
        if (tab === 'home') {
            setViewMode('list');
            setSelectedFountain(null);
        } else if (tab === 'map') {
            setViewMode('map');
        } else if (tab === 'profile') {
            router.push(isAuthenticated ? '/profile' : '/login');
        }
    };

    // Pull to refresh handler
    const handleRefresh = () => {
        setIsLoading(true);
        fetchFountains();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
                <div className="px-4 py-3 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-blue-600">BEREZ</h1>
                    <button
                        onClick={() => router.push(isAuthenticated ? '/profile' : '/login')}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                        aria-label={isAuthenticated ? 'פרופיל' : 'התחברות'}
                    >
                        {isAuthenticated ? (
                            <span className="text-sm font-medium text-blue-600">
                                {user?.username?.charAt(0).toUpperCase()}
                            </span>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* View toggle tabs */}
                <div className="px-4 pb-2 flex gap-2">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-colors ${
                            viewMode === 'list'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        רשימה
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-colors ${
                            viewMode === 'map'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        מפה
                    </button>
                </div>
            </header>

            {/* Warning banner */}
            {locationWarning && (
                <div className="bg-yellow-50 border-b border-yellow-100 px-4 py-2 text-sm text-yellow-700">
                    {locationWarning}
                </div>
            )}

            {/* Main content */}
            <main className="flex-1 pb-20">
                {locationError ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📍</div>
                        <p className="empty-state-title">לא הצלחנו לקבל את המיקום שלך</p>
                        <p className="empty-state-text">אנא אפשר גישה למיקום ונסה שוב</p>
                        <button
                            onClick={getLocation}
                            className="btn-primary mt-4"
                        >
                            נסה שוב
                        </button>
                    </div>
                ) : viewMode === 'list' ? (
                    /* List View */
                    <div className="p-4 space-y-4">
                        {isLoading ? (
                            <FountainListSkeleton count={5} />
                        ) : fetchError ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">😕</div>
                                <p className="empty-state-title">{fetchError}</p>
                                <button
                                    onClick={handleRefresh}
                                    className="btn-primary mt-4"
                                >
                                    נסה שוב
                                </button>
                            </div>
                        ) : fountainsWithDistance.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">🚰</div>
                                <p className="empty-state-title">לא נמצאו ברזיות באזור</p>
                                <p className="empty-state-text">נסה לחפש במיקום אחר</p>
                            </div>
                        ) : (
                            fountainsWithDistance.map((fountain) => (
                                <FountainCard
                                    key={fountain.id}
                                    fountain={fountain}
                                    distance={fountain.distance}
                                />
                            ))
                        )}
                    </div>
                ) : (
                    /* Map View */
                    <div className="h-[calc(100vh-180px)]">
                        <FountainMap
                            fountains={fountains}
                            userLocation={location}
                            selectedFountain={selectedFountain}
                            onFountainSelect={setSelectedFountain}
                            isUserInTelAviv={isUserInTelAviv}
                        />
                        
                        {/* Bottom sheet for selected fountain */}
                        <BottomSheet
                            fountain={selectedFountain}
                            userLocation={location}
                            onClose={() => setSelectedFountain(null)}
                        />
                    </div>
                )}
            </main>

            {/* Bottom Navigation */}
            <BottomNav
                activeTab={viewMode === 'map' ? 'map' : 'home'}
                onTabChange={handleViewChange}
            />

            {/* Outside Tel Aviv Modal */}
            {showOutsideTelAvivModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <div className="text-center">
                            <div className="text-5xl mb-4">📍</div>
                            <h2 className="text-xl font-bold mb-3 text-gray-900">
                                אזור לא נתמך כרגע
                            </h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                ברז כרגע פועלת בתל אביב בלבד.
                                <br />
                                מוזמנים בינתיים להביט בברזיות שם :)
                            </p>
                            <button
                                onClick={() => setShowOutsideTelAvivModal(false)}
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                            >
                                הבנתי
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button - Add Fountain */}
            <button
                onClick={() => router.push('/add-fountain')}
                className="fixed bottom-24 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 flex items-center justify-center z-40"
                aria-label="הוסף ברזיה"
                title="הוסף ברזיה חדשה"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </button>
        </div>
    );
}
