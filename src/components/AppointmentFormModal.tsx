import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Textarea,
  useToast,
  HStack,
  Icon,
  Box,
  Text,
  List,
  ListItem,
  useOutsideClick,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { usePatients } from '../hooks/usePatients';
import FormDrawer from './FormDrawer';

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
    duration: string,
    additional_notes?: string
  ) => Promise<void>;
}

const FIELD_LABEL_STYLES = {
  fontSize: '11px' as const,
  fontFamily: 'mono' as const,
  letterSpacing: '0.08em' as const,
  textTransform: 'uppercase' as const,
  fontWeight: 500 as const,
  mb: 1.5,
};

const INPUT_STYLES = {
  size: 'sm' as const,
  h: '36px',
  borderColor: 'line.strong',
  _hover: { borderColor: 'paper.600' },
  _focus: {
    borderColor: 'brand.500',
    boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
  },
};

/**
 * Drawer-based appointment form. Name/props preserved for API compatibility;
 * the previous centered modal has been replaced by a right-side drawer.
 */
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
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [patientId, setPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const dropdownBg = useColorModeValue('white', 'paper.800');
  const dropdownBorder = useColorModeValue('line.strong', 'whiteAlpha.300');
  const hoverBg = useColorModeValue('paper.100', 'whiteAlpha.50');

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
      setAdditionalNotes('');
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
      const localDate = new Date(`${date}T${time}:00`);
      const starts_at = localDate.toISOString();
      await createAppointment(patientId, starts_at, duration, additionalNotes);

      toast({
        title: 'Cita creada',
        description: 'La cita ha sido creada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      onSuccess?.();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description:
          (error instanceof Error && error.message) ||
          'Ocurrió un error al crear la cita',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={onClose}
      crumb="Agenda"
      title="Nueva cita"
      sub="Agenda una cita para uno de tus pacientes."
      onSubmit={handleSubmit}
      submitLabel="Crear cita"
      submitLoadingText="Creando…"
      isSubmitting={isSubmitting}
    >
      <VStack spacing={5} align="stretch">
        <SimpleGrid columns={2} spacing={3}>
          <FormControl isRequired>
            <FormLabel {...FIELD_LABEL_STYLES} color={labelColor}>
              Fecha
            </FormLabel>
            <Input
              {...INPUT_STYLES}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel {...FIELD_LABEL_STYLES} color={labelColor}>
              Hora
            </FormLabel>
            <Input
              {...INPUT_STYLES}
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </FormControl>
        </SimpleGrid>

        <FormControl isRequired>
          <FormLabel {...FIELD_LABEL_STYLES} color={labelColor}>
            Duración
          </FormLabel>
          <Select
            {...INPUT_STYLES}
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

        <FormControl>
          <FormLabel {...FIELD_LABEL_STYLES} color={labelColor}>
            Notas adicionales
          </FormLabel>
          <Textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Contexto o indicaciones para la cita…"
            rows={3}
            fontSize="13px"
            borderColor="line.strong"
            resize="vertical"
            _hover={{ borderColor: 'paper.600' }}
            _focus={{
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
            }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel {...FIELD_LABEL_STYLES} color={labelColor}>
            Paciente
          </FormLabel>
          <Box ref={patientSelectorRef} position="relative">
            <InputGroup>
              <InputLeftElement pointerEvents="none" h="36px">
                <Icon as={FiSearch} color={labelColor} boxSize={4} />
              </InputLeftElement>
              <Input
                {...INPUT_STYLES}
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
                    ? 'Cargando pacientes…'
                    : 'Buscar por nombre o apellido…'
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
                maxH="220px"
                overflowY="auto"
                bg={dropdownBg}
                border="1px solid"
                borderColor={dropdownBorder}
                borderRadius="6px"
                boxShadow="0 4px 12px rgba(20,22,27,.08)"
                zIndex={10}
              >
                <List spacing={0}>
                  {filteredPatients.length === 0 ? (
                    <ListItem px={3} py={2.5} fontSize="13px" color={labelColor}>
                      No se encontraron pacientes
                    </ListItem>
                  ) : (
                    filteredPatients.map((p) => (
                      <ListItem
                        key={p.id}
                        px={3}
                        py={2}
                        fontSize="13px"
                        cursor="pointer"
                        _hover={{ bg: hoverBg }}
                        onClick={() => {
                          setPatientId(p.id);
                          setPatientSearch('');
                          setIsPatientDropdownOpen(false);
                        }}
                      >
                        <Text fontWeight={500}>
                          {p.firstName} {p.lastName}
                          {p.lastNameMaternal ? ` ${p.lastNameMaternal}` : ''}
                        </Text>
                      </ListItem>
                    ))
                  )}
                </List>
              </Box>
            )}
          </Box>
        </FormControl>

        <HStack
          spacing={2}
          px={3}
          py={2.5}
          bg="statusSoft.infoBg"
          border="1px solid"
          borderColor="statusSoft.infoBorder"
          borderRadius="6px"
        >
          <Text fontSize="12px" color="statusSoft.infoFg">
            Si necesitas una cita mayor a 2 horas, créala como dos bloques.
          </Text>
        </HStack>
      </VStack>
    </FormDrawer>
  );
};

export default AppointmentFormModal;
