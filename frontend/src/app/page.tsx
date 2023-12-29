"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import from next/navigation
import { handleLocationPermission } from './common'
const HomePage = () => {
    const router = useRouter();

    const [location, setLocation] = useState<string | null>(null);
    useEffect(() => {
        handleLocationPermission(setLocation, router)
    }, [router]);

    return (
        <div>
            <h1>Welcome to the App</h1>
            {location && (<p>Your location is: {location}</p>)}
        </div>
    );
};

export default HomePage;
