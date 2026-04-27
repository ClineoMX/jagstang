import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Avatar,
  Box,
  Button,
  Container,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useLocation, useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiCheckSquare,
  FiEdit3,
  FiFileText,
  FiHash,
  FiPlus,
  FiSearch,
  FiType,
} from 'react-icons/fi';

import PageHead from '../components/PageHead';
import StatusBadge from '../components/StatusBadge';
import FormNoteFiller from '../components/FormNoteFiller';
import type {
  FormFieldValue,
  FormNoteFillerHandle,
} from '../components/FormNoteFiller';

const FIELD_TYPE_ICONS: Record<string, React.ElementType> = {
  TEXT: FiType,
  NUMBER: FiHash,
  DATE: FiCalendar,
  CHECKBOX: FiCheckSquare,
  SIGNATURE: FiEdit3,
};
import { usePatient, usePatients } from '../hooks/usePatients';
import { usePatientVitals } from '../hooks/usePatientVitals';
import { useNotes } from '../hooks/useNotes';
import PatientClinicalSummary from '../components/PatientClinicalSummary';
import CollapsibleSideCard from '../components/CollapsibleSideCard';
import { apiService } from '../services/api';
import { normalizePatientSlug } from '../utils/patientSlug';

interface FormSummary {
  id: string;
  name: string;
}

const FormNoteForm: React.FC = () => {
  const { patientSlug, noteId } = useParams<{
    patientSlug: string;
    noteId?: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'paper.800');
  const paperBg = useColorModeValue('paper.100', 'whiteAlpha.50');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const softBorder = useColorModeValue('line.strong', 'whiteAlpha.300');
  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const subColor = useColorModeValue('paper.700', 'paper.400');
  const headingColor = useColorModeValue('ink.700', 'paper.50');
  const hoverBg = useColorModeValue('paper.50', 'whiteAlpha.50');
  const iconBg = useColorModeValue('brand.50', 'whiteAlpha.100');

  const { patients } = usePatients();
  const patientId = useMemo(() => {
    const raw = (patientSlug ?? '').trim().replace(/^#/, '');
    if (!raw) return undefined;
    const match = patients.find((p) => p.slug === raw || p.id === raw);
    if (match?.id) return match.id;
    const looksLikeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      raw
    );
    return looksLikeUuid ? raw : undefined;
  }, [patients, patientSlug]);

  const { patient, loading: patientLoading } = usePatient(patientId);
  const patientPathBase = useMemo(() => {
    const slug =
      normalizePatientSlug(patient?.slug) ||
      normalizePatientSlug(patientSlug) ||
      patientId;
    return slug ? `/patients/${slug}` : '/patients';
  }, [patient?.slug, patientSlug, patientId]);

  // Replace /patients/{id}/... with /patients/{slug}/... once slug is available.
  useEffect(() => {
    const slug = patient?.slug?.trim();
    const raw = (patientSlug ?? '').trim().replace(/^#/, '');
    if (!slug || !raw || raw === slug) return;
    if (location.pathname.startsWith(`/patients/${raw}`)) {
      navigate(location.pathname.replace(`/patients/${raw}`, `/patients/${slug}`), {
        replace: true,
        state: location.state,
      });
    }
  }, [location.pathname, location.state, navigate, patient?.slug, patientSlug]);
  const { vitals, loading: vitalsLoading } = usePatientVitals(patientId);
  const {
    notes,
    loading: notesLoading,
    createNote,
    updateNote,
    signNote,
  } = useNotes(patientId);

  const [forms, setForms] = useState<FormSummary[]>([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [formsError, setFormsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [formFieldValues, setFormFieldValues] = useState<FormFieldValue[]>([]);
  const [serializedContent, setSerializedContent] = useState('');

  const [currentNoteId, setCurrentNoteId] = useState<string | null>(
    noteId || null
  );
  const [noteStatus, setNoteStatus] = useState<'new' | 'draft' | 'signed'>(
    noteId ? 'draft' : 'new'
  );
  const [savedTitle, setSavedTitle] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [isLoadingNote, setIsLoadingNote] = useState(Boolean(noteId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const fillerRef = useRef<FormNoteFillerHandle | null>(null);

  const fieldHoverBg = useColorModeValue('paper.50', 'whiteAlpha.50');
  const fieldFilledBg = 'statusSoft.okBg';
  const fieldFilledBorder = 'statusSoft.okBorder';
  const reqBadgeBg = 'statusSoft.warnBg';
  const reqBadgeColor = 'statusSoft.warnFg';

  const {
    isOpen: isConfirmSignOpen,
    onOpen: onConfirmSignOpen,
    onClose: onConfirmSignClose,
  } = useDisclosure();

  // Load doctor's forms.
  useEffect(() => {
    let cancelled = false;
    setFormsLoading(true);
    setFormsError(null);
    apiService
      .listDoctorForms({ size: 100 })
      .then((res) => {
        if (!cancelled) setForms(res.results);
      })
      .catch(() => {
        if (!cancelled) {
          setFormsError('No se pudieron cargar los formularios.');
        }
      })
      .finally(() => {
        if (!cancelled) setFormsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load existing form note when editing.
  useEffect(() => {
    if (!noteId || !patientId) {
      setIsLoadingNote(false);
      return;
    }
    if (notesLoading) return;

    const note = notes.find((n) => n.id === noteId);
    if (!note) {
      setIsLoadingNote(false);
      return;
    }

    const rawContent = note.content || '';
    let restoredFormId: string | null = null;
    let restoredFields: FormFieldValue[] = [];

    try {
      const parsed = JSON.parse(rawContent);
      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        parsed.formId &&
        Array.isArray(parsed.fields)
      ) {
        restoredFormId = parsed.formId as string;
        restoredFields = parsed.fields as FormFieldValue[];
      } else if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed[0]?.name &&
        parsed[0]?.type
      ) {
        restoredFields = parsed as FormFieldValue[];
      }
    } catch {
      /* not a form note */
    }

    setTitle(note.title);
    setSavedTitle(note.title);
    setSavedContent(rawContent);
    setSerializedContent(rawContent);
    setFormFieldValues(restoredFields);
    if (restoredFormId) setSelectedFormId(restoredFormId);
    setCurrentNoteId(note.id);
    setNoteStatus(note.status);
    setIsLoadingNote(false);
  }, [noteId, patientId, notes, notesLoading]);

  const filteredForms = useMemo(() => {
    if (!searchQuery.trim()) return forms;
    const q = searchQuery.toLowerCase();
    return forms.filter((f) => f.name.toLowerCase().includes(q));
  }, [forms, searchQuery]);

  const handleSelectForm = (form: FormSummary) => {
    setSelectedFormId(form.id);
    if (!title) setTitle(form.name);
    setFormFieldValues([]);
    setSerializedContent('');
  };

  const handleChangeForm = () => {
    if (
      formFieldValues.some((f) => (f.value ?? '').trim() !== '') &&
      !window.confirm(
        '¿Cambiar de formulario? Se perderán los campos sin guardar.'
      )
    ) {
      return;
    }
    setSelectedFormId(null);
    setFormFieldValues([]);
    setSerializedContent('');
  };

  const handleFormValuesChange = useCallback(
    (vals: FormFieldValue[]) => {
      setFormFieldValues(vals);
      setSerializedContent(
        JSON.stringify({ formId: selectedFormId, fields: vals })
      );
    },
    [selectedFormId]
  );

  const hasChanges = () =>
    title !== savedTitle || serializedContent !== savedContent;

  const isDraft = noteStatus === 'draft';
  const canSignPrimary = isDraft && currentNoteId !== null && !hasChanges();

  const saveStateLabel = (() => {
    if (isSubmitting) return 'Guardando…';
    if (lastSavedAt) {
      const diff = Math.max(
        0,
        Math.floor((Date.now() - lastSavedAt.getTime()) / 1000)
      );
      return diff < 3 ? 'Guardado' : `Guardado hace ${diff}s`;
    }
    return 'Sin cambios';
  })();

  const handleSaveDraft = async (): Promise<boolean> => {
    if (!patientId) return false;
    if (!selectedFormId) {
      toast({
        title: 'Selecciona un formulario',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    const anyFilled = formFieldValues.some((f) => (f.value ?? '').trim() !== '');
    if (!anyFilled) {
      toast({
        title: 'Completa al menos un campo del formulario',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    setIsSubmitting(true);
    const payload = serializedContent ||
      JSON.stringify({ formId: selectedFormId, fields: formFieldValues });

    try {
      if (currentNoteId) {
        await updateNote(currentNoteId, {
          title,
          content: payload,
          type: 'document',
        });
      } else {
        const created = await createNote({
          content: payload,
          type: 'document',
          title: title || undefined,
        });
        setCurrentNoteId(created.id);
        if (created.title) setTitle(created.title);
      }
      setSavedTitle(title);
      setSavedContent(payload);
      setNoteStatus('draft');
      setLastSavedAt(new Date());
      toast({
        title: 'Borrador guardado',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Error al guardar',
        description: error?.message || 'No se pudo guardar el borrador.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignNote = async () => {
    if (!patientId) return;
    let noteIdToSign = currentNoteId;
    if (!noteIdToSign || hasChanges()) {
      const saved = await handleSaveDraft();
      if (!saved) return;
      noteIdToSign = currentNoteId;
    }
    onConfirmSignOpen();
  };

  const proceedWithSigning = async () => {
    if (!patientId || !currentNoteId) return;
    onConfirmSignClose();
    setIsSubmitting(true);
    try {
      await signNote(currentNoteId, true); // skipAnalysis: form notes are not analyzed
      toast({
        title: 'Nota firmada',
        description: 'La nota por formulario ha sido firmada exitosamente.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate(patientPathBase);
    } catch (error: any) {
      toast({
        title: 'Error al firmar',
        description: error?.message || 'No se pudo firmar la nota.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(patientPathBase);
  };

  if (patientLoading || (noteId && notesLoading) || isLoadingNote) {
    return (
      <Container maxW="1280px" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Cargando…</Text>
        </VStack>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container maxW="1280px" py={10}>
        <VStack spacing={4}>
          <Text fontSize="lg">Paciente no encontrado</Text>
          <Button onClick={() => navigate('/patients')}>
            Volver a pacientes
          </Button>
        </VStack>
      </Container>
    );
  }

  const selectedFormName =
    forms.find((f) => f.id === selectedFormId)?.name ?? '';

  const headerActions = (
    <>
      {selectedFormId && (
        <HStack
          spacing={2}
          fontFamily="mono"
          fontSize="11.5px"
          color="statusSoft.okFg"
          mr={2}
        >
          <Box w="6px" h="6px" borderRadius="full" bg="statusSoft.okFg" />
          <Text>{saveStateLabel}</Text>
        </HStack>
      )}
      {selectedFormId && (
        <Button
          size="sm"
          h="36px"
          colorScheme="brand"
          bg="brand.600"
          color="white"
          _hover={{ bg: 'brand.700' }}
          onClick={canSignPrimary ? handleSignNote : handleSaveDraft}
          isLoading={isSubmitting}
          loadingText={canSignPrimary ? 'Firmando…' : 'Guardando…'}
        >
          {canSignPrimary ? 'Firmar' : 'Guardar borrador'}
        </Button>
      )}
    </>
  );

  return (
    <Container maxW="1280px" px={{ base: 5, md: 10 }} pt={7} pb={14}>
      <PageHead
        crumbs={
          <>
            Pacientes · {patient.firstName} {patient.lastName}
            {' · '}
            {isDraft ? 'Editar nota por formulario' : 'Nueva nota por formulario'}
          </>
        }
        title={
          isDraft ? 'Editar nota por formulario' : 'Nueva nota por formulario'
        }
        sub={
          selectedFormId
            ? 'Completa los campos del formulario y firma cuando esté listo.'
            : 'Selecciona uno de tus formularios para comenzar.'
        }
        actions={headerActions}
      />

      {!selectedFormId ? (
        // ───── Picker view ────────────────────────────────────────────────
        <VStack align="stretch" spacing={5}>
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <InputGroup maxW="360px">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color={subColor} />
              </InputLeftElement>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar formulario…"
                bg={cardBg}
                borderColor={softBorder}
              />
            </InputGroup>
            <Button
              as={RouterLink}
              to="/library/forms/new"
              size="sm"
              h="36px"
              variant="outline"
              borderColor={softBorder}
              color="text.strong"
              leftIcon={<FiPlus />}
              _hover={{ borderColor: 'paper.600', bg: paperBg }}
            >
              Nuevo formulario
            </Button>
          </HStack>

          {formsLoading ? (
            <Box
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="8px"
              py={16}
            >
              <VStack spacing={3}>
                <Spinner size="lg" color="brand.500" thickness="3px" />
                <Text fontSize="sm" color={subColor}>
                  Cargando formularios…
                </Text>
              </VStack>
            </Box>
          ) : formsError ? (
            <Box
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="8px"
              p={6}
            >
              <Text color="statusSoft.critFg">{formsError}</Text>
            </Box>
          ) : forms.length === 0 ? (
            <Box
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="8px"
              p={10}
            >
              <VStack spacing={4}>
                <Icon as={FiFileText} boxSize={10} color={subColor} />
                <VStack spacing={1}>
                  <Text fontSize="15px" fontWeight={600} color={headingColor}>
                    Aún no tienes formularios
                  </Text>
                  <Text fontSize="13px" color={subColor} textAlign="center">
                    Crea un formulario en tu biblioteca para reutilizarlo en las
                    notas de tus pacientes.
                  </Text>
                </VStack>
                <Button
                  as={RouterLink}
                  to="/library/forms/new"
                  size="sm"
                  h="36px"
                  bg="brand.600"
                  color="white"
                  _hover={{ bg: 'brand.700' }}
                  leftIcon={<FiPlus />}
                >
                  Crear primer formulario
                </Button>
              </VStack>
            </Box>
          ) : filteredForms.length === 0 ? (
            <Box
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="8px"
              p={8}
            >
              <Text fontSize="13px" color={subColor} textAlign="center">
                No se encontraron formularios para «{searchQuery}».
              </Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
              {filteredForms.map((form) => (
                <Box
                  key={form.id}
                  as="button"
                  textAlign="left"
                  bg={cardBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="8px"
                  p={4}
                  transition="all .12s ease"
                  _hover={{
                    borderColor: 'brand.400',
                    bg: hoverBg,
                    transform: 'translateY(-1px)',
                  }}
                  onClick={() => handleSelectForm(form)}
                >
                  <HStack spacing={3} align="start">
                    <Box
                      bg={iconBg}
                      borderRadius="6px"
                      p="8px"
                      color="brand.600"
                      flexShrink={0}
                    >
                      <Icon as={FiFileText} boxSize={4} />
                    </Box>
                    <VStack align="start" spacing={1} minW={0} flex={1}>
                      <Text
                        fontSize="14px"
                        fontWeight={600}
                        color={headingColor}
                        noOfLines={2}
                      >
                        {form.name}
                      </Text>
                      <Text
                        fontSize="11px"
                        fontFamily="mono"
                        letterSpacing="0.06em"
                        textTransform="uppercase"
                        color={labelColor}
                      >
                        Formulario
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      ) : (
        // ───── Filler view ────────────────────────────────────────────────
        <Box
          display="grid"
          gridTemplateColumns={{ base: '1fr', lg: '1fr 340px' }}
          gap={5}
          alignItems="start"
        >
          <Box
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="8px"
            overflow="hidden"
          >
            <HStack
              justify="space-between"
              px="18px"
              py="12px"
              borderBottom="1px solid"
              borderColor={borderColor}
            >
              <HStack spacing={3} fontSize="12px" color={subColor}>
                <StatusBadge tone={isDraft ? 'draft' : 'info'}>
                  {isDraft ? 'Borrador' : 'Nueva'}
                </StatusBadge>
                <Box w="1px" h="14px" bg={softBorder} />
                <Text>
                  {patient.firstName} {patient.lastName}
                </Text>
              </HStack>
              <HStack spacing={2}>
                <HStack
                  spacing={2}
                  fontFamily="mono"
                  fontSize="11.5px"
                  color="statusSoft.okFg"
                >
                  <Box
                    w="6px"
                    h="6px"
                    borderRadius="full"
                    bg="statusSoft.okFg"
                  />
                  <Text>{saveStateLabel}</Text>
                </HStack>
              </HStack>
            </HStack>

            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la nota"
              variant="unstyled"
              px="24px"
              pt="18px"
              pb="4px"
              fontSize="22px"
              fontWeight={600}
              letterSpacing="-0.01em"
              _placeholder={{ color: 'paper.500' }}
            />

            <Box
              px="18px"
              py="8px"
              bg={paperBg}
              borderTop="1px solid"
              borderBottom="1px solid"
              borderColor={borderColor}
              fontSize="12px"
              color={subColor}
            >
              <HStack spacing={3} justify="space-between" flexWrap="wrap">
                <HStack spacing={3}>
                  <Text
                    fontFamily="mono"
                    letterSpacing="0.04em"
                    color={labelColor}
                  >
                    Formulario
                  </Text>
                  <Text fontWeight={500} noOfLines={1}>
                    {selectedFormName || '—'}
                  </Text>
                </HStack>
                <Button
                  variant="ghost"
                  size="xs"
                  leftIcon={<FiArrowLeft />}
                  color="text.body"
                  onClick={handleChangeForm}
                  isDisabled={isSubmitting}
                >
                  Cambiar
                </Button>
              </HStack>
            </Box>

            <Box px="16px" py="12px" minH="480px">
              <FormNoteFiller
                ref={fillerRef}
                formId={selectedFormId}
                initialValues={formFieldValues}
                onValuesChange={handleFormValuesChange}
                hideFieldsList
              />
            </Box>

            <HStack
              justify="flex-end"
              px="18px"
              py="12px"
              borderTop="1px solid"
              borderColor={borderColor}
              bg={paperBg}
            >
              <HStack spacing={2}>
                <Button
                  variant="ghost"
                  size="sm"
                  color="text.body"
                  onClick={handleCancel}
                  isDisabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  bg="brand.600"
                  color="white"
                  _hover={{ bg: 'brand.700' }}
                  onClick={canSignPrimary ? handleSignNote : handleSaveDraft}
                  isLoading={isSubmitting}
                  loadingText={canSignPrimary ? 'Firmando…' : 'Guardando…'}
                >
                  {canSignPrimary ? 'Firmar' : 'Guardar borrador'}
                </Button>
              </HStack>
            </HStack>
          </Box>

          {/* Side panel */}
          <VStack spacing="14px" align="stretch">
            <SideCard heading="Paciente">
              <HStack spacing={3} align="center">
                <Avatar
                  size="sm"
                  name={`${patient.firstName} ${patient.lastName}`}
                  src={patient.avatar}
                  bg="statusSoft.infoBg"
                  color="brand.700"
                />
                <VStack align="start" spacing={0}>
                  <Text fontSize="13.5px" fontWeight={500}>
                    {patient.firstName} {patient.lastName}
                  </Text>
                  {(() => {
                    const parts: string[] = [];
                    if (patient.dateOfBirth) {
                      parts.push(
                        `${Math.max(
                          0,
                          new Date().getFullYear() -
                            new Date(patient.dateOfBirth).getFullYear()
                        )} años`
                      );
                    }
                    if (patient.gender) {
                      parts.push(
                        patient.gender === 'male'
                          ? 'Hombre'
                          : patient.gender === 'female'
                            ? 'Mujer'
                            : 'Otro'
                      );
                    }
                    const meta = parts.filter(Boolean).join(' · ');
                    return meta ? (
                      <Text fontSize="12px" color={subColor} lineHeight="1.25" mt={0.5}>
                        {meta}
                      </Text>
                    ) : null;
                  })()}
                </VStack>
              </HStack>
            </SideCard>

            <CollapsibleSideCard heading="Resumen clínico" defaultOpen={false}>
              <PatientClinicalSummary
                vitals={vitals}
                bloodFallback={patient.bloodType}
                loading={vitalsLoading}
              />
            </CollapsibleSideCard>

            <SideCard heading="Formulario">
              <VStack align="stretch" spacing={3} fontSize="12.5px">
                <HStack justify="space-between">
                  <Text color={subColor}>Plantilla</Text>
                  <Text fontWeight={500} noOfLines={1} maxW="58%">
                    {selectedFormName || '—'}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color={subColor}>Campos completos</Text>
                  <Text fontWeight={500}>
                    {
                      formFieldValues.filter(
                        (f) => (f.value ?? '').trim() !== ''
                      ).length
                    }
                    /{formFieldValues.length || '—'}
                  </Text>
                </HStack>
                <Box>
                  <Button
                    variant="link"
                    size="xs"
                    color="brand.600"
                    leftIcon={<FiArrowLeft />}
                    onClick={handleChangeForm}
                    isDisabled={isSubmitting}
                    px={0}
                    h="auto"
                  >
                    Cambiar formulario
                  </Button>
                </Box>
              </VStack>
            </SideCard>

            {formFieldValues.length > 0 && (
              <SideCard heading="Campos del formulario">
                <Box
                  maxH={{ base: '42vh', lg: 'min(52vh, 440px)' }}
                  overflowY="auto"
                  mx={-2}
                  px={2}
                >
                  <List spacing={2}>
                    {formFieldValues.map((field, index) => {
                      const filled = (field.value ?? '').trim() !== '';
                      const FieldIcon =
                        FIELD_TYPE_ICONS[(field.type || 'TEXT').toUpperCase()] ??
                        FiType;
                      return (
                        <ListItem
                          key={`${field.name}-${index}`}
                          p="10px 12px"
                          borderWidth="1px"
                          borderColor={filled ? fieldFilledBorder : borderColor}
                          borderRadius="8px"
                          cursor="pointer"
                          bg={filled ? fieldFilledBg : cardBg}
                          _hover={{
                            bg: filled ? fieldFilledBg : fieldHoverBg,
                            borderColor: filled
                              ? fieldFilledBorder
                              : 'paper.400',
                          }}
                          transition="all .12s ease"
                          onClick={() => fillerRef.current?.openField(index)}
                        >
                          <HStack
                            justify="space-between"
                            align="start"
                            spacing={2}
                          >
                            <HStack
                              spacing={2.5}
                              align="start"
                              minW={0}
                              flex={1}
                            >
                              <Icon
                                as={FieldIcon}
                                color={filled ? 'statusSoft.okFg' : 'paper.500'}
                                boxSize={3.5}
                                mt="3px"
                              />
                              <Box minW={0}>
                                <Text
                                  fontSize="13px"
                                  fontWeight={500}
                                  color={headingColor}
                                  noOfLines={1}
                                >
                                  {field.name || 'Sin nombre'}
                                </Text>
                                {filled && (
                                  <Text
                                    fontSize="11.5px"
                                    color="statusSoft.okFg"
                                    noOfLines={1}
                                  >
                                    {field.value}
                                  </Text>
                                )}
                              </Box>
                            </HStack>
                            <HStack spacing={1.5} flexShrink={0}>
                              {!filled && field.required ? (
                                <Text
                                  as="span"
                                  fontSize="9px"
                                  fontWeight={700}
                                  letterSpacing="0.06em"
                                  textTransform="uppercase"
                                  px="6px"
                                  py="1px"
                                  borderRadius="full"
                                  bg={reqBadgeBg}
                                  color={reqBadgeColor}
                                >
                                  Requerido
                                </Text>
                              ) : null}
                              {filled && (
                                <Icon
                                  as={FiCheck}
                                  color="statusSoft.okFg"
                                  boxSize={3.5}
                                />
                              )}
                            </HStack>
                          </HStack>
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
              </SideCard>
            )}
          </VStack>
        </Box>
      )}

      {/* Confirm sign modal */}
      <Modal
        isOpen={isConfirmSignOpen}
        onClose={onConfirmSignClose}
        isCentered
      >
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(6px)" />
        <ModalContent
          bg={useColorModeValue('white', 'paper.800')}
          border="1px solid"
          borderColor={useColorModeValue('line.light', 'whiteAlpha.200')}
          borderRadius="10px"
          boxShadow="0 20px 60px -20px rgba(15, 23, 42, 0.25)"
          overflow="hidden"
        >
          <ModalCloseButton
            top="14px"
            right="14px"
            color="text.muted"
            _hover={{ color: 'text.strong', bg: 'surface.hover' }}
          />
          <ModalHeader
            px={7}
            pt={6}
            pb={4}
            borderBottom="1px solid"
            borderColor={useColorModeValue('line.light', 'whiteAlpha.200')}
          >
            <Box pr={8}>
              <Text
                as="span"
                fontFamily="mono"
                fontSize="11px"
                color={useColorModeValue('paper.600', 'paper.500')}
                letterSpacing="0.08em"
                textTransform="uppercase"
                fontWeight={500}
                display="inline-flex"
                alignItems="center"
                gap="8px"
              >
                <Box
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  bg="statusSoft.okFg"
                />
                Firma
              </Text>
              <Text
                mt={1.5}
                fontSize="18px"
                fontWeight={600}
                letterSpacing="-0.012em"
                color={useColorModeValue('paper.900', 'paper.50')}
              >
                Firmar nota por formulario
              </Text>
            </Box>
          </ModalHeader>
          <ModalBody px={7} py={5}>
            <Text fontSize="13.5px" color={subColor} lineHeight="1.55">
              Una vez firmada, la nota no podrá editarse. Esta acción es permanente e irreversible.
            </Text>
          </ModalBody>
          <ModalFooter px={7} pt={0} pb={6}>
            <HStack spacing={3} w="full" justify="flex-end">
              <Button
                variant="outline"
                borderColor="line.strong"
                _hover={{ borderColor: 'paper.600', bg: 'surface.hover' }}
                onClick={onConfirmSignClose}
                isDisabled={isSubmitting}
                h="36px"
                px={5}
                borderRadius="10px"
                fontWeight={600}
              >
                Cancelar
              </Button>
              <Button
                bg="brand.600"
                color="white"
                _hover={{ bg: 'brand.700' }}
                onClick={proceedWithSigning}
                isLoading={isSubmitting}
                loadingText="Firmando…"
                h="36px"
                px={6}
                borderRadius="10px"
                fontWeight={700}
              >
                Firmar
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

const SideCard: React.FC<{ heading: string; children: React.ReactNode }> = ({
  heading,
  children,
}) => {
  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const labelColor = useColorModeValue('paper.600', 'paper.500');
  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="8px"
      p="14px 16px"
    >
      <Text
        fontSize="11px"
        fontFamily="mono"
        letterSpacing="0.1em"
        textTransform="uppercase"
        color={labelColor}
        fontWeight={600}
        mb="10px"
      >
        {heading}
      </Text>
      {children}
    </Box>
  );
};

export default FormNoteForm;
