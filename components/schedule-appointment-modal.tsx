"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Patient {
    paciente_id: number;
    nombres: string;
    apellidos: string;
    fecha_nacimiento: string;
    genero?: number;
    estado?: number;
    direccion?: string;
    numero_contacto?: string;
    antecedentes_familiares?: string;
    ocupacion?: string;
    email: string;
}

interface ScheduleAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
}

interface Doctor {
    empleado_id: number;
    nombres: string;
}

const fetchDoctors = async () => {
    try {
        // Realizar la consulta para obtener todos los doctores desde la base de datos
        const { data, error } = await supabase
            .from("empleados") // Tabla que contiene los doctores
            .select("empleado_id, nombres"); // Seleccionamos los campos que necesitamos

        if (error) {
            throw error; // Lanza un error si la consulta falla
        }

        return data as Doctor[]; // Devuelve los doctores recuperados
    } catch (err: any) {
        console.error("Error al recuperar los doctores:", err.message);
        return []; // Retorna un array vacío si ocurre un error
    }
};

export default function ScheduleAppointmentModal({
                                                     isOpen,
                                                     onClose,
                                                     patient,
                                                 }: ScheduleAppointmentModalProps) {
    const [date, setDate] = useState<string>("");
    const [time, setTime] = useState<string>("");
    const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [subject, setSubject] = useState<string>("");

    useEffect(() => {
        // Llamar a la función para recuperar los doctores cuando se cargue el componente
        const getDoctors = async () => {
            const fetchedDoctors = await fetchDoctors();
            setDoctors(fetchedDoctors); // Establecer los doctores en el estado
        };

        getDoctors(); // Ejecutar la función
    }, []);

    const handleSave = async () => {
        if (!selectedDoctor || !date || !time || !subject) {
            alert("Completa todos los campos.");
            return;
        }

        // Preparar los datos para la inserción
        const newCita = {
            paciente_id: patient?.paciente_id,
            doctor_id: selectedDoctor,
            fecha_cita: `${date}T${time}`, // Formato de fecha completo
            estado:9, // Supongo que el estado 1 es el valor por defecto para 'pendiente'
            asunto: subject, // Agregar el asunto
        };

        try {
            // Realizar la inserción en la tabla 'citas' de Supabase
            const { data, error } = await supabase
                .from("citas")
                .insert([newCita]); // Insertar un array con un solo objeto

            if (error) {
                throw error;
            }

            // Si la cita fue creada correctamente
            console.log("Cita creada con éxito:", data);

            // Aquí puedes hacer lo que necesites después de la creación, como actualizar la lista de citas o cerrar el modal
            onClose(); // Cerrar el modal después de guardar la cita

        } catch (err: any) {
            console.error("Error al crear la cita:", err.message);
            alert("Error al crear la cita. Intenta de nuevo.");
        }
    };

    if (!patient) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Agendar cita para {`${patient.nombres} ${patient.apellidos}`}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date">Fecha</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time">Hora</Label>
                        <Input
                            id="time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="subject">Asunto</Label>
                        <Input
                            id="subject"
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="doctor">Doctor</Label>
                        <Select onValueChange={(value) => setSelectedDoctor(Number(value))}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Selecciona un doctor" />
                            </SelectTrigger>
                            <SelectContent>
                                {doctors.map((doctor) => (
                                    <SelectItem key={doctor.empleado_id} value={doctor.empleado_id.toString()}>
                                        {doctor.nombres}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end space-x-2">
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
