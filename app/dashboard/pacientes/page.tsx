"use client";
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button"; // Asegúrate de tener el componente Button
import { Edit, Calendar, FileText, History, Trash2 } from 'lucide-react'; // Iconos
import { useEmployee } from "@/context/EmployeeContext";
import { supabase } from "@/lib/supabaseClient";
import EditPatientModal from "@/components/edit-patient-modal";
import ScheduleAppointmentModal from "@/components/schedule-appointment-modal";
import NewConsultationModal from '@/components/new-consultation-modal';
import HistoryModal from "@/components/history-modal";
import DeletePatientModal from "@/components/delete-patient-modal";

// Define la interfaz de paciente
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

export default function PatientList() {
    const { email } = useEmployee(); // Obtenemos el email del contexto
    const [patients, setPatients] = useState<Patient[]>([]); // Inicializado como un array vacío
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>(''); // Estado para el término de búsqueda
    const [doctorId, setDoctorId] = useState<number | null>(null); // Estado para el doctor_id

    // Estados para los modales
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [consultationModalOpen, setConsultationModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (!email) return;

        const fetchPatients = async () => {
            try {
                const { data: employeeData, error: employeeError } = await supabase
                    .from("empleados")
                    .select("empleado_id")
                    .eq("correo", email)
                    .single();

                if (employeeError) {
                    throw employeeError;
                }
                setDoctorId(employeeData.empleado_id);

                if (employeeData && employeeData.empleado_id) {
                    const { data: consultaData, error: consultaError } = await supabase
                        .from('consultas')
                        .select('paciente_id')
                        .eq('doctor_id', employeeData.empleado_id);

                    if (consultaError) {
                        throw consultaError;
                    }

                    if (consultaData && consultaData.length > 0) {
                        const pacienteIds = consultaData.map((consulta) => consulta.paciente_id);

                        const { data, error } = await supabase
                            .from('pacientes')
                            .select('paciente_id, nombres, apellidos, fecha_nacimiento, direccion, genero , numero_contacto, antecedentes_familiares, ocupacion, email')
                            .in('paciente_id', pacienteIds);

                        if (error) {
                            throw error;
                        }

                        setPatients(data || []);
                    } else {
                        setPatients([]);
                    }
                }
            } catch (err: any) {
                console.error("Error al obtener los pacientes:", err.message);
                setError("Error al obtener los pacientes atendidos");
            }
        };

        fetchPatients();
    }, [email]);

    const filteredPatients = patients.filter((patient) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            patient.nombres.toLowerCase().includes(searchLower) ||
            patient.apellidos.toLowerCase().includes(searchLower) ||
            patient.ocupacion?.toLowerCase().includes(searchLower) ||
            patient.numero_contacto?.toLowerCase().includes(searchLower)
        );
    });

    const calculateAge = (birthdate: string) => {
        const birthDate = new Date(birthdate);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        return age;
    };

    const openModal = (modalType: string, patient: Patient) => {
        setSelectedPatient(patient);
        if (modalType === 'edit') setEditModalOpen(true);
        if (modalType === 'schedule') setScheduleModalOpen(true);
        if (modalType === 'consultation') setConsultationModalOpen(true);
        if (modalType === 'history') setHistoryModalOpen(true);
        if (modalType === 'delete') setDeleteModalOpen(true);
    };

    const handleSave = async (updatedPatient: Patient) => {
        console.log("Datos del paciente actualizados:", updatedPatient);

        // Desestructuramos el paciente para no incluir el email (clave primaria)
        const { email, ...patientData } = updatedPatient;

        try {
            // Actualizar los datos del paciente en Supabase
            const { data, error } = await supabase
                .from('pacientes')
                .update(patientData)  // Solo los campos que se van a actualizar
                .eq('email', email);  // Filtrar por email para asegurar que estamos actualizando el paciente correcto

            // Manejar posibles errores
            if (error) {
                throw error;
            }

            console.log('Paciente actualizado con éxito:', data);

            // Aquí puedes actualizar el estado de la aplicación si es necesario
            // Por ejemplo, si tienes un estado global o local de pacientes, actualízalo aquí
            // Si necesitas actualizar la lista de pacientes:
            // setPatients(prevPatients => prevPatients.map(patient => patient.email === email ? { ...patient, ...patientData } : patient));

        } catch (err: any) {
            console.error("Error al guardar los cambios:", err.message);
            // Si deseas mostrar un mensaje de error en el UI
            setError("Error al guardar los cambios");
        }
    };



    const handleSavePatient = (updatedPatient: Patient) => {
        // Lógica para guardar o actualizar al paciente
        console.log(updatedPatient);
    };

    const handleDeletePatient = async () => {
        if (!selectedPatient) return;

        try {
            const { data, error } = await supabase
                .from('pacientes')
                .update({ estado: 10 }) // Cambiar el estado a "inactivo"
                .eq('paciente_id', selectedPatient.paciente_id);

            if (error) {
                throw error;
            }

            // Actualizar la lista local de pacientes
            setPatients((prevPatients) =>
                prevPatients.map((patient) =>
                    patient.paciente_id === selectedPatient.paciente_id
                        ? { ...patient, estado: 0 }
                        : patient
                )
            );

            setDeleteModalOpen(false); // Cerrar el modal
            setSelectedPatient(null); // Limpiar el paciente seleccionado
        } catch (err: any) {
            console.error("Error al eliminar el paciente:", err.message);
            setError("Error al eliminar el paciente.");
        }
    };


    return (
        <div className="container mx-auto py-10">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    <h2 className="text-2xl font-bold tracking-tight">Listado de Pacientes</h2>
                    <div className="mt-4 flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar paciente"
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="mt-6 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre completo</TableHead>
                                    <TableHead>Telefono</TableHead>
                                    <TableHead>Ocupacion</TableHead>
                                    <TableHead>Edad</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPatients.map((patient) => (
                                    <TableRow key={patient.paciente_id}>
                                        <TableCell>{patient.nombres} {patient.apellidos}</TableCell>
                                        <TableCell>{patient.numero_contacto}</TableCell>
                                        <TableCell>{patient.ocupacion}</TableCell>
                                        <TableCell>{calculateAge(patient.fecha_nacimiento)}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button variant="ghost" size="icon" onClick={() => openModal('edit', patient)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => openModal('schedule', patient)}>
                                                    <Calendar className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => openModal('consultation', patient)}>
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => openModal('history', patient)}>
                                                    <History className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => openModal('delete', patient)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Modal de edición */}
            <EditPatientModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                patient={selectedPatient}
                onSave={handleSave}
            />
            {/* Modal para agendar cita */}
            <ScheduleAppointmentModal
                isOpen={scheduleModalOpen}
                onClose={() => setScheduleModalOpen(false)}
                patient={selectedPatient}
            />
            {/* Modal para nueva consulta */}
            <NewConsultationModal
                isOpen={consultationModalOpen}
                onClose={() => setConsultationModalOpen(false)}
                patient={selectedPatient}
                doctorId={doctorId ?? 0}

            />
            {/* Modal para historial */}
            <HistoryModal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                patient={selectedPatient}
            />
            {/* Modal para eliminar paciente */}
            <DeletePatientModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onDelete={handleDeletePatient}
                patientName={selectedPatient?.nombres || " "}
            />

        </div>
    );
}
