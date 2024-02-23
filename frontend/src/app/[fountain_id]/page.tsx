"use client";

import { Fountain, Review } from "@/app/types";
import { useFountains } from "@/contexts/FountainContext";
import { usePathname, useRouter } from 'next/navigation';
import {useEffect, useState} from "react";
import {API_URL} from "@/app/consts";
import AddReviewCard from "@/components/AddReviewCard";

const FountainPage = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { fountains } = useFountains();
    const [currentFountain, setCurrentFountain] = useState<Fountain | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const segments = pathname.split('/');
    const fountain_id = parseInt(segments[segments.length - 1]);

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
            <AddReviewCard fountain_id={fountain_id} setReviews={setReviews}/>
        </>
    )
}

export default FountainPage;