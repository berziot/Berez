"use client";

// Import necessary modules from React and Next.js
import React, {useEffect, useState} from 'react';
import Head from 'next/head';
import styles from './HelloScreen.module.css';
import {useRouter} from "next/navigation"; // Assume you have a CSS module for styling
import { handleLocationPermission } from '../common';


const HelloScreen = () => {
    const router = useRouter();

    // Function to handle location permission request
    const [location, setLocation] = useState<string | null>(null);

    useEffect(() => {
        handleLocationPermission(setLocation, router);
    }, [location, router]);

    return (
        <div>
            <Head>
                <title>Welcome to Our App</title>
                <meta name="description" content="Welcome screen for our mobile-first web app" />
            </Head>

            <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
                <h1 className="text-3xl font-bold text-center mb-4">
                    Welcome to Our App!
                </h1>

                <p className="text-lg text-gray-700 text-center mb-6">
                    Our app helps you find the best places near you. To get started, please enable location services.
                </p>

                <button
                    onClick={() => handleLocationPermission(setLocation, router)}
                    className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                >
                    Allow Location
                </button>
            </div>
        </div>
    );
};

export default HelloScreen;
