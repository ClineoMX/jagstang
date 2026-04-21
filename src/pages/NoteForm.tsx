import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  HStack,
  VStack,
  Text,
  Button,
  Input,
  Select,
  IconButton,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Checkbox,
  Icon,
  Avatar,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { mockNoteTemplates, mockWellnessNoteTemplates } from '../data/mockData';
import RichTextEditor from '../components/RichTextEditor';
import FormNoteFiller from '../components/FormNoteFiller';
import type { FormFieldValue } from '../components/FormNoteFiller';
import type { NoteType, NoteCompletenessAnalysis } from '../types';
import { usePatient } from '../hooks/usePatients';
import { useNotes } from '../hooks/useNotes';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PageHead from '../components/PageHead';
import {
  mergeNoteBodyForEditor,
  serializeNoteBodyForApi,
  hasRecetaSection,
} from '../utils/noteReceta';

const NoteForm: React.FC = () => {
  const { patientId, noteId } = useParams<{
    patientId: string;
    noteId?: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { doctor } = useAuth();

  const cardBg = useColorModeValue('white', 'paper.800');
  const paperBg = useColorModeValue('paper.100', 'whiteAlpha.50');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const softBorder = useColorModeValue('line.strong', 'whiteAlpha.300');
  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const subColor = useColorModeValue('paper.700', 'paper.400');

  const { patient, loading: patientLoading } = usePatient(patientId);
  const {
    createNote,
    updateNote,
    signNote,
    getNoteAnalysis,
    notes,
    loading: notesLoading,
  } = useNotes(patientId);

  const [title, setTitle] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('evolution');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [completenessAnalysis, setCompletenessAnalysis] =
    useState<NoteCompletenessAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const [useFormMode, setUseFormMode] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [doctorForms, setDoctorForms] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [formFieldValues, setFormFieldValues] = useState<FormFieldValue[]>([]);

  const [savedTitle, setSavedTitle] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [savedType, setSavedType] = useState<NoteType>('evolution');
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(
    noteId || null
  );
  const [noteStatus, setNoteStatus] = useState<'new' | 'draft' | 'signed'>(
    'new'
  );

  const {
    isOpen: isSignModalOpen,
    onOpen: onSignModalOpen,
    onClose: onSignModalClose,
  } = useDisclosure();
  const {
    isOpen: isIncompleteWarningOpen,
    onOpen: onIncompleteWarningOpen,
    onClose: onIncompleteWarningClose,
  } = useDisclosure();
  const {
    isOpen: isConfirmSignOpen,
    onOpen: onConfirmSignOpen,
    onClose: onConfirmSignClose,
  } = useDisclosure();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const isLoadingAnalysisAfterSaveRef = useRef(false);
  const followUpLoadedRef = useRef(false);

  const role = (doctor?.role ?? '').toUpperCase();
  const isWellness = role === 'WELLNESS';
  const templatesForRole = isWellness
    ? mockWellnessNoteTemplates
    : mockNoteTemplates;

  const hasChanges = () => {
    if (useFormMode) return title !== savedTitle || content !== savedContent;
    return (
      title !== savedTitle || content !== savedContent || noteType !== savedType
    );
  };

  // Load existing note when editing
  useEffect(() => {
    if (!noteId || !patientId) {
      setIsLoadingNote(false);
      return;
    }
    if (notesLoading) return;

    setIsLoadingNote(true);
    const note = notes.find((n) => n.id === noteId);

    if (note) {
      const rawContent = note.content || '';
      let isFormNote = false;
      try {
        const parsed = JSON.parse(rawContent);
        if (
          parsed &&
          typeof parsed === 'object' &&
          !Array.isArray(parsed) &&
          parsed.formId &&
          Array.isArray(parsed.fields)
        ) {
          isFormNote = true;
        } else if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed[0].name &&
          parsed[0].type
        ) {
          isFormNote = true;
        }
      } catch {
        /* not JSON */
      }

      if (isFormNote) {
        // Las notas por formulario tienen su propio editor dedicado.
        // Redirigimos para que el usuario vea siempre la misma UI al editarlas.
        navigate(`/patients/${patientId}/notes/${note.id}/edit-form`, {
          replace: true,
        });
        return;
      }

      setContent(mergeNoteBodyForEditor(rawContent));

      setTitle(note.title);
      setNoteType(note.type);
      setSavedTitle(note.title);
      setSavedContent(mergeNoteBodyForEditor(rawContent));
      setSavedType(note.type);
      setCurrentNoteId(note.id);
      setNoteStatus(note.status);
      if (
        note.status === 'draft' &&
        note.id &&
        !isLoadingAnalysisAfterSaveRef.current &&
        !isFormNote
      ) {
        loadCompletenessAnalysis(note.id).catch((error) => {
          console.error('Error loading completeness analysis:', error);
        });
      }
      setIsLoadingNote(false);
    } else {
      setIsLoadingNote(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, notes, patientId, notesLoading]);

  // Follow-up from signed note
  useEffect(() => {
    const followUpNoteId = (
      location.state as { followUpFromNoteId?: string } | null
    )?.followUpFromNoteId;
    if (!patientId || !followUpNoteId || noteId) return;

    let cancelled = false;
    (async () => {
      setIsLoadingNote(true);
      try {
        const note = await apiService.getNote(patientId, followUpNoteId);
        if (cancelled) return;
        const rawContent = note.content || '';

        let isFormNote = false;
        let parsedFormValues: FormFieldValue[] = [];
        let restoredFormId: string | null = null;
        try {
          const parsed = JSON.parse(rawContent);
          if (
            parsed &&
            typeof parsed === 'object' &&
            !Array.isArray(parsed) &&
            parsed.formId &&
            Array.isArray(parsed.fields)
          ) {
            isFormNote = true;
            parsedFormValues = parsed.fields;
            restoredFormId = parsed.formId;
          }
        } catch {
          /* not JSON */
        }

        followUpLoadedRef.current = true;

        if (isFormNote) {
          // Las notas por formulario tienen su propio editor; el seguimiento
          // simplemente abre el selector de formularios para que el usuario
          // elija de nuevo (los valores de campos suelen requerir actualizarse).
          void parsedFormValues;
          void restoredFormId;
          navigate(`/patients/${patientId}/notes/new-form`, { replace: true });
          return;
        }

        setTitle(`Seguimiento - ${note.title || 'Nota anterior'}`);
        setNoteStatus('new');

        const noteTypeVal = (note.type || 'evolution') as NoteType;
        setContent(mergeNoteBodyForEditor(rawContent));
        setNoteType(noteTypeVal);

        navigate(`/patients/${patientId}/notes/new`, {
          replace: true,
          state: {},
        });
      } catch {
        if (!cancelled) {
          toast({
            title: 'Error',
            description: 'No se pudo cargar la nota para seguimiento',
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
        }
      } finally {
        if (!cancelled) setIsLoadingNote(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patientId, noteId, location.state, navigate, toast]);

  const loadCompletenessAnalysis = async (
    id: string,
    options?: { retryOn404?: boolean }
  ): Promise<void> => {
    if (!id) return;
    setIsLoadingAnalysis(true);
    setCompletenessAnalysis(null);
    const maxRetries = 15;
    const retryDelayMs = 2000;
    const tryFetch = async (): Promise<boolean> => {
      try {
        const analysis = await getNoteAnalysis(id);
        setCompletenessAnalysis(analysis);
        return true;
      } catch (error: unknown) {
        const status =
          error && typeof error === 'object' && 'status' in error
            ? (error as { status: number }).status
            : 0;
        if (status === 404 && options?.retryOn404) return false;
        setCompletenessAnalysis(null);
        return true;
      }
    };
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const done = await tryFetch();
      if (done) break;
      await new Promise((r) => setTimeout(r, retryDelayMs));
    }
    setIsLoadingAnalysis(false);
  };

  const loadCompletenessAnalysisWithContent = (
    id: string,
    retryOn404 = false
  ) => loadCompletenessAnalysis(id, { retryOn404 });

  useEffect(() => {
    if (noteStatus !== 'new' || followUpLoadedRef.current || useFormMode)
      return;
    const template = templatesForRole.find((t) => t.type === noteType);
    if (!template) return;
    const today = format(new Date(), "d 'de' MMM yyyy", { locale: es });
    setTitle(`${template.name} - ${today}`);
    setContent(template.content);
  }, [noteType, noteStatus, useFormMode, templatesForRole]);

  useEffect(() => {
    if (!isWellness) return;
    if (noteStatus !== 'new') return;
    if (useFormMode) return;
    if (
      noteType !== 'psychology-interrogation' &&
      noteType !== 'psychology-evolution'
    ) {
      setNoteType('psychology-evolution');
    }
  }, [isWellness, noteStatus, useFormMode, noteType]);

  useEffect(() => {
    if (location.state?.type && noteStatus === 'new') {
      setNoteType(location.state.type);
    }
  }, [location.state, noteStatus]);

  useEffect(() => {
    if (!useFormMode) return;
    let cancelled = false;
    setFormsLoading(true);
    apiService
      .listDoctorForms({ size: 100 })
      .then((res) => {
        if (!cancelled) setDoctorForms(res.results);
      })
      .catch(() => {
        if (!cancelled)
          toast({
            title: 'No se pudieron cargar los formularios',
            status: 'warning',
            duration: 3000,
          });
      })
      .finally(() => {
        if (!cancelled) setFormsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [useFormMode, toast]);

  const handleNoteTypeSelectChange = (value: string) => {
    if (value === 'form') {
      setUseFormMode(true);
      setNoteType('document');
      setContent('');
      setSelectedFormId(null);
      setFormFieldValues([]);
    } else {
      setUseFormMode(false);
      setSelectedFormId(null);
      setFormFieldValues([]);
      setNoteType(value as NoteType);
    }
  };

  const handleFormSelect = (formId: string) => {
    setSelectedFormId(formId);
    const form = doctorForms.find((f) => f.id === formId);
    if (form) setTitle(form.name);
    setFormFieldValues([]);
  };

  const handleFormValuesChange = useCallback(
    (vals: FormFieldValue[]) => {
      setFormFieldValues(vals);
      setContent(JSON.stringify({ formId: selectedFormId, fields: vals }));
    },
    [selectedFormId]
  );

  if (patientLoading || isLoadingNote || (noteId && notesLoading)) {
    return (
      <Container maxW="1280px" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Cargando...</Text>
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

  const handleRemoveFile = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    if (!patientId) return;

    if (useFormMode) {
      if (!selectedFormId) {
        toast({
          title: 'Selecciona un formulario',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      const anyFilled = formFieldValues.some((f) => f.value.trim() !== '');
      if (!anyFilled) {
        toast({
          title: 'Completa al menos un campo del formulario',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    } else if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'El contenido de la nota es requerido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    if (!useFormMode) {
      isLoadingAnalysisAfterSaveRef.current = true;
      setIsLoadingAnalysis(true);
      setCompletenessAnalysis(null);
    }
    const contentToSave = useFormMode
      ? content
      : serializeNoteBodyForApi(content);
    try {
      if (currentNoteId) {
        await updateNote(currentNoteId, {
          title,
          content: contentToSave,
          type: noteType,
        });
        setSavedTitle(title);
        setSavedContent(content);
        setSavedType(noteType);
        setNoteStatus('draft');
        setLastSavedAt(new Date());
        if (currentNoteId && !useFormMode) {
          await loadCompletenessAnalysisWithContent(currentNoteId, true);
        }
        toast({
          title: 'Borrador guardado',
          description: 'La nota se ha guardado como borrador',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const newNote = await createNote({
          content: contentToSave,
          type: noteType,
          title: title || undefined,
          files: attachments.length > 0 ? attachments : undefined,
        });
        setCurrentNoteId(newNote.id);
        setSavedTitle(newNote.title ?? title);
        setSavedContent(content);
        if (newNote.title) setTitle(newNote.title);
        setSavedType(noteType);
        setNoteStatus('draft');
        setLastSavedAt(new Date());
        if (newNote.id && !useFormMode) {
          await loadCompletenessAnalysisWithContent(newNote.id, true);
        }
        toast({
          title: 'Borrador guardado',
          description: 'La nota se ha guardado como borrador',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error al guardar la nota',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      isLoadingAnalysisAfterSaveRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleSignNote = async () => {
    if (!patientId || !currentNoteId) return;
    if (hasChanges()) await handleSaveDraft();
    if (completenessAnalysis && completenessAnalysis.completeness_score < 80) {
      onIncompleteWarningOpen();
      return;
    }
    onConfirmSignOpen();
  };

  const proceedWithSigning = async (save_anyway = false) => {
    if (!patientId || !currentNoteId) return;
    onConfirmSignClose();
    onIncompleteWarningClose();
    setIsSubmitting(true);
    const skipAnalysis = save_anyway || useFormMode;
    try {
      await signNote(currentNoteId, skipAnalysis);
      toast({
        title: 'Nota firmada',
        description: 'La nota médica ha sido firmada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      const shouldShowModal = !localStorage.getItem('dontShowSignModal');
      if (shouldShowModal) onSignModalOpen();
      else navigate(`/patients/${patientId}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error al firmar la nota',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSignModal = () => {
    if (dontShowAgain) localStorage.setItem('dontShowSignModal', 'true');
    onSignModalClose();
    navigate(`/patients/${patientId}`);
  };

  const getMissingFields = (): string[] => {
    if (!completenessAnalysis) return [];
    const missingKeys = completenessAnalysis.missing_fields ?? [];
    return missingKeys
      .map((key) => completenessAnalysis.reasoning[key])
      .filter(Boolean);
  };

  const isFieldMissing = (key: string): boolean =>
    (completenessAnalysis?.missing_fields ?? []).includes(key);

  const isDraft = noteStatus === 'draft';
  /** Borrador guardado y sin cambios locales → acción principal es Firmar; si no, Guardar borrador. */
  const canSignPrimary = isDraft && currentNoteId !== null && !hasChanges();
  const showAnalysisPanel = isDraft && currentNoteId !== null && !useFormMode;

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

  // Previous signed notes for this patient (for the "Notas anteriores" side card)
  const previousNotes = notes
    .filter((n) => n.id !== currentNoteId && n.status === 'signed')
    .slice(0, 2);

  return (
    <Container maxW="1280px" px={{ base: 5, md: 10 }} pt={7} pb={14}>
      <PageHead
        crumbs={
          <>
            Pacientes · {patient.firstName} {patient.lastName}
            {' · '}
            {isDraft ? 'Editar nota' : 'Nueva nota'}
          </>
        }
        title={isDraft ? 'Editar nota clínica' : 'Nueva nota clínica'}
        sub="Escribe primero, metadata después."
        actions={
          <>
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
          </>
        }
      />

      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', lg: '1fr 300px' }}
        gap={5}
        alignItems="start"
      >
        {/* Editor card */}
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="8px"
          overflow="hidden"
        >
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la nota"
            variant="unstyled"
            px="24px"
            pt="22px"
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
            <HStack spacing={4}>
              <Text fontFamily="mono" letterSpacing="0.04em" color={labelColor}>
                Tipo
              </Text>
              <Select
                value={useFormMode ? 'form' : noteType}
                onChange={(e) => handleNoteTypeSelectChange(e.target.value)}
                size="xs"
                w="auto"
                variant="outline"
                bg={cardBg}
                borderColor={softBorder}
                sx={{ fontFamily: 'inherit' }}
              >
                {isWellness ? (
                  <>
                    <option value="psychology-interrogation">
                      Historia Clínica Psicológica Inicial
                    </option>
                    <option value="psychology-evolution">
                      Nota de Sesión Psicológica
                    </option>
                  </>
                ) : (
                  <>
                    <option value="interrogation">Interrogatorio</option>
                    <option value="evolution">Nota de Evolución</option>
                    <option value="exploration">Exploración Física</option>
                  </>
                )}
              </Select>
              {useFormMode && (
                <>
                  <Box w="1px" h="14px" bg={softBorder} />
                  <Text
                    fontFamily="mono"
                    letterSpacing="0.04em"
                    color={labelColor}
                  >
                    Formulario
                  </Text>
                  <Select
                    value={selectedFormId ?? ''}
                    onChange={(e) => handleFormSelect(e.target.value)}
                    placeholder={formsLoading ? 'Cargando…' : 'Seleccionar'}
                    size="xs"
                    w="auto"
                    bg={cardBg}
                    borderColor={softBorder}
                    isDisabled={formsLoading}
                  >
                    {doctorForms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </Select>
                </>
              )}
            </HStack>
          </Box>

          <Box px="16px" py="8px" minH="480px">
            {useFormMode && selectedFormId ? (
              <FormNoteFiller
                formId={selectedFormId}
                initialValues={formFieldValues}
                onValuesChange={handleFormValuesChange}
              />
            ) : !useFormMode ? (
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Escribe el contenido de la nota médica..."
                minHeight="440px"
                onAttachFiles={(files) =>
                  setAttachments((prev) => [...prev, ...files])
                }
              />
            ) : (
              <Box p={6}>
                <Text color={subColor}>
                  Selecciona un formulario para comenzar.
                </Text>
              </Box>
            )}
          </Box>

          {!useFormMode && attachments.length > 0 && (
            <Box
              px="18px"
              pt="10px"
              pb="14px"
              borderTop="1px solid"
              borderColor={borderColor}
              bg={paperBg}
            >
              <Text
                fontSize="11px"
                fontFamily="mono"
                letterSpacing="0.08em"
                textTransform="uppercase"
                color={labelColor}
                mb={2}
              >
                Pendientes de guardar
              </Text>
              <Text fontSize="11.5px" color={subColor} mb={2}>
                Se subirán al guardar el borrador por primera vez. Añade más con
                el clip del editor.
              </Text>
              <VStack spacing={1} align="stretch">
                {attachments.map((file, index) => (
                  <HStack
                    key={`${file.name}-${index}`}
                    p={2}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="6px"
                    bg={cardBg}
                    justify="space-between"
                  >
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight={500}>
                        {file.name}
                      </Text>
                      <Text fontSize="xs" color={subColor}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </VStack>
                    <IconButton
                      aria-label="Eliminar archivo"
                      icon={<FiX />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleRemoveFile(index)}
                    />
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}

          <HStack
            justify="space-between"
            px="18px"
            py="12px"
            borderTop="1px solid"
            borderColor={borderColor}
            bg={paperBg}
          >
            <HStack
              spacing={3}
              fontFamily="mono"
              fontSize="12px"
              color={labelColor}
            >
              <HStack as="span" spacing={1}>
                <Kbd>Cmd</Kbd>
                <Text>+</Text>
                <Kbd>S</Kbd>
                <Text>guarda</Text>
              </HStack>
              <HStack as="span" spacing={1}>
                <Kbd>Cmd</Kbd>
                <Text>+</Text>
                <Kbd>Enter</Kbd>
                <Text>firma</Text>
              </HStack>
            </HStack>
            <HStack spacing={2}>
              <Button
                variant="ghost"
                size="sm"
                color="text.body"
                onClick={() => navigate(`/patients/${patientId}`)}
                isDisabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
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
            </HStack>
          </HStack>
        </Box>

        {/* Side panel — sticky en escritorio: acompaña el scroll del editor */}
        <VStack
          spacing="14px"
          align="stretch"
          position={{ base: 'static', lg: 'sticky' }}
          top={{ lg: '20px' }}
          alignSelf={{ lg: 'flex-start' }}
          maxH={{ lg: 'calc(100vh - 40px)' }}
          overflowY={{ lg: 'auto' }}
        >
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

          <SideCard heading="Configuración">
            <VStack align="stretch" spacing={2} fontSize="12.5px">
              <HStack justify="space-between">
                <Text color={subColor}>Tipo</Text>
                <Text fontWeight={500}>
                  {useFormMode
                    ? 'Formulario'
                    : noteType === 'interrogation'
                      ? 'Interrogatorio'
                      : noteType === 'evolution'
                        ? 'Evolución'
                        : noteType === 'exploration'
                          ? 'Exploración'
                          : noteType === 'psychology-interrogation'
                            ? 'HC Psicología'
                            : noteType === 'psychology-evolution'
                              ? 'Sesión Psicología'
                              : 'Documento'}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color={subColor}>Plantilla</Text>
                <Text fontWeight={500}>
                  {useFormMode ? '—' : 'Por defecto'}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color={subColor}>Receta adjunta</Text>
                <Text fontWeight={500}>
                  {hasRecetaSection(content) ? 'Sí' : 'No'}
                </Text>
              </HStack>
            </VStack>
          </SideCard>

          <SideCard heading="Integridad NOM‑004">
            {showAnalysisPanel ? (
              isLoadingAnalysis ? (
                <HStack spacing={2} fontSize="12.5px" color={subColor}>
                  <Spinner size="xs" />
                  <Text>Analizando…</Text>
                </HStack>
              ) : completenessAnalysis ? (
                <VStack align="stretch" spacing={2} fontSize="12.5px">
                  <HStack justify="space-between">
                    <Text color={subColor}>Completitud</Text>
                    <Text fontWeight={600} color="brand.600">
                      {completenessAnalysis.completeness_score}%
                    </Text>
                  </HStack>
                  <Box
                    h="4px"
                    bg="paper.200"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      h="100%"
                      w={`${completenessAnalysis.completeness_score}%`}
                      bg={
                        completenessAnalysis.completeness_score >= 90
                          ? 'statusSoft.okFg'
                          : completenessAnalysis.completeness_score >= 70
                            ? 'statusSoft.warnFg'
                            : 'statusSoft.critFg'
                      }
                    />
                  </Box>
                  {getMissingFields().length > 0 && (
                    <Box pt={2}>
                      <Text color={subColor} mb={1}>
                        Campos faltantes:
                      </Text>
                      <VStack align="stretch" spacing={1}>
                        {Object.entries(completenessAnalysis.reasoning)
                          .filter(([key]) => isFieldMissing(key))
                          .slice(0, 4)
                          .map(([key, value]) => (
                            <HStack key={key} spacing={2} align="start">
                              <Icon
                                as={FiAlertCircle}
                                color="statusSoft.warnFg"
                                mt="2px"
                              />
                              <Text fontSize="12px">
                                {value || key.replace(/_/g, ' ')}
                              </Text>
                            </HStack>
                          ))}
                      </VStack>
                    </Box>
                  )}
                  <Button
                    variant="link"
                    size="xs"
                    color="brand.600"
                    alignSelf="flex-start"
                    onClick={() =>
                      currentNoteId &&
                      loadCompletenessAnalysisWithContent(currentNoteId, false)
                    }
                  >
                    Analizar ahora →
                  </Button>
                </VStack>
              ) : (
                <Text fontSize="12.5px" color={subColor}>
                  Guarda el borrador para obtener el análisis.
                </Text>
              )
            ) : (
              <Text fontSize="12.5px" color={subColor}>
                El análisis se genera una vez guardada la nota como borrador.
              </Text>
            )}
          </SideCard>

          {previousNotes.length > 0 && (
            <SideCard heading="Notas anteriores">
              <VStack align="stretch" spacing={2}>
                {previousNotes.map((n) => (
                  <ChakraLink
                    key={n.id}
                    fontSize="12.5px"
                    color="text.strong"
                    _hover={{ color: 'brand.600', textDecoration: 'underline' }}
                    onClick={() =>
                      navigate(`/patients/${patientId}`, {
                        state: { highlightNote: n.id },
                      })
                    }
                  >
                    <Text fontWeight={500} noOfLines={1}>
                      {n.title}
                    </Text>
                    <Text fontSize="11.5px" color={subColor}>
                      {format(new Date(n.createdAt), 'd MMM yyyy', {
                        locale: es,
                      })}
                    </Text>
                  </ChakraLink>
                ))}
              </VStack>
            </SideCard>
          )}
        </VStack>
      </Box>

      {/* Confirm sign modal */}
      <Modal isOpen={isConfirmSignOpen} onClose={onConfirmSignClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <Box color="brand.600">
                <FiCheckCircle size={20} />
              </Box>
              <Text>Confirmar firma</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>
                Una vez firmada, la nota no podrá ser modificada. Esta acción es
                permanente e irreversible.
              </Text>
              <Text fontWeight="medium">
                ¿Deseas continuar con la firma de la nota?
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="outline"
                onClick={onConfirmSignClose}
                isDisabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                colorScheme="brand"
                bg="brand.600"
                onClick={() => proceedWithSigning(false)}
                isLoading={isSubmitting}
                loadingText="Firmando..."
              >
                Continuar
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isIncompleteWarningOpen}
        onClose={onIncompleteWarningClose}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <Box color="statusSoft.warnFg">
                <FiAlertCircle size={20} />
              </Box>
              <Text>Nota Incompleta</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="warning" borderRadius="lg">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <AlertTitle>Advertencia</AlertTitle>
                  <AlertDescription fontSize="sm">
                    La nota tiene una completitud del{' '}
                    {completenessAnalysis?.completeness_score || 0}%, que está
                    por debajo del 70% recomendado.
                  </AlertDescription>
                </VStack>
              </Alert>
              <Text>
                La nota no parece estar completa. ¿Seguro que deseas firmar?
              </Text>
              {completenessAnalysis && getMissingFields().length > 0 && (
                <Box>
                  <Text fontWeight="semibold" mb={2} fontSize="sm">
                    Campos faltantes:
                  </Text>
                  <Text fontSize="sm" color={subColor}>
                    {getMissingFields().join(', ')}
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="outline"
                colorScheme="orange"
                onClick={() => proceedWithSigning(true)}
                isLoading={isSubmitting}
                loadingText="Firmando..."
              >
                Firmar de todos modos
              </Button>
              <Button
                colorScheme="brand"
                bg="brand.600"
                onClick={onIncompleteWarningClose}
                isDisabled={isSubmitting}
                size="lg"
              >
                Seguir Editando
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isSignModalOpen} onClose={handleCloseSignModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <Box color="statusSoft.okFg">
                <FiCheckCircle size={20} />
              </Box>
              <Text>Nota Firmada Exitosamente</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <AlertTitle>Importante</AlertTitle>
                  <AlertDescription fontSize="sm">
                    Una vez firmada, la nota no podrá ser modificada. Esta
                    acción es permanente e irreversible.
                  </AlertDescription>
                </VStack>
              </Alert>
              <Text>
                La nota médica ha sido firmada digitalmente y guardada en el
                expediente del paciente.
              </Text>
              <Checkbox
                isChecked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              >
                No mostrarme este mensaje de nuevo
              </Checkbox>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="brand"
              bg="brand.600"
              onClick={handleCloseSignModal}
            >
              Continuar
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

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.strong', 'whiteAlpha.300');
  return (
    <Box
      as="kbd"
      fontFamily="mono"
      fontSize="11px"
      px="6px"
      py="1px"
      borderWidth="1px"
      borderColor={borderColor}
      borderBottomWidth="2px"
      borderRadius="4px"
      bg={cardBg}
      color="text.strong"
    >
      {children}
    </Box>
  );
};

export default NoteForm;
