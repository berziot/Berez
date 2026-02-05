"use client";

import { useEffect, useState, useRef } from 'react';
import { Fountain } from '@/app/types';
import { useRouter } from 'next/navigation';

interface FountainMapProps {
    fountains: Fountain[];
    userLocation: { latitude: number; longitude: number } | null;
    onFountainSelect: (fountain: Fountain | null) => void;
    selectedFountain: Fountain | null;
}

// Get marker color based on rating
function getMarkerColor(rating: number): string {
    if (rating === 0) return '#9CA3AF'; // gray - no ratings
    if (rating >= 4) return '#0066CC'; // blue - good
    if (rating >= 3) return '#F59E0B'; // yellow/amber - ok
    return '#EF4444'; // red - poor
}

export default function FountainMap({ 
    fountains, 
    userLocation, 
    onFountainSelect,
    selectedFountain 
}: FountainMapProps) {
    const router = useRouter();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const userMarkerRef = useRef<any>(null);
    const [isClient, setIsClient] = useState(false);
    const [L, setL] = useState<any>(null);

    // Default center (Tel Aviv)
    const defaultCenter: [number, number] = [32.0853, 34.7818];
    const center: [number, number] = userLocation 
        ? [userLocation.latitude, userLocation.longitude]
        : defaultCenter;

    // Load Leaflet on client side
    useEffect(() => {
        setIsClient(true);
        import('leaflet').then((leaflet) => {
            // Fix default marker icon
            delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl;
            leaflet.default.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });
            setL(leaflet.default);
        });
    }, []);

    // Initialize map
    useEffect(() => {
        if (!L || !mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center,
            zoom: 15,
            zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
        }).addTo(map);

        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [L, center]);

    // Update user location marker
    useEffect(() => {
        if (!L || !mapRef.current || !userLocation) return;

        // Remove existing user marker
        if (userMarkerRef.current) {
            userMarkerRef.current.remove();
        }

        // Add user location marker
        const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `
                <div style="
                    width: 20px;
                    height: 20px;
                    background-color: #0066CC;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                "></div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });

        userMarkerRef.current = L.marker(
            [userLocation.latitude, userLocation.longitude],
            { icon: userIcon }
        ).addTo(mapRef.current);

    }, [L, userLocation]);

    // Update fountain markers
    useEffect(() => {
        if (!L || !mapRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add fountain markers
        fountains.forEach((fountain) => {
            const color = getMarkerColor(fountain.average_general_rating);
            
            const icon = L.divIcon({
                className: 'fountain-marker',
                html: `
                    <div style="
                        width: 36px;
                        height: 36px;
                        background-color: ${color};
                        border: 3px solid white;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        cursor: pointer;
                    ">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
                        </svg>
                    </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
            });

            const marker = L.marker(
                [fountain.latitude, fountain.longitude],
                { icon }
            ).addTo(mapRef.current);

            marker.on('click', () => {
                onFountainSelect(fountain);
            });

            markersRef.current.push(marker);
        });

    }, [L, fountains, onFountainSelect]);

    // Handle recenter
    const handleRecenter = () => {
        if (mapRef.current && userLocation) {
            mapRef.current.setView([userLocation.latitude, userLocation.longitude], 15);
        }
    };

    // Handle zoom
    const handleZoomIn = () => {
        if (mapRef.current) {
            mapRef.current.zoomIn();
        }
    };

    const handleZoomOut = () => {
        if (mapRef.current) {
            mapRef.current.zoomOut();
        }
    };

    if (!isClient) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-gray-500">טוען מפה...</div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            {/* Map container */}
            <div 
                ref={mapContainerRef} 
                className="w-full h-full z-0"
                style={{ minHeight: '300px' }}
            />

            {/* Zoom controls */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                <button
                    onClick={handleZoomIn}
                    className="bg-white rounded-lg p-2 shadow-lg active:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="הגדל"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                </button>
                <button
                    onClick={handleZoomOut}
                    className="bg-white rounded-lg p-2 shadow-lg active:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="הקטן"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                        <path d="M5 12h14" />
                    </svg>
                </button>
            </div>

            {/* Recenter button */}
            <button
                onClick={handleRecenter}
                className="absolute bottom-24 left-4 z-10 bg-white rounded-full p-3 shadow-lg active:bg-gray-100 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
                aria-label="חזור למיקום שלי"
            >
                <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#0066CC" 
                    strokeWidth="2"
                >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                </svg>
            </button>
        </div>
    );
}
