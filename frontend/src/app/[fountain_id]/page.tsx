"use client";

import { Fountain } from "@/app/types";
import { useFountains } from "@/contexts/FountainContext";
import { usePathname } from 'next/navigation';
import {useEffect, useState} from "react";
import {API_URL} from "@/app/consts";

const FountainPage = () => {
    const pathname = usePathname();
    const { fountains, setFountains } = useFountains();
    const [currentFountain, setCurrentFountain] = useState<Fountain|null>(null)
    const segments = pathname.split('/');
    const fountain_id = parseInt(segments[segments.length - 1]);

    useEffect(() => {
        if (!fountains.length) {
            fetch(`${API_URL}/fountains/${fountain_id}`).then(response => {
                console.log("response", response)
                return response.json()
            }).then(
                (data) => {
                    setCurrentFountain(data);
            })
        } else {
            setCurrentFountain(fountains.filter(fountain => fountain.id === fountain_id)[0])
        }
    }, [])
    return (
        <>
            <h1>Fountain #{currentFountain?.id}</h1>
            <p>Address: {currentFountain?.address}</p>
        </>
    )
}

export default FountainPage;