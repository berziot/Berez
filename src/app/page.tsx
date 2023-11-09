"use client";

import { useEffect, useState } from 'react';

const HomePage = () => {
    const [location, setLocation] = useState<string | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation(`Latitude: ${latitude}, Longitude: ${longitude}`);
                },
                () => {
                    setLocation('Location access denied.');
                }
            );
        } else {
            setLocation('Geolocation is not supported by this browser.');
        }
    }, []);

    return (
        <div>
            <h1>Welcome to the App</h1>
            <p>Please grant location access.</p>
            {location && <p>Your location: {location}</p>}
        </div>
    );
};

export default HomePage;
