"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface HistoryModalProps {
    isOpen: boolean
    onClose: () => void
    patient: {
        paciente_id: number
        nombres: string
        apellidos: string
        fecha_nacimiento: string
        genero?: number
        estado?: number
        direccion?: string
        numero_contacto?: string
        antecedentes_familiares?: string
        ocupacion?: string
        email: string
        created_at?: string
        pass?: string
    } | null
}

interface HistoryEntry {
    date: string
    diagnosis: string
    treatment: string
}

export default function HistoryModal({ isOpen, onClose, patient }: HistoryModalProps) {
    const [history, setHistory] = useState<HistoryEntry[]>([])

    useEffect(() => {
        if (patient && isOpen) {
            // Consultar el historial médico desde Supabase
            const fetchHistory = async () => {
                const { data, error } = await supabase
                    .from("consultas")
                    .select("fecha_consulta, diagnostico, tratamiento_prescrito")
                    .eq("paciente_id", patient.paciente_id)

                if (error) {
                    console.error("Error fetching history:", error)
                    return
                }

                // Mapear los datos al formato esperado
                const formattedHistory = data.map((entry) => ({
                    date: entry.fecha_consulta,
                    diagnosis: entry.diagnostico,
                    treatment: entry.tratamiento_prescrito,
                }))

                setHistory(formattedHistory)
            }

            fetchHistory()
        }
    }, [patient, isOpen])

    if (!patient) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Historial Médico de {patient.nombres}</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Diagnóstico</TableHead>
                                <TableHead>Tratamiento</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((entry, index) => (
                                <TableRow key={index}>
                                    <TableCell>{entry.date}</TableCell>
                                    <TableCell>{entry.diagnosis}</TableCell>
                                    <TableCell>{entry.treatment}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    )
}
