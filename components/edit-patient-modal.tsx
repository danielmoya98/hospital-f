"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

interface EditPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    onSave: (updatedPatient: Patient) => void;
}

export default function EditPatientModal({ isOpen, onClose, patient, onSave }: EditPatientModalProps) {
    // Establecer valores predeterminados si el paciente es null
    const [editablePatient, setEditablePatient] = useState<Patient>({
        paciente_id: patient?.paciente_id || 0,  // Valor predeterminado 0 si patient es null
        nombres: patient?.nombres || "",
        apellidos: patient?.apellidos || "",
        fecha_nacimiento: patient?.fecha_nacimiento || "",
        genero: patient?.genero,
        estado: patient?.estado,
        direccion: patient?.direccion || "",
        numero_contacto: patient?.numero_contacto || "",
        antecedentes_familiares: patient?.antecedentes_familiares || "",
        ocupacion: patient?.ocupacion || "",
        email: patient?.email || "",
        created_at: patient?.created_at,
        pass: patient?.pass,
    });

    useEffect(() => {
        if (patient) {
            setEditablePatient({
                paciente_id: patient.paciente_id,
                nombres: patient.nombres,
                apellidos: patient.apellidos,
                fecha_nacimiento: patient.fecha_nacimiento,
                genero: patient.genero,
                estado: patient.estado,
                direccion: patient.direccion || "",
                numero_contacto: patient.numero_contacto || "",
                antecedentes_familiares: patient.antecedentes_familiares || "",
                ocupacion: patient.ocupacion || "",
                email: patient.email,
                created_at: patient.created_at,
                pass: patient.pass,
            });
        }
    }, [patient]);

    const handleSave = () => {
        onSave(editablePatient);  // Send updated data to parent component
        onClose();  // Close modal after saving
    };



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setEditablePatient((prevState) => ({
            ...prevState,
            [id]: value,  // Update the specific field of the patient
        }));
    };



    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Paciente</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="nombres" className="text-right">
                            Nombre
                        </Label>
                        <Input
                            id="nombres"
                            value={editablePatient.nombres}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="apellidos" className="text-right">
                            Apellidos
                        </Label>
                        <Input
                            id="apellidos"
                            value={editablePatient.apellidos}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="numero_contacto" className="text-right">
                           Telefono
                        </Label>
                        <Input
                            id="numero_contacto"
                            value={editablePatient.numero_contacto || ""}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="fecha_nacimiento" className="text-right">
                            Fecha de Nacimiento
                        </Label>
                        <Input
                            id="fecha_nacimiento"
                            type="date"
                            value={editablePatient.fecha_nacimiento}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="direccion" className="text-right">
                            Dirección
                        </Label>
                        <Input
                            id="direccion"
                            value={editablePatient.direccion || ""}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="ocupacion" className="text-right">
                            Ocupación
                        </Label>
                        <Input
                            id="ocupacion"
                            value={editablePatient.ocupacion || ""}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Guardar cambios</Button>
                    <Button onClick={onClose} variant="secondary">
                        Cancelar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
