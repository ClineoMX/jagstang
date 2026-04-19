import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  FiArrowLeft,
  FiFileText,
  FiPlus,
  FiSearch,
} from 'react-icons/fi';

import PageHead from '../components/PageHead';
import StatusBadge from '../components/StatusBadge';
import FormNoteFiller from '../components/FormNoteFiller';
import type { FormFieldValue } from '../components/FormNoteFiller';
import { usePatient } from '../hooks/usePatients';
import { useNotes } from '../hooks/useNotes';
import { apiService } from '../services/api';

interface FormSummary {
  id: string;
  name: string;
}

const FormNoteForm: React.FC = () => {
  const { patientId, noteId } = useParams<{
    patientId: string;
    noteId?: string;
  }>();
  const navigate = useNavigate();
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

  const { patient, loading: patientLoading } = usePatient(patientId);
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
  const [fieldsListHost, setFieldsListHost] = useState<HTMLDivElement | null>(
    null
  );

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
      navigate(`/patients/${patientId}`);
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
    navigate(patientId ? `/patients/${patientId}` : '/patients');
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
              color="paper.800"
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
                  color="paper.700"
                  onClick={handleChangeForm}
                  isDisabled={isSubmitting}
                >
                  Cambiar
                </Button>
              </HStack>
            </Box>

            <Box px="16px" py="12px" minH="480px">
              <FormNoteFiller
                formId={selectedFormId}
                initialValues={formFieldValues}
                onValuesChange={handleFormValuesChange}
                fieldsListHost={fieldsListHost}
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
                  color="paper.700"
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
                  <Text fontSize="12px" color={subColor}>
                    {patient.dateOfBirth
                      ? `${Math.max(
                          0,
                          new Date().getFullYear() -
                            new Date(patient.dateOfBirth).getFullYear()
                        )} años`
                      : ''}
                    {patient.gender
                      ? ` · ${
                          patient.gender === 'male'
                            ? 'Hombre'
                            : patient.gender === 'female'
                              ? 'Mujer'
                              : 'Otro'
                        }`
                      : ''}
                  </Text>
                </VStack>
              </HStack>
            </SideCard>

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
                <Box
                  ref={setFieldsListHost}
                  maxH={{ base: '42vh', lg: 'min(52vh, 440px)' }}
                  minH="72px"
                  overflowY="auto"
                  mx={-2}
                  px={2}
                  pb={1}
                />
              </VStack>
            </SideCard>
          </VStack>
        </Box>
      )}

      {/* Confirm sign modal */}
      <Modal
        isOpen={isConfirmSignOpen}
        onClose={onConfirmSignClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Firmar nota por formulario</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color={subColor}>
              Una vez firmada, la nota no podrá editarse. ¿Deseas continuar?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onConfirmSignClose}
              isDisabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              bg="brand.600"
              color="white"
              _hover={{ bg: 'brand.700' }}
              onClick={proceedWithSigning}
              isLoading={isSubmitting}
            >
              Firmar
            </Button>
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
