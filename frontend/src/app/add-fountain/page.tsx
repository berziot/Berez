"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../consts';
import { FountainCreate } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';

const FOUNTAIN_TYPES = [
    { value: 1, label: 'ברזית גליל', name: 'cylindrical_fountain' },
    { value: 2, label: 'ברזית עלה', name: 'leaf_fountain' },
    { value: 3, label: 'קולר', name: 'cooler' },
    { value: 4, label: 'ברזיה מרובעת', name: 'square_fountain' },
    { value: 5, label: 'ברזית פטריה', name: 'mushroom_fountain' }
];

export default function AddFountainPage() {
    const router = useRouter();
    const { token, isAuthenticated } = useAuth();
    
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [address, setAddress] = useState('');
    const [fountainType, setFountainType] = useState<number>(1);
    const [dogFriendly, setDogFriendly] = useState(false);
    const [bottleRefill, setBottleRefill] = useState(false);
    const [description, setDescription] = useState('');
    
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Get user location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    setLocation(loc);
                    setIsLoadingLocation(false);
                    // Try to get address from coordinates
                    reverseGeocode(loc.latitude, loc.longitude);
                },
                (err) => {
                    console.error('Error getting location:', err);
                    setError('לא הצלחנו לקבל את המיקום. אנא אפשר גישה למיקום.');
                    setIsLoadingLocation(false);
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        } else {
            setError('הדפדפן שלך לא תומך בשירותי מיקום');
            setIsLoadingLocation(false);
        }
    }, []);

    const reverseGeocode = async (lat: number, lon: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=he`
            );
            const data = await response.json();
            if (data.display_name) {
                setAddress(data.display_name);
            }
        } catch (err) {
            console.error('Error reverse geocoding:', err);
            // Not critical, user can manually enter address
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!location) {
            setError('חסר מיקום. אנא אפשר גישה למיקום.');
            return;
        }

        if (!address.trim()) {
            setError('אנא הזן כתובת');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const selectedType = FOUNTAIN_TYPES.find(t => t.value === fountainType);
            
            const fountainData: FountainCreate = {
                address: address.trim(),
                latitude: location.latitude,
                longitude: location.longitude,
                dog_friendly: dogFriendly,
                bottle_refill: bottleRefill,
                type: selectedType?.name || 'cylindrical_fountain',
                description: description.trim() || null
            };

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/fountains/submit`, {
                method: 'POST',
                headers,
                body: JSON.stringify(fountainData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to submit fountain');
            }

            const data = await response.json();
            setSuccess(true);
            
            // Redirect after a delay
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (err) {
            console.error('Error submitting fountain:', err);
            setError('שגיאה בשליחת הברזיה. נסה שוב.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingLocation) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">מקבל מיקום...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="px-4 py-3 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="חזרה"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">הוספת ברזיה חדשה</h1>
                </div>
            </header>

            {/* Main content */}
            <main className="p-4 max-w-2xl mx-auto">
                {success ? (
                    <div className="card text-center py-12">
                        <div className="text-6xl mb-4">✅</div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">תודה רבה!</h2>
                        <p className="text-gray-600">הברזיה נשלחה לאישור</p>
                        <p className="text-sm text-gray-500 mt-2">היא תופיע באפליקציה לאחר בדיקה</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Location info */}
                        <div className="card bg-blue-50 border border-blue-100">
                            <div className="flex items-start gap-3">
                                <div className="text-2xl">📍</div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 mb-1">מיקום הברזיה</h3>
                                    {location ? (
                                        <p className="text-sm text-gray-600">
                                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-red-600">לא נמצא מיקום</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                כתובת <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="address"
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="רחוב, עיר"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none"
                                required
                            />
                        </div>

                        {/* Fountain type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                סוג הברזיה <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {FOUNTAIN_TYPES.map((type) => (
                                    <label
                                        key={type.value}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                                            fountainType === type.value
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="fountainType"
                                            value={type.value}
                                            checked={fountainType === type.value}
                                            onChange={(e) => setFountainType(Number(e.target.value))}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-sm font-medium">{type.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                תכונות
                            </label>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={dogFriendly}
                                        onChange={(e) => setDogFriendly(e.target.checked)}
                                        className="w-5 h-5 text-blue-600 rounded"
                                    />
                                    <span className="text-lg">🐕</span>
                                    <span className="font-medium">ידידותי לכלבים</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={bottleRefill}
                                        onChange={(e) => setBottleRefill(e.target.checked)}
                                        className="w-5 h-5 text-blue-600 rounded"
                                    />
                                    <span className="text-lg">🍼</span>
                                    <span className="font-medium">מתאים למילוי בקבוקים</span>
                                </label>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                פרטים נוספים (אופציונלי)
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="למשל: 'ליד הכניסה הראשית', 'קרוב למגרש משחקים'..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none resize-none"
                                rows={4}
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500 mt-1 text-left">
                                {description.length}/500
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            className="w-full py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || !location}
                        >
                            {isSubmitting ? 'שולח...' : 'שלח לאישור'}
                        </button>

                        {/* Info note */}
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <p className="text-sm text-yellow-800">
                                <strong>שים לב:</strong> הברזיה תיבדק על ידי המנהלים ותופיע באפליקציה רק לאחר אישור.
                            </p>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}
