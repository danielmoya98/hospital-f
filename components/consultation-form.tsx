"use client";

import {useState, useEffect} from "react";
import {useSearchParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {supabase} from "@/lib/supabaseClient";
import { useEmployee } from "@/context/EmployeeContext";

export function ConsultationForm() {
    const searchParams = useSearchParams();
    const id = searchParams.get("paciente_id");
    const [employeeData, setEmployeeData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [showReferralDialog, setShowReferralDialog] = useState(false);
    const [patientData, setPatientData] = useState<any>(null);
    const [cie10List, setCie10List] = useState<{codigo: string, descripcion: string}[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [consultaId, setConsultaId] = useState<number | null>(null); // Variable para almacenar el id de la consulta


    // Definir el tipo como array


    useEffect(() => {
        if (id) {
            fetchPatientData(id);
        }
    }, [id]);

    const { email } = useEmployee(); //Obtienes el email del contexto

    useEffect(() => {
        console.log('Correo recuperado desde el contexto:', email);
    }, [email]);

    useEffect(() => {
        const fetchDoctors = async () => {
            const { data, error } = await supabase
                .from('empleados')  // Asegúrate de que el nombre de la tabla sea correcto
                .select('empleado_id, nombres, apellidos, especialidad');

            if (error) {
                console.error('Error fetching doctors:', error.message);
            } else {
                setDoctors(data);
            }
        };

        fetchDoctors();
    }, []);

    const handleDoctorChange = (value: string) => {
        setSelectedDoctor(value);
    };

    const fetchPatientData = async (id: string) => {
        const {data, error} = await supabase
            .from("pacientes")
            .select(`
            nombres,
            apellidos,
            email,
            direccion,
            genero,
            generos (
                nombre
            )
        `)
            .eq("paciente_id", id)
            .single();

        if (error) {
            console.error("Error fetching patient data:", error);
        } else {
            setPatientData(data);
        }
    };


    const fetchDoctorData = async (email: string) => {
        try {
            const { data, error } = await supabase
                .from("empleados")
                .select("*")
                .eq("correo", email)
                .single(); // Obtiene el doctor por email

            if (error) {
                console.error("Error al obtener datos del doctor:", error);
                setError("Error al obtener datos del doctor");
            } else {
                setEmployeeData(data);
                console.log(data);
            }
        } catch (err) {
            console.error("Error al conectar con Supabase:", err);
        }
    };


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
        notas: ""

    });


    const [selectedCie10, setSelectedCie10] = useState<any[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const calculateIMC = () => {
        if (formData.peso_kg && formData.estatura_cm) {
            const estaturaM = parseFloat(formData.estatura_cm) / 100; // Convertir estatura a metros
            const imc = parseFloat(formData.peso_kg) / (estaturaM * estaturaM);
            setFormData((prevData) => ({
                ...prevData,
                imc: imc.toFixed(2),
            }));
        }
    };

    useEffect(() => {
        if (email) {
            fetchDoctorData(email);  // Asegúrate de que el email esté definido
        }
    }, [email]);


    // Función para guardar los datos en Supabase
    const handleSave = async () => {
        if (!patientData || !employeeData) {
            alert("Datos incompletos.");
            console.log(patientData)
            console.log(employeeData)
            return;
        }

        try {
            const { data, error } = await supabase.from("consultas").insert([
                {
                    paciente_id: id || patientData.paciente_id,
                    doctor_id: employeeData.empleado_id,
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
                },
            ]);

            if (error) {
                console.error("Error al guardar en Supabase:", error);
                alert("Hubo un error al guardar la consulta.");
            } else {
                alert("Consulta guardada exitosamente.");
                console.log("Datos guardados:", data);

            }


        } catch (err) {
            console.error("Error al conectar con Supabase:", err);
        }
    };

    useEffect(() => {
        const fetchCIE10 = async () => {
            try {
                const { data, error } = await supabase
                    .from("cie10_codigos")
                    .select("codigo, descripcion");

                if (error) {
                    console.error("Error fetching CIE10 codes:", error);
                } else {
                    setCie10List(data || []);
                }
            } catch (err) {
                console.error("Error connecting to Supabase:", err);
            }
        };

        fetchCIE10();
    }, []);


    const handleSelectCie10 = (code: string, description: string) => {
        // Verificar si el código CIE10 ya está seleccionado
        const isDuplicate = selectedCie10.some((cie) => cie.codigo === code);

        if (isDuplicate) {
            // Muestra un mensaje de advertencia en lugar de un alert
            setError("Este código CIE10 ya ha sido agregado.");
            return; // No hacer nada si ya está en la lista
        }

        // Si no es duplicado, agregarlo a la lista de códigos CIE10 seleccionados
        const cie10 = { codigo: code, descripcion: description };
        setSelectedCie10((prev) => [...prev, cie10]);
        setError(null); // Limpiar cualquier mensaje de error
    };



    const handleRemoveCie10 = (code: string) => {
        setSelectedCie10((prev) => prev.filter((cie) => cie.codigo !== code));
    };


    return (
        <>
            <Card className="max-w-6xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"/>
                        <div>
                            {patientData ? (
                                <>
                                    <h2 className="text-2xl font-bold">{patientData.nombres} {patientData.apellidos}</h2>
                                    <p className="text-gray-500">
                                        Email : {patientData.email} | Genero : {patientData.generos?.nombre} | Ubicacion
                                        : {patientData.direccion}
                                    </p>
                                </>
                            ) : (
                                <p>Cargando datos del paciente...</p>
                            )}
                        </div>
                    </div>
                    <Button onClick={() => setShowReferralDialog(true)}>
                        Derivar Consulta
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-[200px_1fr] gap-6">
                        <div className="space-y-4">
                            <div>
                                <Label>Estatura (cm)</Label>
                                <Input
                                    type="number"
                                    name="estatura_cm"
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
                                    onChange={handleChange}
                                />
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
                            {/*<div>*/}
                            {/*    <Label>Código CIE10</Label>*/}
                            {/*    <Select*/}
                            {/*        value={formData.cie10}*/}
                            {/*        onValueChange={(value) =>*/}
                            {/*            handleSelectCie10(value, cie10List.find(cie => cie.codigo === value)?.descripcion || "")*/}
                            {/*        }*/}
                            {/*    >*/}
                            {/*        <SelectTrigger>*/}
                            {/*            <SelectValue placeholder="Selecciona un código"/>*/}
                            {/*        </SelectTrigger>*/}
                            {/*        <SelectContent>*/}
                            {/*            {cie10List.map((cie) => (*/}
                            {/*                <SelectItem*/}
                            {/*                    key={cie.codigo}*/}
                            {/*                    value={cie.codigo}*/}
                            {/*                >*/}
                            {/*                    {cie.codigo} - {cie.descripcion}*/}
                            {/*                </SelectItem>*/}
                            {/*            ))}*/}
                            {/*        </SelectContent>*/}
                            {/*    </Select>*/}
                            {/*</div>*/}
                        </div>
                        {/* Tabla para mostrar los códigos CIE10 seleccionados */}
                        <div className="col-span-2 mt-4">
                            {selectedCie10.length > 0 && (
                                <table className="min-w-full bg-white border border-gray-300">
                                    <thead>
                                    <tr>
                                        <th className="py-2 px-4 text-center border-b">Código</th>
                                        <th className="py-2 px-4 text-center border-b">Descripción</th>
                                        <th className="py-2 px-4 text-center border-b">Acción</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {selectedCie10.map((cie) => (
                                        <tr key={cie.codigo}>
                                            <td className="py-2 px-4 text-center border-b">{cie.codigo}</td>
                                            <td className="py-2 px-4 text-center border-b">{cie.descripcion}</td>
                                            <td className="py-2 px-4 text-center border-b">
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => handleRemoveCie10(cie.codigo)}
                                                >
                                                    Eliminar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        <Button variant="outline">Imprimir</Button>
                        <Button onClick={handleSave}>Guardar Consulta</Button>
                    </div>
                </CardContent>

            </Card>


            <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Derivar Consulta</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Seleccionar Doctor</Label>
                            <Select value={selectedDoctor} onValueChange={handleDoctorChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un doctor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {doctors.map((doctor) => (
                                        <SelectItem key={doctor.empleado_id} value={doctor.empleado_id}>
                                            {doctor.nombres} {doctor.apellidos} - {doctor.especialidad}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Mensaje</Label>
                            <Textarea placeholder="Escriba un mensaje para el doctor"/>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <Button variant="outline" onClick={() => setShowReferralDialog(false)}>
                                Cancelar
                            </Button>
                            <Button>Enviar</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
