"use client";

import { useState, useRef } from 'react';
import { API_URL } from '@/app/consts';
import { useAuth } from '@/contexts/AuthContext';

interface PhotoUploadProps {
    fountainId?: number;
    onPhotoUploaded: (photoId: number, url: string) => void;
    maxPhotos?: number;
    existingPhotos?: { id: number; url: string }[];
}

export default function PhotoUpload({
    fountainId,
    onPhotoUploaded,
    maxPhotos = 5,
    existingPhotos = [],
}: PhotoUploadProps) {
    const { token } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedPhotos, setUploadedPhotos] = useState<{ id: number; url: string }[]>(existingPhotos);

    const canUploadMore = uploadedPhotos.length < maxPhotos;

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setError(null);
        setIsUploading(true);

        for (const file of Array.from(files)) {
            if (uploadedPhotos.length >= maxPhotos) {
                setError(`ניתן להעלות עד ${maxPhotos} תמונות`);
                break;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('יש להעלות קבצי תמונה בלבד');
                continue;
            }

            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                setError('גודל הקובץ חייב להיות עד 10MB');
                continue;
            }

            try {
                const formData = new FormData();
                formData.append('file', file);
                if (fountainId) {
                    formData.append('fountain_id', fountainId.toString());
                }

                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(`${API_URL}/photos/upload`, {
                    method: 'POST',
                    headers,
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'שגיאה בהעלאת התמונה');
                }

                const data = await response.json();
                const newPhoto = {
                    id: data.photo_id,
                    url: `${API_URL}${data.url}`,
                };

                setUploadedPhotos(prev => [...prev, newPhoto]);
                onPhotoUploaded(data.photo_id, newPhoto.url);
            } catch (err) {
                console.error('Upload error:', err);
                setError(err instanceof Error ? err.message : 'שגיאה בהעלאת התמונה');
            }
        }

        setIsUploading(false);
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemovePhoto = (photoId: number) => {
        setUploadedPhotos(prev => prev.filter(p => p.id !== photoId));
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-3">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Photo previews */}
            {uploadedPhotos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {uploadedPhotos.map((photo) => (
                        <div key={photo.id} className="relative flex-shrink-0">
                            <img
                                src={photo.url}
                                alt="תמונה שהועלתה"
                                className="w-20 h-20 object-cover rounded-xl"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemovePhoto(photo.id)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md"
                                aria-label="הסר תמונה"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload button */}
            {canUploadMore && (
                <button
                    type="button"
                    onClick={openFileDialog}
                    disabled={isUploading}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 px-4 flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50 min-h-[80px]"
                >
                    {isUploading ? (
                        <>
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                            <span className="text-sm">מעלה...</span>
                        </>
                    ) : (
                        <>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <span className="text-sm">
                                הוסף תמונה ({uploadedPhotos.length}/{maxPhotos})
                            </span>
                        </>
                    )}
                </button>
            )}

            {/* Error message */}
            {error && (
                <p className="text-red-500 text-sm">{error}</p>
            )}
        </div>
    );
}
