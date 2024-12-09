import { PatientForm } from "@/components/patient-form"
import { PatientProvider } from "@/context/PatientContext"

export default function Home() {
    return <PatientProvider>
        <PatientForm />
        {/* Otros componentes, como Consulta, también pueden acceder al contexto */}
    </PatientProvider>
}
