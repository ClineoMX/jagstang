import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Portal,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Select,
  Text,
  Tooltip,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { FiChevronDown, FiPlus, FiTrash2 } from 'react-icons/fi';
import { RiSparkling2Line } from 'react-icons/ri';
import type { PatientVitals, VitalsLine } from '../hooks/usePatientVitals';
import type { BloodType } from '../types';
import VitalsBar from './VitalsBar';

const BLOOD_OPTIONS: BloodType[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];

interface ListEditorPopoverProps {
  barLabel?: string;
  title: string;
  emptyLabel: string;
  lines: VitalsLine[];
  addPlaceholder: string;
  saving: boolean;
  onAdd: (line: string) => Promise<void>;
  onRemove: (index: number) => Promise<void>;
}

const ListEditorPopover: React.FC<ListEditorPopoverProps> = ({
  barLabel,
  title,
  emptyLabel,
  lines,
  addPlaceholder,
  saving,
  onAdd,
  onRemove,
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const barLabelColor = useColorModeValue('paper.600', 'paper.500');

  const [line, setLine] = useState('');
  const [showAddField, setShowAddField] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showAddField) return;
    const id = requestAnimationFrame(() => addInputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [showAddField]);

  const resetAddUi = useCallback(() => {
    setShowAddField(false);
    setLine('');
  }, []);

  const handleAdd = async () => {
    try {
      await onAdd(line);
      setLine('');
      setShowAddField(false);
    } catch {
      toast({
        title: 'No se pudo guardar',
        description: 'Revisa la conexión o vuelve a intentar.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleRemove = async (index: number) => {
    try {
      await onRemove(index);
    } catch {
      toast({
        title: 'No se pudo eliminar',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Popover placement="bottom-start" strategy="fixed" onClose={resetAddUi}>
      <PopoverTrigger>
        <HStack
          as="button"
          type="button"
          spacing={1.5}
          align="center"
          cursor="pointer"
          minH="28px"
          disabled={saving}
          opacity={saving ? 0.6 : 1}
          _disabled={{ opacity: 0.6, cursor: 'not-allowed' }}
          color="text.strong"
          aria-label={barLabel ? `Abrir ${barLabel}` : `Abrir ${title}`}
        >
          {barLabel ? (
            <Text
              as="span"
              fontFamily="mono"
              fontSize="10.5px"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color={barLabelColor}
              fontWeight={500}
              userSelect="none"
              lineHeight="1.25"
              whiteSpace="nowrap"
            >
              {barLabel}
            </Text>
          ) : null}
          <Icon as={FiChevronDown} boxSize="14px" opacity={0.85} flexShrink={0} />
        </HStack>
      </PopoverTrigger>
      <Portal>
        <PopoverContent
          bg={cardBg}
          borderColor={borderColor}
          borderRadius="10px"
          boxShadow="0 12px 32px rgba(20,22,27,.16)"
          w="340px"
          _focusVisible={{ boxShadow: '0 12px 32px rgba(20,22,27,.16)' }}
        >
          <PopoverArrow bg={cardBg} />
          <PopoverBody pt={3} pb={showAddField ? 3 : 2} px={3}>
            <VStack align="stretch" spacing={showAddField ? 3 : 1}>
              {lines.length > 0 ? (
                <VStack align="stretch" spacing={1}>
                  {lines.map((item, idx) => (
                    <HStack
                      key={`${item.name}-${item.createdAt}-${idx}`}
                      justify="space-between"
                      gap={2}
                    >
                      <HStack spacing={1.5} align="flex-start" minW={0}>
                        {item.suggested ? (
                          <Tooltip
                            label="Sugerencia hecha a partir del expediente"
                            placement="top"
                            hasArrow
                            openDelay={200}
                          >
                            <Box as="span" display="inline-flex" mt="2px" flexShrink={0}>
                              <Icon as={RiSparkling2Line} boxSize="14px" color="brand.400" />
                            </Box>
                          </Tooltip>
                        ) : (
                          <Box as="span" w="14px" h="14px" mt="2px" flexShrink={0} />
                        )}
                        <Text fontSize="13px" fontWeight={500} noOfLines={2} minW={0}>
                          {item.name}
                        </Text>
                      </HStack>
                      <IconButton
                        aria-label="Quitar"
                        icon={<Icon as={FiTrash2} boxSize="14px" />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        isDisabled={saving}
                        onClick={() => void handleRemove(idx)}
                      />
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <Text fontSize="12px" color={labelColor} lineHeight="1.25" mb={0}>
                  {emptyLabel}
                </Text>
              )}

              {!showAddField ? (
                <HStack justify="flex-end" py={0} minH={0} spacing={0}>
                  <IconButton
                    aria-label="Añadir elemento"
                    icon={<Icon as={FiPlus} boxSize="14px" />}
                    size="xs"
                    variant="ghost"
                    minW="20px"
                    h="20px"
                    color="text.muted"
                    _hover={{ color: 'brand.600', bg: 'transparent' }}
                    isDisabled={saving}
                    onClick={() => setShowAddField(true)}
                  />
                </HStack>
              ) : (
                <FormControl>
                  <FormLabel fontSize="11px" color={labelColor} mb={1}>
                    Añadir
                  </FormLabel>
                  <InputGroup size="sm">
                    <Input
                      ref={addInputRef}
                      placeholder={addPlaceholder}
                      value={line}
                      isDisabled={saving}
                      onChange={(e) => setLine(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void handleAdd();
                        }
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          resetAddUi();
                        }
                      }}
                    />
                    <InputRightElement w="auto" pr={1}>
                      <IconButton
                        aria-label="Guardar"
                        icon={<Icon as={FiPlus} boxSize="14px" />}
                        size="xs"
                        colorScheme="brand"
                        variant="solid"
                        isLoading={saving}
                        onClick={() => void handleAdd()}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
              )}
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

interface BloodTypePopoverProps {
  barLabel?: string;
  selectedBlood: string;
  displayValue: string;
  saving: boolean;
  onSetBloodType: (bt: string | null) => Promise<void>;
}

const BloodTypePopover: React.FC<BloodTypePopoverProps> = ({
  barLabel,
  selectedBlood,
  displayValue,
  saving,
  onSetBloodType,
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const barLabelColor = useColorModeValue('paper.600', 'paper.500');
  const [bloodSelect, setBloodSelect] = useState('');

  const syncSelect = useCallback(() => {
    setBloodSelect(selectedBlood || '');
  }, [selectedBlood]);

  const toastSaveError = useCallback(() => {
    toast({
      title: 'No se pudo guardar',
      description: 'Revisa la conexión o vuelve a intentar.',
      status: 'error',
      duration: 4000,
      isClosable: true,
    });
  }, [toast]);

  const applyBlood = async () => {
    const val = bloodSelect.trim();
    try {
      await onSetBloodType(val === '' ? null : val);
      toast({ title: 'Tipo de sangre actualizado', status: 'success', duration: 2000 });
    } catch {
      toastSaveError();
    }
  };

  return (
    <Popover placement="bottom-start" strategy="fixed" onOpen={syncSelect}>
      <PopoverTrigger>
        <HStack
          as="button"
          type="button"
          spacing={2}
          align="center"
          cursor="pointer"
          minH="28px"
          disabled={saving}
          opacity={saving ? 0.6 : 1}
          _disabled={{ opacity: 0.6, cursor: 'not-allowed' }}
          aria-label={barLabel ? `Abrir ${barLabel}` : 'Abrir tipo de sangre'}
        >
          {barLabel ? (
            <Text
              as="span"
              fontFamily="mono"
              fontSize="10.5px"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color={barLabelColor}
              fontWeight={500}
              userSelect="none"
              lineHeight="1.25"
              whiteSpace="nowrap"
            >
              {barLabel}
            </Text>
          ) : null}
          <Text as="span" fontSize="13px" fontWeight={500} color="text.strong" lineHeight="1.25">
            {displayValue}
          </Text>
          <Icon as={FiChevronDown} boxSize="14px" opacity={0.85} flexShrink={0} />
        </HStack>
      </PopoverTrigger>
      <Portal>
        <PopoverContent
          bg={cardBg}
          borderColor={borderColor}
          borderRadius="10px"
          w="280px"
          boxShadow="0 12px 32px rgba(20,22,27,.16)"
        >
          <PopoverArrow bg={cardBg} />
          <PopoverBody pt={3} pb={3} px={3}>
            <VStack align="stretch" spacing={3}>
              <Select
                size="sm"
                value={bloodSelect}
                isDisabled={saving}
                onChange={(e) => setBloodSelect(e.target.value)}
              >
                <option value="">Sin especificar</option>
                {BLOOD_OPTIONS.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </Select>
              <Button size="sm" colorScheme="brand" isLoading={saving} onClick={() => void applyBlood()}>
                Guardar
              </Button>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

interface PatientClinicalVitalsBarProps {
  vitals: PatientVitals | null;
  patientBloodFallback?: string | null;
  saving: boolean;
  /** En fallos de GET vitals, no mostramos error inline (silencioso). */
  vitalsError?: string | null;
  onAddAllergy: (line: string) => Promise<void>;
  onRemoveAllergy: (index: number) => Promise<void>;
  onAddChronic: (line: string) => Promise<void>;
  onRemoveChronic: (index: number) => Promise<void>;
  onAddMedication: (line: string) => Promise<void>;
  onRemoveMedication: (index: number) => Promise<void>;
  onSetBloodType: (bt: string | null) => Promise<void>;
}

const PatientClinicalVitalsBar: React.FC<PatientClinicalVitalsBarProps> = ({
  vitals,
  patientBloodFallback,
  saving,
  onAddAllergy,
  onRemoveAllergy,
  onAddChronic,
  onRemoveChronic,
  onAddMedication,
  onRemoveMedication,
  onSetBloodType,
}) => {
  const v = vitals ?? {
    allergies: [],
    chronicConditions: [],
    medications: [],
    bloodType: null,
  };

  const bloodStored = v.bloodType || patientBloodFallback || '';
  const bloodDisplay = bloodStored.trim() !== '' ? bloodStored : '—';

  return (
    <Box mb="18px">
      <VitalsBar
        items={[
          {
            label: 'Alergias',
            mergeLabelIntoValue: true,
            value: (
              <ListEditorPopover
                title="Alergias"
                emptyLabel="Sin registrar"
                lines={v.allergies}
                saving={saving}
                addPlaceholder="Ej. Penicilina"
                onAdd={onAddAllergy}
                onRemove={onRemoveAllergy}
              />
            ),
          },
          {
            label: 'Condiciones crónicas',
            mergeLabelIntoValue: true,
            value: (
              <ListEditorPopover
                title="Condiciones crónicas"
                emptyLabel="Sin registrar"
                lines={v.chronicConditions}
                saving={saving}
                addPlaceholder="Ej. Hipertensión"
                onAdd={onAddChronic}
                onRemove={onRemoveChronic}
              />
            ),
          },
          {
            label: 'Medicamentos',
            mergeLabelIntoValue: true,
            value: (
              <ListEditorPopover
                title="Medicamentos actuales"
                emptyLabel="Sin registrar"
                lines={v.medications}
                saving={saving}
                addPlaceholder="Ej. Losartán 50 mg"
                onAdd={onAddMedication}
                onRemove={onRemoveMedication}
              />
            ),
          },
          {
            label: 'Tipo sangre',
            mergeLabelIntoValue: true,
            value: (
              <BloodTypePopover
                selectedBlood={bloodStored}
                displayValue={bloodDisplay}
                saving={saving}
                onSetBloodType={onSetBloodType}
              />
            ),
          },
        ]}
      />
    </Box>
  );
};

export default PatientClinicalVitalsBar;

