"use client";

import {useEffect, useState} from 'react';
import {API_URL} from './consts';
import './globals.css';
import {Fountain} from "./types";
import { useFountains } from "@/contexts/FountainContext";
import {useRouter} from "next/navigation";

const calculateDistance = (fountain: Fountain, location: Partial<GeolocationCoordinates>) => {
    if (!location) {
        return 0
    }
    const toRadians = (degree: number) => {
        return degree * (Math.PI / 180);
    };

    const userLat = location.latitude ?? 0;
    const userLon = location.longitude ?? 0;
    const fountainLat = fountain.latitude;
    const fountainLon = fountain.longitude;

    const R = 6371e3; // Radius of the Earth in meters
    const φ1 = toRadians(userLat); // φ, λ in radians
    const φ2 = toRadians(fountainLat);
    const Δφ = toRadians(fountainLat - userLat);
    const Δλ = toRadians(fountainLon - userLon);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // in meters

    return distance.toFixed(0);
}
const HomePage = () => {
    const router = useRouter();

    const [location, setLocation] = useState<Partial<GeolocationCoordinates>|null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [locationWarning, setLocationWarning] = useState<string | null>(null);

    const { fountains, setFountains } = useFountains()
    const fetchFountains = () => {
        fetch(`${API_URL}/fountains`)
            .then(response => {
                console.log("response", response)
                return response.json()
            })
            .then(data => {
                console.log("data", data)
                setFountains(data)
            })
            .catch(error => {
                console.log("error", error)
                setFetchError(error)
            }).finally(() => {
            console.log("Finally done fountain fetching")
        })
    }

    useEffect(() => {
        if (location) {
            fetchFountains();
        }
    }, [location]);

    // Get user location, update every 10 seconds
    const getLocation = () => {
        if (navigator.geolocation) {
            console.log("Getting location...");
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("Location: ", position.coords);
                    setLocation({...position.coords});
                },
                (err) => {
                    console.log("Error getting location: ", err);
                    if (err.code === 1 || err.code === 2 || err.code === 3) {
                        fetchLocationFromIP(); // Fallback to IP-based location
                    } else {
                        setLocationError(err.message);
                    }
                },
                {
                    timeout: 5000,
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser.");
            setLocationError('Geolocation is not supported by this browser.');
            fetchLocationFromIP(); // Fallback to IP-based location
        }
    };

    const fetchLocationFromIP = () => {
        fetch('https://ip-api.com/json/')
            .then(response => response.json())
            .then(data => {
                console.log("IP-based location: ", data);
                // Convert the IP location format to the navigator location format if necessary
                setLocation({
                    latitude: data.lat,
                    longitude: data.lon
                });
                setLocationWarning("Using IP based location, it won't be as accurate")
            })
            .catch(err => {
                console.log("Error getting IP-based location: ", err);
                setLocationError('Failed to fetch IP-based location.');
            });
    };


    useEffect(() => {
        getLocation();
        const interval = setInterval(() => {
            getLocation();
        }, 20000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h1 className='title'>BEREZ</h1>
            {locationWarning && <h2>{locationWarning}</h2>}
            {location ?
                <>
                    {fountains ? fountains.map((fountain) => (
                        <div key={fountain.id} className='card' onClick={() => router.push(`/${fountain.id}`)}>
                            <p>#{fountain.id}</p>
                            <p>
                                מרחק: {calculateDistance(fountain, location)} מטר
                            </p>
                            <p>
                                ידידותי לכלבים: {fountain.dog_friendly ? 'כן' : 'לא'}
                            </p>
                            <p>
                                דירוג: {fountain.average_general_rating} ({fountain.number_of_ratings} דירוגים)
                            </p>
                        </div>
                    )) : fetchError ? <p>Failed to fetch fountains: {fetchError}</p> : <p>Loading...</p>
                    }
                </> : locationError ? <p>failed to get location: {locationError}</p> :
                    <p>Please grant location access.</p>
            }
        </div>
    );
};

export default HomePage;
