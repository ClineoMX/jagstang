import React, { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  useToast,
} from '@chakra-ui/react';
import { apiService } from '../../services/api';
import type { ApiAdminUserRow } from '../../services/api';

interface AdminAssignNurseModalProps {
  nurse: ApiAdminUserRow | null;
  onClose: () => void;
  onAssigned?: () => void;
}

/**
 * Asigna una enfermera al equipo de un doctor (POST /admin/team/, servido
 * por duosonic). Los doctores se cargan sin el filtro de búsqueda de la
 * tabla para que el select siempre liste a todos.
 */
const AdminAssignNurseModal: React.FC<AdminAssignNurseModalProps> = ({
  nurse,
  onClose,
  onAssigned,
}) => {
  const [doctors, setDoctors] = useState<ApiAdminUserRow[]>([]);
  const [doctorId, setDoctorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!nurse) return;
    let cancelled = false;
    setDoctorId('');
    setLoading(true);
    apiService
      .getAdminUsers()
      .then((rows) => {
        if (cancelled) return;
        setDoctors(rows.filter((u) => u.Role === 'doctor'));
      })
      .catch(() => {
        if (!cancelled) {
          toast({
            title: 'No se pudo cargar la lista de doctores.',
            status: 'error',
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [nurse, toast]);

  const assign = async () => {
    if (!nurse || !doctorId) return;
    setSaving(true);
    try {
      await apiService.adminAssignNurse({ doctor: doctorId, nurse: nurse.ID });
      toast({
        title: `${nurse.Name} fue asignada al equipo.`,
        status: 'success',
      });
      onAssigned?.();
      onClose();
    } catch (err) {
      const message = (err as { message?: string })?.message ?? '';
      toast({
        title: message.includes('TEAM:ALREADY_MEMBER')
          ? 'Ya forma parte del equipo de ese doctor.'
          : 'No se pudo asignar al equipo.',
        status: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={nurse !== null} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px">Asignar a un doctor</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="13.5px" color="text.muted" mb={3}>
            <b>{nurse?.Name}</b> se unirá al equipo del doctor que elijas y
            podrá ver y actualizar a sus pacientes y registrar signos vitales.
          </Text>
          <Select
            size="sm"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            placeholder={
              loading
                ? 'Cargando doctores…'
                : doctors.length === 0
                  ? 'No hay doctores registrados'
                  : 'Selecciona un doctor…'
            }
            isDisabled={loading || doctors.length === 0}
          >
            {doctors.map((d) => (
              <option key={d.ID} value={d.ID}>
                {d.Name}
              </option>
            ))}
          </Select>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            size="sm"
            colorScheme="brand"
            onClick={assign}
            isDisabled={!doctorId}
            isLoading={saving}
          >
            Asignar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AdminAssignNurseModal;
