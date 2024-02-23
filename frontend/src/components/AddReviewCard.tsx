import React, { useState } from 'react';
import {Review} from "@/app/types";
import {API_URL} from "@/app/consts";

interface AddReviewCardProps {
    fountain_id: number,
    setReviews: (prev: any) => void,
}

const AddReviewCard: React.FC<AddReviewCardProps> = ({fountain_id, setReviews}) => {
    // States for new review form
    const [generalRating, setGeneralRating] = useState<number>(0);
    const [tempRating, setTempRating] = useState<number>(0);
    const [streamRating, setStreamRating] = useState<number>(0);
    const [quenchingRating, setQuenchingRating] = useState<number>(0);
    const [description, setDescription] = useState<string>('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const reviewData: Omit<Review, 'id' | 'photos' | 'creation_date'> = {
            fountain_id,
            general_rating: generalRating,
            temp_rating: tempRating,
            stream_rating: streamRating,
            quenching_rating: quenchingRating,
            description,
        };

        try {
            const response = await fetch(`${API_URL}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reviewData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Success feedback
            alert('Review submitted successfully');
            // Update local reviews state or refetch reviews
            setReviews((prev: any) => [...prev, { ...reviewData, id: Date.now(), creation_date: new Date() } as Review]);
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('Error submitting review');
        }
    };

    return (
        <div className="card">
            <h1 className="title">הוסף ביקורת</h1>
            <form onSubmit={handleSubmit}>
                <div className="star-rating">
                    <label>כללי:</label>
                    {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                            <label key={ratingValue}>
                                <input
                                    type="radio"
                                    name="generalRating"
                                    value={ratingValue}
                                    checked={generalRating === ratingValue}
                                    onClick={() => setGeneralRating(ratingValue)}
                                />
                                <span className="text-3xl">★</span>
                            </label>
                        );
                    })}
                </div>
                {/* Temperature Rating */}
                <div className="star-rating">
                    <h3>טמפרטורה:</h3>
                    {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                            <label key={ratingValue}>
                                <input
                                    type="radio"
                                    name="tempRating"
                                    value={ratingValue}
                                    onClick={() => setTempRating(ratingValue)}
                                />
                                <span className="text-3xl">★</span>
                            </label>
                        );
                    })}
                </div>

                {/* Stream Rating */}
                <div className="star-rating">
                    <h3>זרם:</h3>
                    {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                            <label key={ratingValue}>
                                <input
                                    type="radio"
                                    name="streamRating"
                                    value={ratingValue}
                                    onClick={() => setStreamRating(ratingValue)}
                                />
                                <span className="text-3xl">★</span>
                            </label>
                        );
                    })}
                </div>

                {/* Quenching Rating */}
                <div className="star-rating">
                    <h3>רוויה:</h3>
                    {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                            <label key={ratingValue}>
                                <input
                                    type="radio"
                                    name="quenchingRating"
                                    value={ratingValue}
                                    onClick={() => setQuenchingRating(ratingValue)}
                                />
                                <span className="text-3xl">★</span>
                            </label>
                        );
                    })}
                </div>

                {/* Description Field */}
                <div>
                    <h3>תיאור:</h3>
                    <textarea
                        className="textarea"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        placeholder="כתוב את תיאור הביקורת שלך כאן..."
                    ></textarea>
                </div>

                <button type="submit" className="button">שלח ביקורת</button>
            </form>
        </div>
    );
};

export default AddReviewCard;
