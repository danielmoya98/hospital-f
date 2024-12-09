"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Configura el cliente de Supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    created_at?: string;
    pass?: string;
}

interface NewConsultationModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    doctorId: number; // Agregamos doctorId como prop adicional
}

export default function NewConsultationModal({
                                                 isOpen,
                                                 onClose,
                                                 patient,
                                                 doctorId,
                                             }: NewConsultationModalProps) {
    const [formData, setFormData] = useState({
        estatura_cm: "",
        peso_kg: "",
        imc: "",
        temperatura: "",
        frecuencia_respiratoria: "",
        presion_arterial: "",
        frecuencia_cardiaca: "",
        motivo_consulta: "",
        sintomas: "",
        diagnostico: "",
        tratamiento_prescrito: "",
        notas: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        // Validaciones
        if (!patient || Object.values(formData).some((field) => !field)) {
            alert("Completa todos los campos.");
            return;
        }

        const consultaData = {
            paciente_id: patient.paciente_id,
            doctor_id: doctorId,
            motivo_consulta: formData.motivo_consulta,
            sintomas: formData.sintomas,
            diagnostico: formData.diagnostico,
            tratamiento_prescrito: formData.tratamiento_prescrito,
            notas: formData.notas,
            estatura_cm: formData.estatura_cm,
            peso_kg: formData.peso_kg,
            imc: formData.imc,
            temperatura: formData.temperatura,
            frecuencia_respiratoria: formData.frecuencia_respiratoria,
            presion_arterial: formData.presion_arterial,
            frecuencia_cardiaca: formData.frecuencia_cardiaca,

        };

        try {
            const { data, error } = await supabase
                .from("consultas")
                .insert(consultaData);

            if (error) {
                console.error("Error al insertar la consulta:", error.message);
                alert("Ocurrió un error al guardar la consulta.");
                return;
            }

            console.log("Consulta guardada con éxito:", data);
            alert("Consulta guardada con éxito.");
            onClose();
        } catch (err) {
            console.error("Error inesperado:", err);
            alert("Ocurrió un error inesperado.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Nueva Consulta para {patient?.nombres} {patient?.apellidos}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-[200px_1fr] gap-6">
                    <div className="space-y-4">
                        <div>
                            <Label>Estatura (cm)</Label>
                            <Input
                                type="number"
                                name="estatura_cm" // Cambiado a estatura_cm
                                value={formData.estatura_cm}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label>Peso (kg)</Label>
                            <Input
                                type="number"
                                name="peso_kg"
                                value={formData.peso_kg}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label>IMC</Label>
                            <Input
                                type="number"
                                name="imc"
                                value={formData.imc}
                                onChange={handleChange}/>
                        </div>
                        <div>
                            <Label>Temperatura</Label>
                            <Input
                                type="number"
                                step="0.1"
                                name="temperatura"
                                value={formData.temperatura}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label>F.R.</Label>
                            <Input
                                type="number"
                                name="frecuencia_respiratoria"
                                value={formData.frecuencia_respiratoria}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label>P.A.</Label>
                            <Input
                                name="presion_arterial"
                                value={formData.presion_arterial}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label>F.C.</Label>
                            <Input
                                type="number"
                                name="frecuencia_cardiaca"
                                value={formData.frecuencia_cardiaca}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <Label>Motivo de la Consulta</Label>
                            <Textarea
                                className="min-h-[100px]"
                                name="motivo_consulta"
                                value={formData.motivo_consulta}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <Label>Síntomas</Label>
                                <Textarea
                                    name="sintomas"
                                    value={formData.sintomas}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <Label>Diagnóstico</Label>
                                <Textarea
                                    name="diagnostico"
                                    value={formData.diagnostico}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Tratamiento Prescrito</Label>
                            <Textarea
                                name="tratamiento_prescrito"
                                value={formData.tratamiento_prescrito}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label>Notas</Label>
                            <Textarea
                                name="notas"
                                value={formData.notas}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Guardar Consulta</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
