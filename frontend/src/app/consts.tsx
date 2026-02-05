// API configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// App constants
export const APP_NAME = 'Berez';
export const APP_DESCRIPTION = 'מצא ברזיות מים, דרג ושתף';

// Map defaults (Tel Aviv)
export const DEFAULT_CENTER = {
    latitude: 32.0853,
    longitude: 34.7818,
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// File upload limits
export const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
