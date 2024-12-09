import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeletePatientModalProps {
    patientName: string;
    onDelete: () => void;
    onClose: () => void;
    isOpen: boolean; // Controlar si el modal está abierto o cerrado
}

export const DeletePatientModal: React.FC<DeletePatientModalProps> = ({ patientName, onDelete, onClose, isOpen }) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Eliminar Paciente</DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro que deseas marcar a <strong>{patientName}</strong> como inactivo?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={onDelete} variant="destructive">
                        Confirmar
                    </Button>
                    <Button onClick={onClose} variant="outline">
                        Cancelar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeletePatientModal;