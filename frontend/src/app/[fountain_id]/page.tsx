"use client";

import { Fountain, Review } from "@/app/types";
import { useFountains } from "@/contexts/FountainContext";
import { usePathname, useRouter } from 'next/navigation';
import {useEffect, useState} from "react";
import {API_URL} from "@/app/consts";

const FountainPage = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { fountains } = useFountains();
    const [currentFountain, setCurrentFountain] = useState<Fountain | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const segments = pathname.split('/');
    const fountain_id = parseInt(segments[segments.length - 1]);

    // States for new review form
    const [generalRating, setGeneralRating] = useState<number>(0);
    const [tempRating, setTempRating] = useState<number>(0);
    const [streamRating, setStreamRating] = useState<number>(0);
    const [quenchingRating, setQuenchingRating] = useState<number>(0);
    const [description, setDescription] = useState<string>('');

    useEffect(() => {
        if (!fountains.length) {
            fetch(`${API_URL}/fountains/${fountain_id}`).then(response => response.json()).then(data => {
                setCurrentFountain(data);
            });
        } else {
            setCurrentFountain(fountains.find(fountain => fountain.id === fountain_id) || null);
        }

        fetch(`${API_URL}/reviews/${fountain_id}`).then(response => response.json()).then(data => {
            data = data.map((review: Review) => {
                const newReview: Review = {...review}
                newReview.creation_date = new Date(review.creation_date)
                return newReview
            })
            setReviews(data)
        });
    }, [fountain_id, fountains]);

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
            setReviews(prev => [...prev, { ...reviewData, id: Date.now(), creation_date: new Date() } as Review]);
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('Error submitting review');
        }
    };

    return (
        <>
            <div className="card">
                <button className="right button" onClick={() => router.back()}>
                    &lt;-
                </button>
                <h1 className="title">ברזייה #{currentFountain?.id}</h1>
                <br/>
                <p>כתובת: {currentFountain?.address}</p>
                <p>
                    ידידותי לכלבים: {currentFountain?.dog_friendly ? 'כן' : 'לא'}
                </p>
                <p>
                    דירוג: {currentFountain?.average_general_rating} ({currentFountain?.number_of_ratings} דירוגים)
                </p>
                <p>
                    סוג ברזיה: {currentFountain?.type}
                </p>
            </div>
            <div className="card">
                <h1 className="title">ביקורות</h1>
                {reviews.length > 0 ? (
                    <ul>
                        {reviews.map((review) => (
                            <li key={review.id}>
                                <p>תאריך: {review.creation_date.toLocaleDateString()}</p>
                                <p>כללי: {review.general_rating}</p>
                                <p>טמפרטורה: {review.temp_rating}</p>
                                <p>זרם: {review.stream_rating}</p>
                                <p>רוויה: {review.quenching_rating}</p>
                                <p>תיאור: {review.description}</p>
                                {/* Assuming photos are represented by IDs and you have a method to resolve these IDs to images */}
                                {/*{review.photos.map((photoId) => (*/}
                                {/*    <img key={photoId} src={`path/to/photo/${photoId}`} alt="תמונה של הביקורת"/>*/}
                                {/*))}*/}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>עדיין אין ביקורות</p>
                )}
            </div>
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
        </>
    )
}

export default FountainPage;