import React, { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { Upload, Close, ArrowLeft } from '@carbon/icons-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getPatientById, mockNoteTemplates } from '../data/mockData';
import RichTextEditor from '../components/RichTextEditor';
import type { NoteType } from '../types';

const NoteForm: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const cardBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.20', 'gray.70');

  const patient = patientId ? getPatientById(patientId) : null;

  const [title, setTitle] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('evolution_note');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  // Load template when note type changes
  useEffect(() => {
    const template = mockNoteTemplates.find((t) => t.type === noteType);
    if (template) {
      setContent(template.content);
      if (!title) {
        setTitle(
          `${template.name} - ${patient?.firstName} ${patient?.lastName}`
        );
      }
    }
  }, [noteType, patient]);

  // Set initial note type from location state
  useEffect(() => {
    if (location.state?.type) {
      setNoteType(location.state.type);
    }
  }, [location.state]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    setShowWarning(true);
  };

  const handleConfirmSave = () => {
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Nota guardada y firmada',
        description: 'La nota médica ha sido guardada y firmada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate(`/patients/${patientId}`);
    }, 1000);
  };

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
              icon={<ArrowLeft size={24} />}
              onClick={() => navigate(`/patients/${patientId}`)}
              variant="ghost"
            />
            <VStack align="start" spacing={1} flex={1}>
              <Heading size="lg">Nueva Nota Médica</Heading>
              <Text color="text.secondary">
                {patient.firstName} {patient.lastName}
              </Text>
            </VStack>
          </HStack>
        </Container>
      </Box>

      {/* Content */}
      <Container maxW="container.xl" py={8}>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            {/* Warning Alert */}
            <Alert
              status="warning"
              borderRadius="lg"
              variant="left-accent"
            >
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <AlertTitle>Aviso Importante</AlertTitle>
                <AlertDescription fontSize="sm">
                  Una vez guardada la nota, será firmada automáticamente y no
                  podrá ser editada.
                </AlertDescription>
              </VStack>
            </Alert>

            {/* Form Fields */}
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
                        Interrogatorio Inicial
                      </option>
                      <option value="evolution_note">Nota de Evolución</option>
                      <option value="physical_examination">
                        Exploración Física
                      </option>
                      <option value="custom">Nota Personalizada</option>
                    </Select>
                    <Text fontSize="sm" color="text.secondary" mt={2}>
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
                        leftIcon={<Upload size={20} />}
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
                                <Text fontSize="xs" color="text.secondary">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </Text>
                              </VStack>
                              <IconButton
                                aria-label="Eliminar archivo"
                                icon={<Close size={20} />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleRemoveFile(index)}
                              />
                            </HStack>
                          ))}
                        </VStack>
                      )}

                      <Text fontSize="xs" color="text.secondary">
                        Tipos de archivo aceptados: Imágenes, videos, audio,
                        PDF, Word, Excel, PowerPoint, DICOM, HL7, XML
                      </Text>
                    </VStack>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Action Buttons */}
            <HStack justify="flex-end" spacing={3}>
              <Button
                variant="ghost"
                onClick={() => navigate(`/patients/${patientId}`)}
              >
                Cancelar
              </Button>
              <Button type="submit" colorScheme="brand" size="lg">
                Guardar y Firmar Nota
              </Button>
            </HStack>
          </VStack>
        </form>
      </Container>

      {/* Confirmation Modal */}
      {showWarning && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
          onClick={() => setShowWarning(false)}
        >
          <Card
            bg={cardBg}
            maxW="md"
            onClick={(e) => e.stopPropagation()}
            boxShadow="2xl"
          >
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Confirmar Guardado</Heading>
                <Alert status="warning" borderRadius="lg">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    La nota será firmada automáticamente y no podrá ser editada
                    después de guardarla.
                  </AlertDescription>
                </Alert>
                <Text>¿Estás seguro de que deseas continuar?</Text>
                <HStack justify="flex-end" spacing={3}>
                  <Button onClick={() => setShowWarning(false)}>
                    Cancelar
                  </Button>
                  <Button colorScheme="brand" onClick={handleConfirmSave}>
                    Confirmar y Guardar
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default NoteForm;
