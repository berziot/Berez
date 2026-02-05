// Type definitions for the Berez app

export type User = {
    id: number;
    username: string;
    name: string;
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
    status?: string;
    submitted_by?: number | null;
    description?: string | null;
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

export type ReportType = 'broken' | 'missing' | 'incorrect_location' | 'other';

export type ReportStatus = 'pending' | 'resolved' | 'rejected';

export type FountainReport = {
    id: number;
    fountain_id: number;
    user_id: number | null;
    username: string | null;
    report_type: ReportType;
    description: string | null;
    status: ReportStatus;
    created_at: string;
    resolved_at: string | null;
};

export type FountainReportCreate = {
    fountain_id: number;
    report_type: ReportType;
    description?: string | null;
};

export type FountainCreate = {
    address: string;
    latitude: number;
    longitude: number;
    dog_friendly: boolean;
    bottle_refill: boolean;
    type: string;
    description?: string | null;
};
