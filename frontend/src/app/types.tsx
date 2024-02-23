
export type Fountain = {
    id: number,
    address: string,
    latitude: number,
    longitude: number,
    dog_friendly: boolean,
    type: string,
    average_general_rating: number,
    number_of_ratings: number,
    last_updated: string
}

export type Review = {
    id: number;
    fountain_id: number;
    creation_date: Date;
    general_rating: number;
    temp_rating: number;
    stream_rating: number;
    quenching_rating: number;
    description: string;
    photos: number[];
};
