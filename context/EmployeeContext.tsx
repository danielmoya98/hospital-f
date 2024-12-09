"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

// Definir el tipo del contexto
interface EmployeeContextType {
    email: string | null;
    setEmail: (email: string | null) => void;
}

// Crear el contexto con un valor inicial
const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

// Crear el provider
export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
    const [email, setEmail] = useState<string | null>(null);

    return (
        <EmployeeContext.Provider value={{ email, setEmail }}>
            {children}
        </EmployeeContext.Provider>
    );
};

// Hook para usar el contexto
export const useEmployee = () => {
    const context = useContext(EmployeeContext);
    if (!context) {
        throw new Error("useEmployee debe usarse dentro de EmployeeProvider");
    }
    return context;
};
