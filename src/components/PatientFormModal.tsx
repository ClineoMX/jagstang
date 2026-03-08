import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  useToast,
  useColorModeValue,
  HStack,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { apiService } from '../services/api';
import { usePatient } from '../hooks/usePatients';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
  onSuccess?: () => void;
}

const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  patientId,
  onSuccess,
}) => {
  const toast = useToast();
  const isEditing = !!patientId;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { patient: apiPatient, profile: apiProfile, loading: loadingPatient } =
    usePatient(patientId);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [lastNameMaternal, setLastNameMaternal] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (isEditing && patientId && apiPatient) {
      setFirstName(apiPatient.firstName);
      setLastName(apiPatient.lastName);
      setLastNameMaternal(apiPatient.lastNameMaternal ?? '');
      setPhone(apiPatient.phone ?? apiProfile?.phone ?? '');
    } else if (!isEditing) {
      setFirstName('');
      setLastName('');
      setLastNameMaternal('');
      setPhone('');
    }
  }, [isEditing, patientId, isOpen, apiPatient, apiProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: 'Error',
        description: 'Nombre y apellido paterno son obligatorios',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!phone.trim()) {
      toast({
        title: 'Error',
        description: 'El teléfono es obligatorio',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && patientId) {
        await apiService.updatePatientProfile(patientId, { phone });
        toast({
          title: 'Paciente actualizado',
          description: 'El paciente ha sido actualizado exitosamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await apiService.createPatient({
          name: firstName,
          lastname: lastName,
          lastname_m: lastNameMaternal.trim() || undefined,
          phone,
        });
        toast({
          title: 'Paciente creado',
          description: 'El paciente ha sido creado exitosamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onClose();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error al guardar el paciente',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
        </ModalHeader>
        <ModalCloseButton />
        {loadingPatient && isEditing ? (
          <ModalBody pb={6}>
            <VStack spacing={4} py={8}>
              <Spinner size="xl" color="brand.500" />
              <Text>Cargando datos del paciente...</Text>
            </VStack>
          </ModalBody>
        ) : (
          <form onSubmit={handleSubmit}>
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Nombre(s)</FormLabel>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ej: Juan Carlos"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Apellido paterno</FormLabel>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ej: Pérez"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Apellido materno</FormLabel>
                  <Input
                    value={lastNameMaternal}
                    onChange={(e) => setLastNameMaternal(e.target.value)}
                    placeholder="Ej: Martínez"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Teléfono</FormLabel>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+52 55 1234 5678"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  colorScheme="brand"
                  isLoading={isSubmitting}
                  loadingText={isEditing ? 'Guardando...' : 'Creando...'}
                >
                  {isEditing ? 'Guardar Cambios' : 'Crear Paciente'}
                </Button>
              </HStack>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PatientFormModal;
