// Type definitions for the Berez app

export type User = {
    id: number;
    username: string;
    email: string;
    created_at: string;
    is_active: boolean;
};

export type Fountain = {
    id: number;
    address: string;
    latitude: number;
    longitude: number;
    dog_friendly: boolean;
    bottle_refill: boolean;
    type: string;
    average_general_rating: number;
    number_of_ratings: number;
    last_updated: string;
};

export type Review = {
    id: number;
    fountain_id: number;
    user_id: number | null;
    username: string | null;
    creation_date: Date;
    general_rating: number;
    temp_rating: number | null;
    stream_rating: number | null;
    quenching_rating: number | null;
    description: string | null;
    photos: number[] | null;
};

export type Photo = {
    id: number;
    url: string;
    original_filename: string;
};

export type ReviewCreate = {
    fountain_id: number;
    general_rating: number;
    temp_rating?: number | null;
    stream_rating?: number | null;
    quenching_rating?: number | null;
    description?: string | null;
    photos?: number[] | null;
};
