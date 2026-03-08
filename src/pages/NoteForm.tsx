import React, { useState, useEffect, useRef } from 'react';
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
  Badge,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { FiUpload, FiX, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiEdit } from 'react-icons/fi';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { mockNoteTemplates } from '../data/mockData';
import RichTextEditor from '../components/RichTextEditor';
import type { NoteType, NoteCompletenessAnalysis } from '../types';
import { usePatient } from '../hooks/usePatients';
import { useNotes } from '../hooks/useNotes';
import { apiService } from '../services/api';

const RECETA_DELIMITER = '<!-- ___RECETA___ -->';

const NoteForm: React.FC = () => {
  const { patientId, noteId } = useParams<{ patientId: string; noteId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

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
  
  // Estados para detectar cambios
  const [savedTitle, setSavedTitle] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [savedReceta, setSavedReceta] = useState('');
  const [savedType, setSavedType] = useState<NoteType>('evolution');
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(noteId || null);
  const [noteStatus, setNoteStatus] = useState<'new' | 'draft' | 'signed'>('new');
  
  // Modal states
  const { isOpen: isSignModalOpen, onOpen: onSignModalOpen, onClose: onSignModalClose } = useDisclosure();
  const { isOpen: isIncompleteWarningOpen, onOpen: onIncompleteWarningOpen, onClose: onIncompleteWarningClose } = useDisclosure();
  const { isOpen: isConfirmSignOpen, onOpen: onConfirmSignOpen, onClose: onConfirmSignClose } = useDisclosure();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Refs para comparar cambios
  const hasChangesRef = useRef(false);
  const isLoadingAnalysisAfterSaveRef = useRef(false);
  const followUpLoadedRef = useRef(false);

  // Detectar si hay cambios
  const hasChanges = () => {
    return (
      title !== savedTitle ||
      content !== savedContent ||
      receta !== savedReceta ||
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
      const recetaIdx = rawContent.indexOf(RECETA_DELIMITER);
      const mainContent = recetaIdx >= 0 ? rawContent.slice(0, recetaIdx).trim() : rawContent;
      const recetaContent = recetaIdx >= 0 ? rawContent.slice(recetaIdx + RECETA_DELIMITER.length).trim() : '';
      setTitle(note.title);
      setContent(mainContent);
      setReceta(recetaContent);
      setNoteType(note.type);
      setSavedTitle(note.title);
      setSavedContent(mainContent);
      setSavedReceta(recetaContent);
      setSavedType(note.type);
      setCurrentNoteId(note.id);
      setNoteStatus(note.status);
      
      // Si es draft, cargar análisis (omitir si estamos recargando tras guardar)
      if (note.status === 'draft' && note.id && !isLoadingAnalysisAfterSaveRef.current) {
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
        const recetaIdx = rawContent.indexOf(RECETA_DELIMITER);
        const mainContent = recetaIdx >= 0 ? rawContent.slice(0, recetaIdx).trim() : rawContent;
        const recetaContent = recetaIdx >= 0 ? rawContent.slice(recetaIdx + RECETA_DELIMITER.length).trim() : '';
        const noteTypeVal = (note.type || 'evolution') as NoteType;
        followUpLoadedRef.current = true;
        setTitle(`Seguimiento - ${note.title || 'Nota anterior'}`);
        setContent(mainContent);
        setReceta(recetaContent);
        setNoteType(noteTypeVal);
        setNoteStatus('new');
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

  // Load template when note type changes (solo si es nota nueva y no se cargó desde Seguimiento)
  useEffect(() => {
    if (noteStatus !== 'new' || followUpLoadedRef.current) return;
    const template = mockNoteTemplates.find((t) => t.type === noteType);
    if (!template) return;
    const today = format(new Date(), "d 'de' MMM yyyy", { locale: es });
    setTitle(`${template.name} - ${today}`);
    setContent(template.content);
  }, [noteType, noteStatus]);

  // Set initial note type from location state
  useEffect(() => {
    if (location.state?.type && noteStatus === 'new') {
      setNoteType(location.state.type);
    }
  }, [location.state, noteStatus]);

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

    if (!content.trim()) {
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
    isLoadingAnalysisAfterSaveRef.current = true;
    setIsLoadingAnalysis(true);
    setCompletenessAnalysis(null);
    const contentToSave = receta ? content + '\n' + RECETA_DELIMITER + '\n' + receta : content;
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
        
        // Recargar análisis (puede tardar; reintentar si 404 hasta que esté listo)
        if (currentNoteId) {
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
        
        // Cargar análisis (puede tardar; reintentar si 404 hasta que esté listo)
        if (newNote.id) {
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
    try {
      await signNote(currentNoteId, save_anyway);
      
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

  const getNoteTypeLabel = (type: NoteType) => {
    switch (type) {
      case 'interrogation':
        return 'Interrogatorio';
      case 'evolution':
        return 'Nota de Evolución';
      case 'exploration':
        return 'Exploración Física';
      default:
        return 'Nota Médica';
    }
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
  // Mostrar panel de análisis solo si es draft Y ya tiene ID (fue guardado)
  const showAnalysisPanel = isDraft && currentNoteId !== null;

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
                          value={noteType}
                          onChange={(e) => setNoteType(e.target.value as NoteType)}
                          size="lg"
                        >
                          <option value="interrogation">
                            Interrogatorio
                          </option>
                          <option value="evolution">Nota de Evolución</option>
                          <option value="exploration">
                            Exploración Física
                          </option>
                        </Select>
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Título de la Nota</FormLabel>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Ej: Consulta de seguimiento - Enero 2024"
                          size="lg"
                        />
                      </FormControl>
                    </SimpleGrid>

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
                      <FormLabel>Receta</FormLabel>
                      <RichTextEditor
                        value={receta}
                        onChange={setReceta}
                        placeholder="Indicaciones y receta médica..."
                        minHeight="200px"
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
                      </VStack>
                    </FormControl>
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
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value as NoteType)}
                        size="lg"
                      >
                        <option value="interrogation">
                          Interrogatorio
                        </option>
                        <option value="evolution">Nota de Evolución</option>
                        <option value="exploration">
                          Exploración Física
                        </option>
                      </Select>
                      <Text fontSize="sm" color="gray.500" mt={2}>
                        El template se cargará según el tipo de nota
                      </Text>
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Título de la Nota</FormLabel>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ej: Consulta de seguimiento - Enero 2024"
                        size="lg"
                      />
                    </FormControl>
                  </SimpleGrid>

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
                    <FormLabel>Receta</FormLabel>
                    <RichTextEditor
                      value={receta}
                      onChange={setReceta}
                      placeholder="Indicaciones y receta médica..."
                      minHeight="200px"
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
                    La nota tiene una completitud del {completenessAnalysis?.completeness_score || 0}%, que está por debajo del 80% recomendado.
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
