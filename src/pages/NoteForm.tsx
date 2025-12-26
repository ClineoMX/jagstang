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
} from '@chakra-ui/react';
import { FiUpload, FiX, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { mockNoteTemplates } from '../data/mockData';
import RichTextEditor from '../components/RichTextEditor';
import type { NoteType, NoteCompletenessAnalysis } from '../types';
import { usePatient } from '../hooks/usePatients';
import { useNotes } from '../hooks/useNotes';
import { apiService } from '../services/api';
import { USE_API } from '../config/api';

const NoteForm: React.FC = () => {
  const { patientId, noteId } = useParams<{ patientId: string; noteId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const cardBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Usar hook para cargar paciente y notas
  const { patient, loading: patientLoading } = usePatient(patientId);
  const { createNote, updateNote, signNote, getNoteCompleteness, notes, loading: notesLoading } = useNotes(patientId);

  const [title, setTitle] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('evolution_note');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [completenessAnalysis, setCompletenessAnalysis] = useState<NoteCompletenessAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  
  // Estados para detectar cambios
  const [savedTitle, setSavedTitle] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [savedType, setSavedType] = useState<NoteType>('evolution_note');
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(noteId || null);
  const [noteStatus, setNoteStatus] = useState<'new' | 'draft' | 'signed'>('new');
  
  // Modal states
  const { isOpen: isSignModalOpen, onOpen: onSignModalOpen, onClose: onSignModalClose } = useDisclosure();
  const { isOpen: isIncompleteWarningOpen, onOpen: onIncompleteWarningOpen, onClose: onIncompleteWarningClose } = useDisclosure();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Refs para comparar cambios
  const hasChangesRef = useRef(false);

  // Detectar si hay cambios
  const hasChanges = () => {
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
      setTitle(note.title);
      setContent(note.content);
      setNoteType(note.type);
      setSavedTitle(note.title);
      setSavedContent(note.content);
      setSavedType(note.type);
      setCurrentNoteId(note.id);
      setNoteStatus(note.status);
      
      // Si es draft, cargar análisis
      if (note.status === 'draft' && note.id) {
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

  // Cargar análisis de completitud
  const loadCompletenessAnalysis = async (id: string): Promise<void> => {
    if (!id) {
      console.warn('loadCompletenessAnalysis: No ID provided');
      return;
    }
    
    setIsLoadingAnalysis(true);
    setCompletenessAnalysis(null); // Limpiar análisis anterior
    try {
      console.log('Loading completeness analysis for note:', id);
      const analysis = await getNoteCompleteness(id);
      console.log('Completeness analysis loaded:', analysis);
      setCompletenessAnalysis(analysis);
    } catch (error) {
      console.error('Error loading completeness analysis:', error);
      // No establecer análisis si hay error, pero no fallar
      setCompletenessAnalysis(null);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // Cargar análisis con contenido directo (para evitar problemas de sincronización)
  const loadCompletenessAnalysisWithContent = async (
    id: string,
    noteContent: string,
    noteType: string
  ): Promise<void> => {
    if (!id) {
      console.warn('loadCompletenessAnalysisWithContent: No ID provided');
      return;
    }
    
    setIsLoadingAnalysis(true);
    setCompletenessAnalysis(null); // Limpiar análisis anterior
    try {
      console.log('Loading completeness analysis for note with content:', id);
      const analysis = await getNoteCompleteness(id, noteContent, noteType);
      console.log('Completeness analysis loaded:', analysis);
      setCompletenessAnalysis(analysis);
    } catch (error) {
      console.error('Error loading completeness analysis:', error);
      // No establecer análisis si hay error, pero no fallar
      setCompletenessAnalysis(null);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // Load template when note type changes (solo si es nota nueva)
  useEffect(() => {
    if (noteStatus === 'new') {
    const template = mockNoteTemplates.find((t) => t.type === noteType);
      if (template && !content) {
      setContent(template.content);
      if (!title) {
        setTitle(
          `${template.name} - ${patient?.firstName} ${patient?.lastName}`
        );
      }
    }
    }
  }, [noteType, patient, noteStatus]);

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

    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentNoteId) {
        // Actualizar nota existente
        await updateNote(currentNoteId, {
          title,
          content,
          type: noteType,
        });
        
        // Actualizar valores guardados
        setSavedTitle(title);
        setSavedContent(content);
        setSavedType(noteType);
        setNoteStatus('draft');
        
        // Recargar análisis actualizado después de guardar
        if (currentNoteId) {
          // Pasar contenido y tipo directamente para análisis actualizado
          await loadCompletenessAnalysisWithContent(currentNoteId, content, noteType);
        }
        
        toast({
          title: 'Borrador guardado',
          description: 'La nota se ha guardado como borrador',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Crear nueva nota
      const newNote = await createNote({
        title,
        content,
        type: noteType,
      });

      // Si hay archivos adjuntos, adjuntarlos
      if (attachments.length > 0 && USE_API && newNote.id) {
        try {
          await apiService.attachFilesToNote(patientId, newNote.id, attachments);
        } catch (attachError) {
          console.error('Error al adjuntar archivos:', attachError);
          }
        }

        setCurrentNoteId(newNote.id);
        setSavedTitle(title);
        setSavedContent(content);
        setSavedType(noteType);
        setNoteStatus('draft');
        
        // Cargar análisis inmediatamente después de guardar
      if (newNote.id) {
          // Pasar contenido y tipo directamente para evitar problemas de sincronización
          await loadCompletenessAnalysisWithContent(newNote.id, content, noteType);
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
      // Mostrar advertencia de completitud incompleta
      onIncompleteWarningOpen();
      return;
    }

    // Proceder con la firma
    await proceedWithSigning();
  };

  const proceedWithSigning = async () => {
    if (!patientId || !currentNoteId) return;

    setIsSubmitting(true);
    try {
      await signNote(currentNoteId);
      
      toast({
        title: 'Nota firmada',
        description: 'La nota médica ha sido firmada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Cerrar modal de advertencia si está abierto
      onIncompleteWarningClose();

      // Mostrar modal de confirmación
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
      case 'initial_interrogation':
        return 'Interrogatorio';
      case 'evolution_note':
        return 'Nota de Evolución';
      case 'physical_examination':
        return 'Exploración Física';
      case 'custom':
        return 'Nota Personalizada';
      default:
        return 'Nota Médica';
    }
  };

  const getMissingFields = (): string[] => {
    if (!completenessAnalysis) return [];
    
    const missing: string[] = [];
    Object.entries(completenessAnalysis.reasoning).forEach(([key, value]) => {
      if (value && value.toLowerCase().includes('falta')) {
        const fieldName = key
          .replace('has_', '')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
        missing.push(fieldName);
      }
    });
    
    return missing;
  };

  const isDraft = noteStatus === 'draft';
  const hasUnsavedChanges = hasChanges();
  const showSignButton = isDraft && !hasUnsavedChanges;
  // Mostrar panel de análisis solo si es draft Y ya tiene ID (fue guardado)
  const showAnalysisPanel = isDraft && currentNoteId !== null;

  return (
    <Box>
      {/* Header */}
      <Box
        bg={cardBg}
        borderBottom="1px"
        borderColor={borderColor}
        px={8}
        py={6}
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
            {isDraft && (
              <Badge colorScheme="orange" fontSize="md" px={3} py={1}>
                Borrador
              </Badge>
            )}
          </HStack>
        </Container>
      </Box>

      {/* Content */}
      <Container maxW="container.xl" py={8}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveDraft(); }}>
          {showAnalysisPanel ? (
            // Vista vertical para notas draft: análisis arriba, editor abajo
            <VStack spacing={6} align="stretch">
              {/* Panel de Análisis - Arriba */}
              <Card bg={cardBg}>
                <CardBody>
          <VStack spacing={6} align="stretch">
                    <Heading size="md">Análisis de Completitud</Heading>
                    
                    {isLoadingAnalysis ? (
                      <VStack spacing={4} py={8}>
                        <Spinner size="lg" color="brand.500" />
                        <Text color="gray.500">Analizando nota...</Text>
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
                            Campos Requeridos
                          </Text>
                          <List spacing={2}>
                            {Object.entries(completenessAnalysis.reasoning).map(
                              ([key, value]) => {
                                const isComplete = value && !value.toLowerCase().includes('falta');
                                return (
                                  <ListItem key={key}>
                                    <HStack spacing={2}>
                                      <ListIcon
                                        as={isComplete ? FiCheckCircle : FiAlertCircle}
                                        color={isComplete ? 'green.500' : 'orange.500'}
                                      />
                                      <Text fontSize="sm" flex={1}>
                                        {value || key.replace(/_/g, ' ')}
                                      </Text>
                                    </HStack>
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
                        El análisis de completitud aparecerá aquí
                      </Text>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Editor - Abajo */}
              <Card bg={cardBg}>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <FormControl isRequired>
                      <FormLabel>Título de la Nota</FormLabel>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ej: Consulta de seguimiento - Enero 2024"
                        size="lg"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Tipo de Nota</FormLabel>
                      <Select
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value as NoteType)}
                        size="lg"
                      >
                        <option value="initial_interrogation">
                          Interrogatorio
                        </option>
                        <option value="evolution_note">Nota de Evolución</option>
                        <option value="physical_examination">
                          Exploración Física
                        </option>
                        <option value="custom">Nota Personalizada</option>
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Contenido de la Nota</FormLabel>
                      <RichTextEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Escribe el contenido de la nota médica..."
                        minHeight="500px"
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
                  <FormControl isRequired>
                    <FormLabel>Título de la Nota</FormLabel>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej: Consulta de seguimiento - Enero 2024"
                      size="lg"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Tipo de Nota</FormLabel>
                    <Select
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value as NoteType)}
                      size="lg"
                    >
                      <option value="initial_interrogation">
                        Interrogatorio
                      </option>
                      <option value="evolution_note">Nota de Evolución</option>
                      <option value="physical_examination">
                        Exploración Física
                      </option>
                      <option value="custom">Nota Personalizada</option>
                    </Select>
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      El template se cargará automáticamente según el tipo de
                      nota seleccionado
                    </Text>
                  </FormControl>

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
                loadingText="Firmando..."
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
                onClick={proceedWithSigning}
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
