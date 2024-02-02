"use client";

import React, { createContext, useContext, useState } from 'react';
import { Fountain} from "@/app/types";

const FountainContext = createContext({
    fountains: [] as Fountain[],
    setFountains: (fountains: Fountain[]) => {}
});

export const useFountains = () => useContext(FountainContext);

type FountainProviderProps = {
    children: React.ReactNode;
};

export const FountainProvider: React.FC<FountainProviderProps> = ({ children }) => {
    const [fountains, setFountains] = useState<Fountain[]>([]);

    return (
        <FountainContext.Provider value={{ fountains, setFountains }}>
            {children}
        </FountainContext.Provider>
    );
};