'use client'

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from "@/components/ui/dialog";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {CalendarIcon} from "lucide-react";
import {format} from "date-fns";
import {supabase} from "@/lib/supabaseClient";
import {usePatientContext} from "@/context/PatientContext";
import {useEmployee} from "@/context/EmployeeContext";
import Link from "next/link";
import { useRouter } from 'next/navigation'


export function PatientForm() {
    const router = useRouter()
    const [date, setDate] = useState<Date | undefined>(undefined); // Cambia null a undefined
    const [showConsultDialog, setShowConsultDialog] = useState(false);
    const [pacienteId, setPacienteId] = useState<number | null>(null); // Estado para el ID del paciente
    const [genders, setGenders] = useState<{ genero_id: number, nombre: string }[]>([]);
    const {email} = useEmployee(); // Obtenemos el email del contexto
    const [employeeData, setEmployeeData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        genero: '',
        direccion: '',
        numeroContacto: '',
        email: '',
        pass: '',
        antecedentes: '',
        ocupacion: '',
    });

    useEffect(() => {
        console.log("Email desde el useEffect:", email);  // Verificar si email está presente

        if (!email) return;

        const fetchEmployeeData = async () => {
            console.log("Fetching employee data for:", email);  // Verificar cuando se inicia la solicitud
            try {
                const {data, error} = await supabase
                    .from("empleados")
                    .select("*")
                    .eq("correo", email)
                    .single();

                if (error) {
                    throw error;
                }

                console.log("Datos del empleado obtenidos:", data);  // Verificar los datos obtenidos
                setEmployeeData(data);
            } catch (err: any) {
                console.error("Error al obtener los datos:", err.message);  // Error del fetch
                setError("Error al obtener los datos del empleado");
            }
        };

        fetchEmployeeData();
    }, [email]);

    // Mostrar datos en la consola si están disponibles
    useEffect(() => {
        if (employeeData) {
            console.log("Employee Data en el estado:", employeeData);
        }
        if (error) {
            console.log("Error:", error);
        }
    }, [employeeData, error]);


    // Cargar géneros desde Supabase
    useEffect(() => {
        const fetchGenders = async () => {
            const {data, error} = await supabase.from('generos').select('genero_id, nombre');
            if (error) {
                console.error('Error fetching genders:', error);
                return;
            }
            setGenders(data || []);
        };
        fetchGenders();
    }, []);

    const {setEmail} = usePatientContext();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date) {
            alert("Por favor seleccione una fecha de nacimiento.");
            return;
        }

        const {data, error} = await supabase.from('pacientes').insert({
            nombres: formData.nombres,
            apellidos: formData.apellidos,
            fecha_nacimiento: date.toISOString(), // Formatear fecha para la base de datos
            genero: formData.genero,
            direccion: formData.direccion,
            estado: 9,
            numero_contacto: formData.numeroContacto,
            email: formData.email,
            pass: formData.pass,
            antecedentes_familiares: formData.antecedentes,
            ocupacion: formData.ocupacion,
        }).select('paciente_id').single(); // Obtener el ID del paciente

        if (error) {
            console.error("Error creating patient:", error);
        } else if (data) {
            setPacienteId(data.paciente_id); // Guardar el ID del paciente
            setEmail(formData.email); // Actualizar contexto
            setShowConsultDialog(true); // Mostrar diálogo
        }
    };

    return (
        <>
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Datos del Nuevo Paciente</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="nombres">Nombres</Label>
                                    <Input
                                        id="nombres"
                                        required
                                        value={formData.nombres}
                                        onChange={(e) =>
                                            setFormData((prev) => ({...prev, nombres: e.target.value}))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="apellidos">Apellidos</Label>
                                    <Input
                                        id="apellidos"
                                        required
                                        value={formData.apellidos}
                                        onChange={(e) =>
                                            setFormData((prev) => ({...prev, apellidos: e.target.value}))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="direccion">Dirección</Label>
                                    <Input
                                        id="direccion"
                                        required
                                        value={formData.direccion}
                                        onChange={(e) =>
                                            setFormData((prev) => ({...prev, direccion: e.target.value}))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Fecha de Nacimiento</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                                {date ? format(date, "PPP") : <span>Seleccione fecha</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={(day) => setDate(day || undefined)} // Maneja undefined correctamente
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div>
                                    <Label htmlFor="genero">Género</Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({...prev, genero: value}))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione género"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {genders.map((gender) => (
                                                <SelectItem key={gender.genero_id} value={String(gender.genero_id)}>
                                                    {gender.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="numeroContacto">Número de Contacto</Label>
                                    <Input
                                        id="numeroContacto"
                                        required
                                        value={formData.numeroContacto}
                                        onChange={(e) =>
                                            setFormData((prev) => ({...prev, numeroContacto: e.target.value}))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData((prev) => ({...prev, email: e.target.value}))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="pass">Contraseña</Label>
                                    <Input
                                        id="pass"
                                        type="password"
                                        required
                                        value={formData.pass}
                                        onChange={(e) =>
                                            setFormData((prev) => ({...prev, pass: e.target.value}))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="antecedentes">Antecedentes Familiares</Label>
                                    <Textarea
                                        id="antecedentes"
                                        required
                                        value={formData.antecedentes}
                                        onChange={(e) =>
                                            setFormData((prev) => ({...prev, antecedentes: e.target.value}))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="ocupacion">Ocupación</Label>
                                    <Input
                                        id="ocupacion"
                                        required
                                        value={formData.ocupacion}
                                        onChange={(e) =>
                                            setFormData((prev) => ({...prev, ocupacion: e.target.value}))
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <Button type="submit">Guardar</Button>
                    </form>
                </CardContent>
            </Card>

            <Dialog open={showConsultDialog} onOpenChange={setShowConsultDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Paciente Registrado</DialogTitle>
                        <DialogDescription>
                            ¿Desea crear una consulta para este paciente?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-4">
                        <Button variant="outline" onClick={() => setShowConsultDialog(false)}>
                            No
                        </Button>
                        <Button
                            onClick={() => {
                                if (pacienteId) {
                                    router.push(`consulta?paciente_id=${pacienteId}`);
                                }
                            }}
                        >
                            Sí, crear consulta
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
