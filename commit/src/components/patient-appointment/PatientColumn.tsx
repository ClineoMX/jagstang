import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiSearch, FiUser, FiX, FiInfo } from 'react-icons/fi';
import type { Patient } from '../../types';
import PhoneNumberField from '../PhoneNumberField';
import PatientSearchRow, {
  patientFullName,
  normalizePatientSearch,
} from './PatientSearchRow';
import { FIELD_LABEL_STYLES, INPUT_STYLES } from './styles';
import type { DrawerFormState, PatientMode } from './types';

function hasHomonyms(results: Patient[]): boolean {
  const fl: Record<string, number> = {};
  const full: Record<string, number> = {};
  for (const p of results) {
    const k = normalizePatientSearch(
      `${p.firstName}${p.lastName}${p.lastNameMaternal ?? ''}`
    );
    full[k] = (full[k] ?? 0) + 1;
    if (full[k] > 1) return true;
    const flKey = normalizePatientSearch(`${p.firstName}${p.lastName}`);
    fl[flKey] = (fl[flKey] ?? 0) + 1;
    if (fl[flKey] > 1) return true;
  }
  return false;
}

interface PatientColumnProps {
  state: DrawerFormState;
  patients: Patient[];
  loadingPatients: boolean;
  hasPatient: boolean;
  lockPatient?: boolean;
  /** Show X to return from new-patient form to the patient search (agenda flow). */
  allowBackToSearch?: boolean;
  onBackToSearch?: () => void;
  onModeChange: (mode: PatientMode) => void;
  onSelectPatient: (id: string | null) => void;
  onDraftChange: (patch: Partial<DrawerFormState['draft']>) => void;
}

const PatientColumn: React.FC<PatientColumnProps> = ({
  state,
  patients,
  loadingPatients,
  lockPatient,
  allowBackToSearch,
  onBackToSearch,
  onModeChange,
  onSelectPatient,
  onDraftChange,
}) => {
  const { patientMode, selectedPatientId, draft } = state;
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [backTipOpen, setBackTipOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const dropdownBg = useColorModeValue('white', 'paper.800');
  const dropdownBorder = useColorModeValue('line.strong', 'whiteAlpha.300');
  const calloutBg = useColorModeValue('brand.50', 'whiteAlpha.100');
  const calloutBorder = useColorModeValue('brand.200', 'brand.800');
  const chipBg = useColorModeValue('paper.100', 'whiteAlpha.100');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) ?? null,
    [patients, selectedPatientId]
  );

  const results = useMemo(() => {
    const q = query.trim();
    const nq = normalizePatientSearch(q);
    if (!nq) return patients.slice(0, 8);
    const digits = q.replace(/\D/g, '');
    return patients.filter((p) => {
      const name = normalizePatientSearch(patientFullName(p));
      if (name.includes(nq)) return true;
      if (digits.length >= 3 && p.phone?.replace(/\D/g, '').includes(digits)) {
        return true;
      }
      return false;
    });
  }, [patients, query]);

  const showDupes = dropdownOpen && hasHomonyms(results);

  useEffect(() => {
    if (patientMode === 'search') {
      setDropdownOpen(false);
    }
  }, [patientMode]);

  useEffect(() => {
    const onDoc = (ev: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(ev.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (lockPatient && selectedPatient) {
    return (
      <VStack align="stretch" spacing={4} h="full">
        <SelectedChip
          patient={selectedPatient}
          chipBg={chipBg}
          borderColor={borderColor}
          onClear={() => {}}
          locked
        />
      </VStack>
    );
  }

  return (
    <VStack align="stretch" spacing={4} h="full" overflow="hidden">
      <Box flex={1} minH={0} overflowY="auto">
        {patientMode === 'search' ? (
          selectedPatient ? (
            <SelectedChip
              patient={selectedPatient}
              chipBg={chipBg}
              borderColor={borderColor}
              onClear={() => onSelectPatient(null)}
            />
          ) : (
            <VStack align="stretch" spacing={3}>
            <Box ref={wrapRef} position="relative">
              {showDupes && (
                <Alert status="warning" size="sm" mb={3} borderRadius="6px">
                  <AlertIcon />
                  <Text fontSize="12px">
                    Hay pacientes con nombres similares. Revisa edad, teléfono y
                    última visita antes de elegir.
                  </Text>
                </Alert>
              )}
              <FormControl>
                <FormLabel {...FIELD_LABEL_STYLES} color={labelColor}>
                  Buscar paciente
                </FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" h="36px">
                    <Icon as={FiSearch} color={labelColor} boxSize={4} />
                  </InputLeftElement>
                  <Input
                    {...INPUT_STYLES}
                    pl={10}
                    value={query}
                    placeholder={
                      loadingPatients
                        ? 'Cargando pacientes…'
                        : 'Nombre o teléfono (3+ dígitos)…'
                    }
                    isDisabled={loadingPatients}
                    onMouseDown={() => setDropdownOpen(true)}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setDropdownOpen(true);
                    }}
                  />
                </InputGroup>
              </FormControl>
              {dropdownOpen && !loadingPatients && (
                <Box
                  position="absolute"
                  top="100%"
                  left={0}
                  right={0}
                  mt={1}
                  maxH="280px"
                  overflowY="auto"
                  bg={dropdownBg}
                  border="1px solid"
                  borderColor={dropdownBorder}
                  borderRadius="6px"
                  boxShadow="0 4px 12px rgba(20,22,27,.08)"
                  zIndex={10}
                >
                  {results.map((p) => (
                    <PatientSearchRow
                      key={p.id}
                      patient={p}
                      query={query}
                      onClick={() => {
                        onSelectPatient(p.id);
                        setQuery('');
                        setDropdownOpen(false);
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
            <HStack spacing={3} color="text.muted" px={1}>
              <Box flex={1} h="1px" bg={borderColor} />
              <Text fontSize="11px" textTransform="uppercase" letterSpacing="0.06em">
                o
              </Text>
              <Box flex={1} h="1px" bg={borderColor} />
            </HStack>
            <Button
              variant="ghost"
              size="sm"
              justifyContent="flex-start"
              leftIcon={<Icon as={FiUser} boxSize={4} />}
              color="brand.600"
              onClick={() => onModeChange('new')}
            >
              Nuevo paciente
            </Button>
            </VStack>
          )
        ) : (
          <VStack align="stretch" spacing={4}>
            {allowBackToSearch && onBackToSearch && (
              <HStack justify="flex-end" mb={-1}>
                <Tooltip
                  isOpen={backTipOpen}
                  label="Cancelar creación de paciente"
                  placement="left"
                  hasArrow
                  openDelay={200}
                >
                  <Box
                    as="span"
                    display="inline-flex"
                    onMouseEnter={() => setBackTipOpen(true)}
                    onMouseLeave={() => setBackTipOpen(false)}
                  >
                    <IconButton
                      aria-label="Cancelar creación de paciente"
                      icon={<Icon as={FiX} boxSize={4} />}
                      size="sm"
                      variant="ghost"
                      color="text.muted"
                      _hover={{ color: 'text.strong', bg: 'surface.hover' }}
                      onClick={onBackToSearch}
                    />
                  </Box>
                </Tooltip>
              </HStack>
            )}
            <HStack
              p={3}
              borderRadius="6px"
              bg={calloutBg}
              border="1px solid"
              borderColor={calloutBorder}
              align="flex-start"
              spacing={2}
            >
              <Icon as={FiInfo} color="brand.600" mt={0.5} flexShrink={0} />
              <Text fontSize="12px" color={labelColor} lineHeight={1.5}>
                Captura lo esencial ahora; el expediente completo puede llenarse
                después.
              </Text>
            </HStack>
            <FormControl isRequired>
              <FormLabel {...FIELD_LABEL_STYLES} color={labelColor}>
                Nombre(s)
              </FormLabel>
              <Input
                {...INPUT_STYLES}
                value={draft.firstName}
                placeholder="Ej. Juan Carlos"
                onChange={(e) =>
                  onDraftChange({ firstName: e.target.value })
                }
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...FIELD_LABEL_STYLES} color={labelColor}>
                Apellido paterno
              </FormLabel>
              <Input
                {...INPUT_STYLES}
                value={draft.lastName}
                placeholder="Ej. Pérez"
                onChange={(e) => onDraftChange({ lastName: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel {...FIELD_LABEL_STYLES} color={labelColor}>
                Apellido materno
              </FormLabel>
              <Input
                {...INPUT_STYLES}
                value={draft.lastNameMaternal}
                placeholder="Ej. Hernández"
                onChange={(e) =>
                  onDraftChange({ lastNameMaternal: e.target.value })
                }
              />
            </FormControl>
            <PhoneNumberField
              value={draft.phone}
              onChange={(phone) => onDraftChange({ phone })}
            />
          </VStack>
        )}
      </Box>
    </VStack>
  );
};

function SelectedChip({
  patient,
  chipBg,
  borderColor,
  onClear,
  locked,
}: {
  patient: Patient;
  chipBg: string;
  borderColor: string;
  onClear: () => void;
  locked?: boolean;
}) {
  return (
    <HStack
      p={3}
      borderRadius="8px"
      bg={chipBg}
      border="1px solid"
      borderColor={borderColor}
      justify="space-between"
    >
      <Box>
        <Text fontSize="14px" fontWeight={600} color="text.strong">
          {patientFullName(patient)}
        </Text>
        {patient.phone && (
          <Text fontSize="12px" color="text.muted" mt={0.5}>
            {patient.phone}
          </Text>
        )}
      </Box>
      {!locked && (
        <Button
          size="xs"
          variant="ghost"
          aria-label="Cambiar paciente"
          onClick={onClear}
        >
          <Icon as={FiX} />
        </Button>
      )}
    </HStack>
  );
}

export default PatientColumn;
