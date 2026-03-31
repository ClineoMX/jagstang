import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  HStack,
  VStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  IconButton,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  useColorModeValue,
  Spinner,
  SimpleGrid,
  Progress,
  List,
  ListItem,
  ListIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Checkbox,
  Divider,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { FiUpload, FiX, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiEdit } from 'react-icons/fi';
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

const RECETA_DELIMITER = '<!-- ___RECETA___ -->';

const NoteForm: React.FC = () => {
  const { patientId, noteId } = useParams<{ patientId: string; noteId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { doctor } = useAuth();

  const cardBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Usar hook para cargar paciente y notas
  const { patient, loading: patientLoading } = usePatient(patientId);
  const { createNote, updateNote, signNote, getNoteAnalysis, notes, loading: notesLoading } = useNotes(patientId);

  const [title, setTitle] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('evolution');
  const [content, setContent] = useState('');
  const [receta, setReceta] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [completenessAnalysis, setCompletenessAnalysis] = useState<NoteCompletenessAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // Form-based note mode
  const [useFormMode, setUseFormMode] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [doctorForms, setDoctorForms] = useState<Array<{ id: string; name: string }>>([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [formFieldValues, setFormFieldValues] = useState<FormFieldValue[]>([]);
  
  // Estados para detectar cambios
  const [savedTitle, setSavedTitle] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [, setSavedReceta] = useState('');
  const [savedType, setSavedType] = useState<NoteType>('evolution');
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(noteId || null);
  const [noteStatus, setNoteStatus] = useState<'new' | 'draft' | 'signed'>('new');
  
  // Modal states
  const { isOpen: isSignModalOpen, onOpen: onSignModalOpen, onClose: onSignModalClose } = useDisclosure();
  const { isOpen: isIncompleteWarningOpen, onOpen: onIncompleteWarningOpen, onClose: onIncompleteWarningClose } = useDisclosure();
  const { isOpen: isConfirmSignOpen, onOpen: onConfirmSignOpen, onClose: onConfirmSignClose } = useDisclosure();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Refs para comparar cambios
  const isLoadingAnalysisAfterSaveRef = useRef(false);
  const followUpLoadedRef = useRef(false);

  const role = (doctor?.role ?? '').toUpperCase();
  const isWellness = role === 'WELLNESS';
  const templatesForRole = isWellness ? mockWellnessNoteTemplates : mockNoteTemplates;

  // Detectar si hay cambios
  const hasChanges = () => {
    if (useFormMode) {
      return title !== savedTitle || content !== savedContent;
    }
    return (
      title !== savedTitle ||
      content !== savedContent ||
      noteType !== savedType
    );
  };

  // Cargar nota existente si es edición
  useEffect(() => {
    if (!noteId || !patientId) {
      setIsLoadingNote(false);
      return;
    }

    // Si las notas aún se están cargando, esperar
    if (notesLoading) {
      return;
    }

    setIsLoadingNote(true);
    const note = notes.find((n) => n.id === noteId);
    
    if (note) {
      const rawContent = note.content || '';

      // Detectar si es una nota basada en formulario (content es JSON con formId + fields)
      let isFormNote = false;
      let parsedFormValues: FormFieldValue[] = [];
      let restoredFormId: string | null = null;
      try {
        const parsed = JSON.parse(rawContent);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.formId && Array.isArray(parsed.fields)) {
          isFormNote = true;
          parsedFormValues = parsed.fields;
          restoredFormId = parsed.formId;
        } else if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name && parsed[0].type) {
          isFormNote = true;
          parsedFormValues = parsed;
        }
      } catch { /* not JSON */ }

      if (isFormNote) {
        setUseFormMode(true);
        setContent(rawContent);
        setFormFieldValues(parsedFormValues);
        if (restoredFormId) setSelectedFormId(restoredFormId);
      } else {
        const recetaIdx = rawContent.indexOf(RECETA_DELIMITER);
        const mainContent = recetaIdx >= 0 ? rawContent.slice(0, recetaIdx).trim() : rawContent;
        const recetaContent = recetaIdx >= 0 ? rawContent.slice(recetaIdx + RECETA_DELIMITER.length).trim() : '';
        setContent(mainContent);
        setReceta(recetaContent);
      }

      setTitle(note.title);
      setNoteType(isFormNote ? 'document' : note.type);
      setSavedTitle(note.title);
      setSavedContent(isFormNote ? rawContent : (rawContent.indexOf(RECETA_DELIMITER) >= 0 ? rawContent.slice(0, rawContent.indexOf(RECETA_DELIMITER)).trim() : rawContent));
      setSavedReceta(isFormNote ? '' : (rawContent.indexOf(RECETA_DELIMITER) >= 0 ? rawContent.slice(rawContent.indexOf(RECETA_DELIMITER) + RECETA_DELIMITER.length).trim() : ''));
      setSavedType(isFormNote ? 'document' : note.type);
      setCurrentNoteId(note.id);
      setNoteStatus(note.status);
      
      // Si es draft, cargar análisis (omitir si estamos recargando tras guardar o si es nota de formulario)
      if (note.status === 'draft' && note.id && !isLoadingAnalysisAfterSaveRef.current && !isFormNote) {
        loadCompletenessAnalysis(note.id).catch((error) => {
          console.error('Error loading completeness analysis:', error);
        });
      }
      setIsLoadingNote(false);
    } else {
      // Nota no encontrada
      setIsLoadingNote(false);
    }
  }, [noteId, notes, patientId, notesLoading]);

  // Cargar última nota del paciente como plantilla para "Seguimiento" (notas firmadas)
  useEffect(() => {
    const followUpNoteId = (location.state as { followUpFromNoteId?: string } | null)?.followUpFromNoteId;
    if (!patientId || !followUpNoteId || noteId) return;

    let cancelled = false;
    (async () => {
      setIsLoadingNote(true);
      try {
        const note = await apiService.getNote(patientId, followUpNoteId);
        if (cancelled) return;
        const rawContent = note.content || '';

        // Detectar si es nota basada en formulario
        let isFormNote = false;
        let parsedFormValues: FormFieldValue[] = [];
        let restoredFormId: string | null = null;
        try {
          const parsed = JSON.parse(rawContent);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.formId && Array.isArray(parsed.fields)) {
            isFormNote = true;
            parsedFormValues = parsed.fields;
            restoredFormId = parsed.formId;
          }
        } catch { /* not JSON */ }

        followUpLoadedRef.current = true;
        setTitle(`Seguimiento - ${note.title || 'Nota anterior'}`);
        setNoteStatus('new');

        if (isFormNote) {
          setUseFormMode(true);
          setNoteType('document');
          setContent(rawContent);
          setFormFieldValues(parsedFormValues);
          if (restoredFormId) setSelectedFormId(restoredFormId);
        } else {
          const recetaIdx = rawContent.indexOf(RECETA_DELIMITER);
          const mainContent = recetaIdx >= 0 ? rawContent.slice(0, recetaIdx).trim() : rawContent;
          const recetaContent = recetaIdx >= 0 ? rawContent.slice(recetaIdx + RECETA_DELIMITER.length).trim() : '';
          const noteTypeVal = (note.type || 'evolution') as NoteType;
          setContent(mainContent);
          setReceta(recetaContent);
          setNoteType(noteTypeVal);
        }

        // Limpiar state para no re-aplicar al cambiar de tipo
        navigate(`/patients/${patientId}/notes/new`, { replace: true, state: {} });
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

  // Cargar análisis de completitud. Si retryOn404, reintenta hasta que el análisis esté listo (tras actualizar nota)
  const loadCompletenessAnalysis = async (
    id: string,
    options?: { retryOn404?: boolean }
  ): Promise<void> => {
    if (!id) {
      console.warn('loadCompletenessAnalysis: No ID provided');
      return;
    }

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
        const status = error && typeof error === 'object' && 'status' in error ? (error as { status: number }).status : 0;
        if (status === 404 && options?.retryOn404) {
          return false; // Retry
        }
        setCompletenessAnalysis(null);
        return true; // Done, no more retries
      }
    };

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const done = await tryFetch();
      if (done) break;
      await new Promise((r) => setTimeout(r, retryDelayMs));
    }

    setIsLoadingAnalysis(false);
  };

  const loadCompletenessAnalysisWithContent = (id: string, retryOn404 = false) =>
    loadCompletenessAnalysis(id, { retryOn404 });

  // Load template when note type changes (solo si es nota nueva, no Seguimiento, y no modo formulario)
  useEffect(() => {
    if (noteStatus !== 'new' || followUpLoadedRef.current || useFormMode) return;
    const template = templatesForRole.find((t) => t.type === noteType);
    if (!template) return;
    const today = format(new Date(), "d 'de' MMM yyyy", { locale: es });
    setTitle(`${template.name} - ${today}`);
    setContent(template.content);
  }, [noteType, noteStatus, useFormMode, templatesForRole]);

  // Ensure default type fits role
  useEffect(() => {
    if (!isWellness) return;
    if (noteStatus !== 'new') return;
    if (useFormMode) return;
    // If current noteType isn't available for WELLNESS, force a valid default.
    if (noteType !== 'psychology-interrogation' && noteType !== 'psychology-evolution') {
      setNoteType('psychology-evolution');
    }
  }, [isWellness, noteStatus, useFormMode, noteType]);

  // Set initial note type from location state
  useEffect(() => {
    if (location.state?.type && noteStatus === 'new') {
      setNoteType(location.state.type);
    }
  }, [location.state, noteStatus]);

  // Load doctor forms when form mode is activated
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
        if (!cancelled) {
          toast({ title: 'No se pudieron cargar los formularios', status: 'warning', duration: 3000 });
        }
      })
      .finally(() => {
        if (!cancelled) setFormsLoading(false);
      });
    return () => { cancelled = true; };
  }, [useFormMode, toast]);

  const handleNoteTypeSelectChange = (value: string) => {
    if (value === 'form') {
      setUseFormMode(true);
      setNoteType('document');
      setContent('');
      setReceta('');
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

  const handleFormValuesChange = useCallback((vals: FormFieldValue[]) => {
    setFormFieldValues(vals);
    setContent(JSON.stringify({ formId: selectedFormId, fields: vals }));
  }, [selectedFormId]);

  // No actualizar análisis automáticamente mientras se edita
  // Solo se actualiza cuando se guarda como borrador

  if (patientLoading || isLoadingNote || (noteId && notesLoading)) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Cargando...</Text>
        </VStack>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Text fontSize="lg">Paciente no encontrado</Text>
          <Button onClick={() => navigate('/patients')}>
            Volver a pacientes
          </Button>
        </VStack>
      </Container>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    if (!patientId) return;

    if (useFormMode) {
      if (!selectedFormId) {
        toast({ title: 'Selecciona un formulario', status: 'warning', duration: 3000, isClosable: true });
        return;
      }
      const anyFilled = formFieldValues.some((f) => f.value.trim() !== '');
      if (!anyFilled) {
        toast({ title: 'Completa al menos un campo del formulario', status: 'warning', duration: 3000, isClosable: true });
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
    const contentToSave = useFormMode ? content : content;
    try {
      if (currentNoteId) {
        // Actualizar nota existente
        await updateNote(currentNoteId, {
          title,
          content: contentToSave,
          type: noteType,
        });
        
        // Actualizar valores guardados
        setSavedTitle(title);
        setSavedContent(content);
        setSavedReceta(receta);
        setSavedType(noteType);
        setNoteStatus('draft');
        
        // Recargar análisis solo para notas normales
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
        // Crear nueva nota (borrador)
        const newNote = await createNote({
          content: contentToSave,
          type: noteType,
          title: title || undefined,
          files: attachments.length > 0 ? attachments : undefined,
        });

        setCurrentNoteId(newNote.id);
        setSavedTitle(newNote.title ?? title);
        setSavedContent(content);
        setSavedReceta(receta);
        if (newNote.title) setTitle(newNote.title);
        setSavedType(noteType);
        setNoteStatus('draft');
        
        // Cargar análisis solo para notas normales
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

    // Si hay cambios sin guardar, guardar primero
    if (hasChanges()) {
      await handleSaveDraft();
    }

    // Verificar completitud antes de firmar
    if (completenessAnalysis && completenessAnalysis.completeness_score < 80) {
      // Mostrar advertencia de completitud incompleta (la firma se ejecuta al hacer clic en "Firmar de todos modos")
      onIncompleteWarningOpen();
      return;
    }

    // Mostrar modal de confirmación; la firma se ejecuta solo al hacer clic en "Continuar"
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

      // Mostrar modal de confirmación post-firma
      const shouldShowModal = !localStorage.getItem('dontShowSignModal');
      if (shouldShowModal) {
        onSignModalOpen();
      } else {
        navigate(`/patients/${patientId}`);
      }
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
    if (dontShowAgain) {
      localStorage.setItem('dontShowSignModal', 'true');
    }
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
  const hasUnsavedChanges = hasChanges();
  const showSignButton = isDraft && !hasUnsavedChanges;
  // Mostrar panel de análisis solo si es draft, ya tiene ID, y NO es modo formulario
  const showAnalysisPanel = isDraft && currentNoteId !== null && !useFormMode;

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Header - sticky */}
      <Box
        position="sticky"
        top={0}
        zIndex={10}
        bg={cardBg}
        borderBottom="1px"
        borderColor={borderColor}
        px={8}
        py={4}
        shadow="sm"
      >
        <Container maxW="container.xl">
          <HStack spacing={4}>
            <IconButton
              aria-label="Volver"
              icon={<FiArrowLeft />}
              onClick={() => navigate(`/patients/${patientId}`)}
              variant="ghost"
            />
            <VStack align="start" spacing={1} flex={1}>
              <Heading size="lg">
                {isDraft ? 'Editar Nota Médica' : 'Nueva Nota Médica'}
              </Heading>
              <Text color="gray.500">
                {patient.firstName} {patient.lastName}
              </Text>
            </VStack>
            {isDraft && (() => {
              const draftNote = notes.find((n) => n.id === currentNoteId);
              const createdLabel = draftNote?.createdAt
                ? `Borrador creado el ${format(new Date(draftNote.createdAt), "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es })}`
                : 'Borrador';
              return (
                <Tooltip label={createdLabel} placement="top" hasArrow>
                  <Box as="span" display="inline-flex" color="orange.500" alignItems="center">
                    <Icon as={FiEdit} boxSize={5} />
                  </Box>
                </Tooltip>
              );
            })()}
          </HStack>
        </Container>
      </Box>

      {/* Content - scrollable */}
      <Box flex={1} overflowY="auto" py={6}>
      <Container maxW="container.xl" pb={8}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveDraft(); }}>
          {showAnalysisPanel ? (
            // Vista vertical para notas draft: análisis arriba, editor abajo
            <VStack spacing={6} align="stretch">
              {/* Panel de Análisis - Arriba */}
              <Card bg={cardBg}>
                <CardBody>
          <VStack spacing={6} align="stretch">
                    <Heading size="md">Análisis de Nota</Heading>
                    
                    {isLoadingAnalysis ? (
                      <VStack spacing={4} py={10}>
                        <Spinner size="xl" color="brand.500" thickness="3px" />
                        <Text color="gray.600" fontWeight="medium">
                          Analizando nota...
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          Esperando análisis...
                        </Text>
                      </VStack>
                    ) : completenessAnalysis ? (
                      <>
                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <Text fontWeight="semibold">Completitud</Text>
                            <Text fontWeight="bold" fontSize="xl" color="brand.500">
                              {completenessAnalysis.completeness_score}%
                            </Text>
                          </HStack>
                          <Progress
                            value={completenessAnalysis.completeness_score}
                            colorScheme={
                              completenessAnalysis.completeness_score >= 90
                                ? 'green'
                                : completenessAnalysis.completeness_score >= 70
                                ? 'yellow'
                                : 'red'
                            }
                            size="lg"
                            borderRadius="full"
                          />
                        </Box>

                        <Divider />

                        <Box>
                          <Text fontWeight="semibold" mb={3}>
                            Análisis por campo
                          </Text>
                          <List spacing={2}>
                            {Object.entries(completenessAnalysis.reasoning).map(
                              ([key, value]) => {
                                const missing = isFieldMissing(key);
                                return (
                                  <ListItem key={key} display="flex" alignItems="flex-start" gap={2}>
                                    <ListIcon
                                      as={missing ? FiAlertCircle : FiCheckCircle}
                                      color={missing ? 'orange.500' : 'green.500'}
                                      mt={0.5}
                                    />
                                    <Text fontSize="sm" flex={1}>
                                      {value || key.replace(/_/g, ' ')}
                                    </Text>
                                  </ListItem>
                                );
                              }
                            )}
                          </List>
                        </Box>

                        {getMissingFields().length > 0 && (
                          <Alert status="warning" borderRadius="lg" mt={4}>
              <AlertIcon />
              <VStack align="start" spacing={1}>
                              <AlertTitle fontSize="sm">Campos Faltantes</AlertTitle>
                <AlertDescription fontSize="sm">
                                {getMissingFields().join(', ')}
                </AlertDescription>
              </VStack>
            </Alert>
                        )}
                      </>
                    ) : (
                      <Text color="gray.500" textAlign="center" py={4}>
                        El análisis aparecerá aquí
                      </Text>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Editor - Abajo */}
              <Card bg={cardBg}>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl isRequired>
                        <FormLabel>Tipo de Nota</FormLabel>
                        <Select
                          value={useFormMode ? 'form' : noteType}
                          onChange={(e) => handleNoteTypeSelectChange(e.target.value)}
                          size="lg"
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
                          <option value="form">Usar formulario</option>
                        </Select>
                      </FormControl>
                      {useFormMode ? (
                        <FormControl isRequired>
                          <FormLabel>Formulario</FormLabel>
                          <Select
                            value={selectedFormId ?? ''}
                            onChange={(e) => handleFormSelect(e.target.value)}
                            placeholder={formsLoading ? 'Cargando formularios…' : 'Selecciona un formulario'}
                            size="lg"
                            isDisabled={formsLoading}
                          >
                            {doctorForms.map((f) => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <FormControl isRequired>
                          <FormLabel>Título de la Nota</FormLabel>
                          <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Consulta de seguimiento - Enero 2024"
                            size="lg"
                          />
                        </FormControl>
                      )}
                    </SimpleGrid>

                    {useFormMode && selectedFormId ? (
                      <FormNoteFiller formId={selectedFormId} initialValues={formFieldValues} onValuesChange={handleFormValuesChange} />
                    ) : !useFormMode ? (
                      <>
                        <FormControl isRequired>
                          <FormLabel>Contenido de la Nota</FormLabel>
                          <RichTextEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Escribe el contenido de la nota médica..."
                            minHeight="400px"
                          />
                        </FormControl>

                        <FormControl flexShrink={0}>
                          <FormLabel>Archivos Adjuntos</FormLabel>
                          <VStack spacing={3} align="stretch">
                            <Button
                              as="label"
                              leftIcon={<FiUpload />}
                              variant="outline"
                              cursor="pointer"
                              htmlFor="file-upload-draft"
                            >
                              Seleccionar archivos
                              <input
                                id="file-upload-draft"
                                type="file"
                                multiple
                                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.dcm,.hl7,.xml"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                              />
                            </Button>

                            {attachments.length > 0 && (
                              <VStack spacing={2} align="stretch">
                                {attachments.map((file, index) => (
                                  <HStack
                                    key={index}
                                    p={3}
                                    borderWidth="1px"
                                    borderColor={borderColor}
                                    borderRadius="lg"
                                    justify="space-between"
                                  >
                                    <VStack align="start" spacing={0}>
                                      <Text fontSize="sm" fontWeight="medium">
                                        {file.name}
                                      </Text>
                                      <Text fontSize="xs" color="gray.500">
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
                            )}
                          </VStack>
                        </FormControl>
                      </>
                    ) : null}
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          ) : (
            // Vista normal para notas nuevas
            <VStack spacing={6} align="stretch">
            <Card bg={cardBg}>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl isRequired>
                      <FormLabel>Tipo de Nota</FormLabel>
                      <Select
                        value={useFormMode ? 'form' : noteType}
                        onChange={(e) => handleNoteTypeSelectChange(e.target.value)}
                        size="lg"
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
                        <option value="form">Usar formulario</option>
                      </Select>
                      {!useFormMode && (
                        <Text fontSize="sm" color="gray.500" mt={2}>
                          El template se cargará según el tipo de nota
                        </Text>
                      )}
                    </FormControl>
                    {useFormMode ? (
                      <FormControl isRequired>
                        <FormLabel>Formulario</FormLabel>
                        <Select
                          value={selectedFormId ?? ''}
                          onChange={(e) => handleFormSelect(e.target.value)}
                          placeholder={formsLoading ? 'Cargando formularios…' : 'Selecciona un formulario'}
                          size="lg"
                          isDisabled={formsLoading}
                        >
                          {doctorForms.map((f) => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <FormControl isRequired>
                        <FormLabel>Título de la Nota</FormLabel>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Ej: Consulta de seguimiento - Enero 2024"
                          size="lg"
                        />
                      </FormControl>
                    )}
                  </SimpleGrid>

                  {useFormMode && selectedFormId ? (
                    <FormNoteFiller formId={selectedFormId} initialValues={formFieldValues} onValuesChange={handleFormValuesChange} />
                  ) : !useFormMode ? (
                    <>
                      <FormControl isRequired>
                        <FormLabel>Contenido de la Nota</FormLabel>
                        <RichTextEditor
                          value={content}
                          onChange={setContent}
                          placeholder="Escribe el contenido de la nota médica..."
                          minHeight="400px"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Archivos Adjuntos</FormLabel>
                        <VStack spacing={3} align="stretch">
                          <Button
                            as="label"
                            leftIcon={<FiUpload />}
                            variant="outline"
                            cursor="pointer"
                            htmlFor="file-upload"
                          >
                            Seleccionar archivos
                            <input
                              id="file-upload"
                              type="file"
                              multiple
                              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.dcm,.hl7,.xml"
                              onChange={handleFileChange}
                              style={{ display: 'none' }}
                            />
                          </Button>

                          {attachments.length > 0 && (
                            <VStack spacing={2} align="stretch">
                              {attachments.map((file, index) => (
                                <HStack
                                  key={index}
                                  p={3}
                                  borderWidth="1px"
                                  borderColor={borderColor}
                                  borderRadius="lg"
                                  justify="space-between"
                                >
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="medium">
                                      {file.name}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
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
                          )}

                          <Text fontSize="xs" color="gray.500">
                            Tipos de archivo aceptados: Imágenes, videos, audio,
                            PDF, Word, Excel, PowerPoint, DICOM, HL7, XML
                          </Text>
                        </VStack>
                      </FormControl>
                    </>
                  ) : null}
                </VStack>
              </CardBody>
            </Card>
            </VStack>
          )}

            {/* Action Buttons */}
          <HStack justify="flex-end" spacing={3} mt={6}>
              <Button
                variant="ghost"
                onClick={() => navigate(`/patients/${patientId}`)}
                isDisabled={isSubmitting}
              >
                Cancelar
              </Button>
            {showSignButton ? (
              <Button
                colorScheme="brand"
                size="lg"
                onClick={handleSignNote}
                isLoading={isSubmitting}
                loadingText={isLoadingAnalysis ? 'Analizando...' : 'Firmando...'}
              >
                Firmar Nota
              </Button>
            ) : (
              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                isLoading={isSubmitting}
                loadingText="Guardando..."
              >
                Guardar borrador
              </Button>
            )}
            </HStack>
        </form>
      </Container>
      </Box>

      {/* Modal de confirmación antes de firmar (solo cuando la nota está completa) */}
      <Modal isOpen={isConfirmSignOpen} onClose={onConfirmSignClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <Box color="brand.500">
                <FiCheckCircle size={20} />
              </Box>
              <Text>Confirmar firma</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>
                Una vez firmada, la nota no podrá ser modificada. Esta acción es permanente e irreversible.
              </Text>
              <Text fontWeight="medium">
                ¿Deseas continuar con la firma de la nota?
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="outline" onClick={onConfirmSignClose} isDisabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                colorScheme="brand"
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

      {/* Modal de advertencia de completitud incompleta */}
      <Modal isOpen={isIncompleteWarningOpen} onClose={onIncompleteWarningClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <Box color="orange.500">
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
                    La nota tiene una completitud del {completenessAnalysis?.completeness_score || 0}%, que está por debajo del 70% recomendado.
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
                  <Text fontSize="sm" color="gray.600">
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

      {/* Modal post-firma */}
      <Modal isOpen={isSignModalOpen} onClose={handleCloseSignModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <Box color="green.500">
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
                    Una vez firmada, la nota no podrá ser modificada. Esta acción es permanente e irreversible.
                  </AlertDescription>
                </VStack>
                </Alert>
              <Text>
                La nota médica ha sido firmada digitalmente y guardada en el expediente del paciente.
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
            <Button colorScheme="brand" onClick={handleCloseSignModal}>
              Continuar
                  </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default NoteForm;
