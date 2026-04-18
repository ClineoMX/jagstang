import React, { useState, useEffect } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Spinner,
  Text,
  useColorModeValue,
  Box,
} from '@chakra-ui/react';
import { apiService } from '../services/api';
import { usePatient } from '../hooks/usePatients';
import PhoneNumberField, { phoneNumberFieldUtils } from './PhoneNumberField';
import FormDrawer from './FormDrawer';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
  onSuccess?: () => void;
}

/**
 * Drawer-based patient form. The component name/props are kept for API
 * compatibility with existing callers, but internally the modal has been
 * replaced by a right-side `FormDrawer` per the new UX guidelines.
 */
const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  patientId,
  onSuccess,
}) => {
  const toast = useToast();
  const isEditing = !!patientId;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const subColor = useColorModeValue('paper.700', 'paper.400');

  const {
    patient: apiPatient,
    profile: apiProfile,
    loading: loadingPatient,
  } = usePatient(patientId);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [lastNameMaternal, setLastNameMaternal] = useState('');
  const [phone, setPhone] = useState({ countryIso2: 'MX', nationalNumber: '' });
  const [loadedPhoneE164, setLoadedPhoneE164] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && patientId && apiPatient) {
      setFirstName(apiPatient.firstName);
      setLastName(apiPatient.lastName);
      setLastNameMaternal(apiPatient.lastNameMaternal ?? '');
      setLoadedPhoneE164(apiPatient.phone ?? apiProfile?.phone ?? null);
      setPhone({ countryIso2: 'MX', nationalNumber: '' });
    } else if (!isEditing) {
      setFirstName('');
      setLastName('');
      setLastNameMaternal('');
      setLoadedPhoneE164(null);
      setPhone({ countryIso2: 'MX', nationalNumber: '' });
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

    setIsSubmitting(true);

    try {
      const phoneE164 = phoneNumberFieldUtils.toE164(
        phone.countryIso2,
        phone.nationalNumber
      );
      if (isEditing && patientId) {
        await apiService.updatePatientProfile(patientId, { phone: phoneE164 });
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
          ...(phoneE164 && { phone: phoneE164 }),
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
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description:
          (error instanceof Error && error.message) ||
          'Ocurrió un error al guardar el paciente',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPatient && isEditing) {
    return (
      <FormDrawer
        isOpen={isOpen}
        onClose={onClose}
        crumb="Pacientes"
        title="Editar paciente"
        hideDefaultActions
      >
        <VStack spacing={4} py={12}>
          <Spinner size="lg" color="brand.500" />
          <Text color={subColor}>Cargando datos del paciente...</Text>
        </VStack>
      </FormDrawer>
    );
  }

  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={onClose}
      crumb="Pacientes"
      title={isEditing ? 'Editar paciente' : 'Nuevo paciente'}
      sub={
        isEditing
          ? 'Actualiza los datos de contacto del paciente.'
          : 'Registra un nuevo paciente en tu lista.'
      }
      onSubmit={handleSubmit}
      submitLabel={isEditing ? 'Guardar cambios' : 'Crear paciente'}
      submitLoadingText={isEditing ? 'Guardando…' : 'Creando…'}
      isSubmitting={isSubmitting}
    >
      <VStack spacing={5} align="stretch">
        <FormControl isRequired>
          <FormLabel
            fontSize="11px"
            fontFamily="mono"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color={labelColor}
            fontWeight={500}
            mb={1.5}
          >
            Nombre(s)
          </FormLabel>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ej: Juan Carlos"
            size="sm"
            h="36px"
            borderColor="line.strong"
            _hover={{ borderColor: 'paper.600' }}
            _focus={{
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
            }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel
            fontSize="11px"
            fontFamily="mono"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color={labelColor}
            fontWeight={500}
            mb={1.5}
          >
            Apellido paterno
          </FormLabel>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Ej: Pérez"
            size="sm"
            h="36px"
            borderColor="line.strong"
            _hover={{ borderColor: 'paper.600' }}
            _focus={{
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
            }}
          />
        </FormControl>

        <FormControl>
          <FormLabel
            fontSize="11px"
            fontFamily="mono"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color={labelColor}
            fontWeight={500}
            mb={1.5}
          >
            Apellido materno
          </FormLabel>
          <Input
            value={lastNameMaternal}
            onChange={(e) => setLastNameMaternal(e.target.value)}
            placeholder="Ej: Martínez"
            size="sm"
            h="36px"
            borderColor="line.strong"
            _hover={{ borderColor: 'paper.600' }}
            _focus={{
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
            }}
          />
        </FormControl>

        <Box>
          <PhoneNumberField
            value={phone}
            onChange={setPhone}
            e164Value={loadedPhoneE164}
          />
        </Box>
      </VStack>
    </FormDrawer>
  );
};

export default PatientFormModal;
