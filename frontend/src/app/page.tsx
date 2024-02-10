"use client";

import {useEffect, useState} from 'react';
import {API_URL} from './consts';
import './globals.css'; // Import your Tailwind CSS here

type Fountain = {
    id: number,
    address: string,
    latitude: number,
    longitude: number,
    dog_friendly: boolean,
    type: string,
    average_general_rating: number,
    number_of_ratings: number,
    last_updated: string
}

const calculateDistance = (fountain: Fountain, location: GeolocationPosition) => {
    if (location) {
        const toRadians = (degree: number) => {
            return degree * (Math.PI / 180);
        };

        const userLat = location.coords.latitude;
        const userLon = location.coords.longitude;
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
}
const HomePage = () => {
    const [location, setLocation] = useState<GeolocationPosition|null>(null);
    const [fountains, setFountains] = useState<Fountain[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    const fetchFountains = () => {
        if(!location) return
        fetch(`${API_URL}/fountains/${location.coords.longitude},${location.coords.latitude}`)
            .then(response => {
                console.log("response", response)
                return response.json()
            })
            .then(data => {
                console.log("data", data)
                setFountains(data.items)
            })
            .catch(error => {
                console.log("error", error)
                setFetchError(error)
            });
    }

    useEffect(() => {
        if (location) {
            fetchFountains();
        }
    }, [location]);

    // Get user location, update every 10 seconds
    const getLocation = () => {
        if (navigator.geolocation) {
            console.log("getting location");
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("location: ", position.coords);
                    setLocation(position);
                },
                () => {
                    setLocationError('Location access denied.');
                }
            );
        } else {
            setLocationError('Geolocation is not supported by this browser.');
        }
    }

    useEffect(() => {
        getLocation();
        const interval = setInterval(() => {
            getLocation();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const openGoogleMaps=(longitude:number,latitude:number)=> {
        const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        window.open(url, '_blank');
      }

    return (
        <div>
            <h1 className='title'>BEREZ</h1>
            {location ?
                <>
                    {fountains ? 
                        fountains.map((fountain) => (
                        <div key={fountain.id} className='card'>
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
                            <button onClick={()=>openGoogleMaps(fountain.longitude,fountain.latitude)}>נווט</button>
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
