"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PatientContextType {
    email: string | null;
    setEmail: (email: string) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [email, setEmail] = useState<string | null>(null);

    return (
        <PatientContext.Provider value={{ email, setEmail }}>
            {children}
        </PatientContext.Provider>
    );
};

export const usePatientContext = (): PatientContextType => {
    const context = useContext(PatientContext);
    if (!context) {
        throw new Error('usePatientContext must be used within a PatientProvider');
    }
    return context;
};
