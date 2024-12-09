"use client";
import { useEffect, useState } from "react";
import { Search, Trash2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEmployee } from "@/context/EmployeeContext";
import { supabase } from "@/lib/supabaseClient";

interface Appointment {
    id: string;
    patient: string;
    ci: string;
    date: string;
    days: number;
    time: string;
    subject: string;
}

export default function AppointmentsTable() {
    const [searchQuery, setSearchQuery] = useState("");
    const { email } = useEmployee();
    const [employeeData, setEmployeeData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    const calculateDaysRemaining = (appointmentDate: string): number => {
        const today = new Date();
        const appointment = new Date(appointmentDate);
        const timeDifference = appointment.getTime() - today.getTime();
        const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24)); // Convertir de milisegundos a días
        return daysRemaining;
    };

    useEffect(() => {
        if (!email) return;

        const fetchEmployeeData = async () => {
            try {
                // Obtener los datos del empleado (médico)
                const { data, error } = await supabase
                    .from("empleados")
                    .select("*")
                    .eq("correo", email)
                    .single();

                if (error) throw error;
                setEmployeeData(data);

                // Obtener las citas del médico
                const { data: appointmentsData, error: appointmentsError } = await supabase
                    .from("citas")
                    .select("*, paciente_id:pacientes(*)") // Obtener también los datos del paciente con un JOIN
                    .eq("doctor_id", data.empleado_id) // Suponiendo que empleado_id es el ID del doctor
                    .order("fecha_cita", { ascending: true });

                if (appointmentsError) throw appointmentsError;

                // Mapear las citas para ajustarlas al formato esperado
                const formattedAppointments = appointmentsData.map((appointment: any) => ({
                    id: appointment.cita_id,
                    patient: `${appointment.paciente_id.nombres} ${appointment.paciente_id.apellidos}`, // Obtener nombres del paciente
                    ci: appointment.paciente_id.numero_carnet, // Obtener el número de carnet del paciente
                    date: appointment.fecha_cita,
                    days: calculateDaysRemaining(appointment.fecha_cita),
                    time: format(new Date(appointment.fecha_cita), "HH:mm"),
                    subject: appointment.asunto,
                }));

                setAppointments(formattedAppointments);
            } catch (err: any) {
                setError("Error al obtener los datos del empleado o citas");
                console.error(err.message);
            }
        };

        fetchEmployeeData();
    }, [email]);

    const deleteAppointment = async (id: string) => {
        try {
            // Actualizar el estado de la cita a 'inactivo' en Supabase
            const { error } = await supabase
                .from("citas")
                .update({ estado: 10 }) // Suponiendo que 'estado' es el campo para marcar la cita
                .eq("cita_id", id);

            if (error) throw error;

            // Actualizar la lista de citas localmente
            setAppointments(appointments.filter((appointment) => appointment.id !== id));
        } catch (err: any) {
            setError("Error al eliminar la cita");
            console.error(err.message);
        }
    };

    const updateAppointments = async () => {
        const currentDate = new Date();

        // Filtrar las citas que ya han pasado
        const updatedAppointments = appointments.filter((appointment) => {
            const appointmentDate = new Date(appointment.date);
            return appointmentDate >= currentDate;
        });

        // Actualizar las citas localmente
        setAppointments(updatedAppointments);
    };

    const safeToLowerCase = (str: any) => (typeof str === "string" ? str.toLowerCase() : "");

    const filteredAppointments = appointments.filter((appointment) =>
        safeToLowerCase(appointment.patient).includes(searchQuery.toLowerCase()) ||
        appointment.ci.includes(searchQuery) ||
        safeToLowerCase(appointment.subject).includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
            <h1 className="text-2xl font-bold">Agenda</h1>

            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por paciente, CI o asunto..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Paciente</TableHead>
                            <TableHead>CI</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Días</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead>Asunto</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAppointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                                <TableCell>{appointment.patient}</TableCell>
                                <TableCell>{appointment.ci}</TableCell>
                                <TableCell>{format(new Date(appointment.date), "dd/MM/yyyy", { locale: es })}</TableCell>
                                <TableCell>{calculateDaysRemaining(appointment.date)}</TableCell>
                                <TableCell>{appointment.time}</TableCell>
                                <TableCell>{appointment.subject}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteAppointment(appointment.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-end gap-4">
                <Button
                    variant="outline"
                    onClick={updateAppointments}
                    className="w-32"
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Actualizar
                </Button>
            </div>
        </div>
    );
}
