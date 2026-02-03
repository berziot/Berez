"use client";

import React, { useState } from 'react';
import { Review, ReviewCreate } from "@/app/types";
import { API_URL } from "@/app/consts";
import { useAuth } from "@/contexts/AuthContext";
import StarRating from './StarRating';
import PhotoUpload from './PhotoUpload';

interface AddReviewCardProps {
    fountain_id: number;
    onReviewAdded?: (review: Review) => void;
    onCancel?: () => void;
}

const AddReviewCard: React.FC<AddReviewCardProps> = ({ 
    fountain_id, 
    onReviewAdded,
    onCancel 
}) => {
    const { user, token, isAuthenticated } = useAuth();
    
    // Form state
    const [generalRating, setGeneralRating] = useState<number>(0);
    const [tempRating, setTempRating] = useState<number>(0);
    const [streamRating, setStreamRating] = useState<number>(0);
    const [quenchingRating, setQuenchingRating] = useState<number>(0);
    const [description, setDescription] = useState<string>('');
    const [photoIds, setPhotoIds] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Check if form has any data
    const formHasData = generalRating > 0 || description.length > 0 || photoIds.length > 0;

    // Validation
    const isValid = generalRating > 0;

    const handleCancel = () => {
        if (formHasData) {
            if (window.confirm('יש לך שינויים שלא נשמרו. האם אתה בטוח שברצונך לבטל?')) {
                onCancel?.();
            }
        } else {
            onCancel?.();
        }
    };

    const handlePhotoUploaded = (photoId: number, url: string) => {
        setPhotoIds(prev => [...prev, photoId]);
        setHasUnsavedChanges(true);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!isValid) {
            setError('יש לבחור דירוג כללי');
            return;
        }

        setError(null);
        setIsSubmitting(true);

        const reviewData: ReviewCreate = {
            fountain_id,
            general_rating: generalRating,
            temp_rating: tempRating > 0 ? tempRating : null,
            stream_rating: streamRating > 0 ? streamRating : null,
            quenching_rating: quenchingRating > 0 ? quenchingRating : null,
            description: description.trim() || null,
            photos: photoIds.length > 0 ? photoIds : null,
        };

        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/review`, {
                method: 'POST',
                headers,
                body: JSON.stringify(reviewData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'שגיאה בשליחת הביקורת');
            }

            const data = await response.json();
            
            // Create review object for callback
            const newReview: Review = {
                id: data.review.id,
                fountain_id: data.review.fountain_id,
                user_id: data.review.user_id,
                username: data.review.username || user?.username || null,
                creation_date: new Date(data.review.creation_date),
                general_rating: data.review.general_rating,
                temp_rating: data.review.temp_rating,
                stream_rating: data.review.stream_rating,
                quenching_rating: data.review.quenching_rating,
                description: data.review.description,
                photos: data.review.photos,
            };

            // Reset form
            setGeneralRating(0);
            setTempRating(0);
            setStreamRating(0);
            setQuenchingRating(0);
            setDescription('');
            setPhotoIds([]);
            setHasUnsavedChanges(false);

            // Notify parent
            onReviewAdded?.(newReview);

        } catch (error) {
            console.error('Failed to submit review:', error);
            setError(error instanceof Error ? error.message : 'שגיאה בשליחת הביקורת');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">הוסף ביקורת</h2>
                {onCancel && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ביטול
                    </button>
                )}
            </div>

            {/* User info */}
            {isAuthenticated ? (
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                            {user?.username?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <span>מדרג כ-<strong>{user?.username}</strong></span>
                </div>
            ) : (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 mb-4 text-sm text-yellow-700">
                    <a href="/login" className="text-blue-600 font-medium hover:underline">
                        התחבר
                    </a>
                    {' '}כדי לשמור את הביקורות שלך בפרופיל
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* General Rating - Required */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        דירוג כללי <span className="text-red-500">*</span>
                    </label>
                    <StarRating
                        rating={generalRating}
                        size="lg"
                        interactive
                        onChange={(rating) => {
                            setGeneralRating(rating);
                            setHasUnsavedChanges(true);
                        }}
                    />
                </div>

                {/* Additional Ratings - Optional */}
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">דירוגים נוספים (אופציונלי)</p>
                    
                    {/* Temperature Rating */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">טמפרטורה</label>
                        <StarRating
                            rating={tempRating}
                            size="sm"
                            interactive
                            onChange={(rating) => {
                                setTempRating(rating);
                                setHasUnsavedChanges(true);
                            }}
                        />
                    </div>

                    {/* Stream Rating */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">זרם</label>
                        <StarRating
                            rating={streamRating}
                            size="sm"
                            interactive
                            onChange={(rating) => {
                                setStreamRating(rating);
                                setHasUnsavedChanges(true);
                            }}
                        />
                    </div>

                    {/* Quenching Rating */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">רוויה</label>
                        <StarRating
                            rating={quenchingRating}
                            size="sm"
                            interactive
                            onChange={(rating) => {
                                setQuenchingRating(rating);
                                setHasUnsavedChanges(true);
                            }}
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        תיאור (אופציונלי)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => {
                            if (e.target.value.length <= 1000) {
                                setDescription(e.target.value);
                                setHasUnsavedChanges(true);
                            }
                        }}
                        className="textarea"
                        rows={3}
                        placeholder="ספר לנו על החוויה שלך..."
                    />
                    <p className="text-xs text-gray-400 mt-1 text-left" dir="ltr">
                        {description.length}/1000
                    </p>
                </div>

                {/* Photo Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        תמונות (אופציונלי)
                    </label>
                    <PhotoUpload
                        fountainId={fountain_id}
                        onPhotoUploaded={handlePhotoUploaded}
                        maxPhotos={5}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            שולח...
                        </span>
                    ) : (
                        'פרסם ביקורת'
                    )}
                </button>
            </form>
        </div>
    );
};

export default AddReviewCard;
