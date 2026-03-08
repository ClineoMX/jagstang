import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  InputGroup,
  InputLeftElement,
  Select,
  useToast,
  HStack,
  Icon,
  Box,
  Text,
  List,
  ListItem,
  useOutsideClick,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { usePatients } from '../hooks/usePatients';

const DURATION_OPTIONS = [
  { value: '30m', label: '30 minutos' },
  { value: '60m', label: '1 hora' },
  { value: '90m', label: '1.5 horas' },
  { value: '120m', label: '2 horas' },
] as const;

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialDate?: string;
  initialTime?: string;
  initialPatientId?: string;
  createAppointment: (
    patient: string,
    starts_at: string,
    duration: string
  ) => Promise<void>;
}

const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
  initialTime,
  initialPatientId,
  createAppointment,
}) => {
  const toast = useToast();
  const { patients, loading: loadingPatients } = usePatients();
  const patientSelectorRef = useRef<HTMLDivElement>(null);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState<string>('30m');
  const [patientId, setPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownBg = useColorModeValue('white', 'gray.800');
  const dropdownBorder = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients;
    const q = patientSearch.toLowerCase();
    return patients.filter(
      (p) =>
        p.firstName?.toLowerCase().includes(q) ||
        p.lastName?.toLowerCase().includes(q) ||
        p.lastNameMaternal?.toLowerCase().includes(q)
    );
  }, [patients, patientSearch]);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === patientId),
    [patients, patientId]
  );

  useOutsideClick({
    ref: patientSelectorRef,
    handler: () => setIsPatientDropdownOpen(false),
  });

  useEffect(() => {
    if (isOpen) {
      setDate(initialDate ?? '');
      setTime(initialTime ?? '');
      setDuration('30m');
      setPatientId(initialPatientId ?? '');
      setPatientSearch('');
      setIsPatientDropdownOpen(false);
    }
  }, [isOpen, initialDate, initialTime, initialPatientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date.trim() || !time.trim()) {
      toast({
        title: 'Error',
        description: 'Fecha y hora son obligatorios',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!patientId) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un paciente',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert local date/time to UTC for the API
      const localDate = new Date(`${date}T${time}:00`);
      const starts_at = localDate.toISOString();
      await createAppointment(patientId, starts_at, duration);

      toast({
        title: 'Cita creada',
        description: 'La cita ha sido creada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.message || 'Ocurrió un error al crear la cita',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl">
        <ModalHeader>
          <HStack spacing={3}>
            <Box bg="brand.500" p={2} borderRadius="lg" color="white">
              <Icon as={FiPlus} boxSize={5} />
            </Box>
            <Text>Nueva Cita</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Fecha</FormLabel>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Hora</FormLabel>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Duración</FormLabel>
                <Select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Paciente</FormLabel>
                <Box ref={patientSelectorRef} position="relative">
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      value={
                        patientId && selectedPatient
                          ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                          : patientSearch
                      }
                      onChange={(e) => {
                        setPatientSearch(e.target.value);
                        if (patientId) setPatientId('');
                        setIsPatientDropdownOpen(true);
                      }}
                      onFocus={() => setIsPatientDropdownOpen(true)}
                      placeholder={
                        loadingPatients
                          ? 'Cargando pacientes...'
                          : 'Buscar por nombre o apellido...'
                      }
                      isDisabled={loadingPatients}
                    />
                  </InputGroup>
                  {isPatientDropdownOpen && !loadingPatients && (
                    <Box
                      position="absolute"
                      top="100%"
                      left={0}
                      right={0}
                      mt={1}
                      maxH="200px"
                      overflowY="auto"
                      bg={dropdownBg}
                      borderWidth="1px"
                      borderColor={dropdownBorder}
                      borderRadius="md"
                      boxShadow="md"
                      zIndex={10}
                    >
                      <List spacing={0}>
                        {filteredPatients.length === 0 ? (
                          <ListItem px={4} py={3} fontSize="sm" color="gray.500">
                            No se encontraron pacientes
                          </ListItem>
                        ) : (
                          filteredPatients.map((p) => (
                            <ListItem
                              key={p.id}
                              px={4}
                              py={2}
                              cursor="pointer"
                              _hover={{ bg: hoverBg }}
                              onClick={() => {
                                setPatientId(p.id);
                                setPatientSearch('');
                                setIsPatientDropdownOpen(false);
                              }}
                            >
                              {p.firstName} {p.lastName}
                              {p.lastNameMaternal ? ` ${p.lastNameMaternal}` : ''}
                            </ListItem>
                          ))
                        )}
                      </List>
                    </Box>
                  )}
                </Box>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="ghost"
                onClick={onClose}
                isDisabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme="brand"
                isLoading={isSubmitting}
                loadingText="Creando..."
              >
                Crear Cita
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AppointmentFormModal;
