import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  HStack,
  VStack,
  Text,
  Button,
  Avatar,
  Badge,
  Card,
  CardHeader,
  CardBody,
  useColorModeValue,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiCalendar,
  FiFileText,
  FiEdit,
  FiPhone,
  FiMail,
  FiMapPin,
  FiFile,
  FiDownload,
  FiArrowLeft,
} from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getPatientById,
  getNotesByPatientId,
  mockAttachments,
} from '../data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedNote, setSelectedNote] = useState<any>(null);

  const patient = id ? getPatientById(id) : undefined;
  const notes = id ? getNotesByPatientId(id) : [];
  const patientAttachments = mockAttachments.filter(
    (a) => a.patientId === id
  );
  const latestNote = notes[0]; // Already sorted by date in mock data

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

  const handleViewNote = (note: any) => {
    setSelectedNote(note);
    onOpen();
  };

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case 'initial_interrogation':
        return 'Interrogatorio Inicial';
      case 'evolution_note':
        return 'Nota de Evolución';
      case 'physical_examination':
        return 'Exploración Física';
      default:
        return 'Nota Personalizada';
    }
  };

  const getFileIcon = (fileType: string) => {
    return <FiFile />;
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
          <VStack spacing={4} align="stretch">
            <HStack>
              <IconButton
                aria-label="Volver"
                icon={<FiArrowLeft />}
                onClick={() => navigate('/patients')}
                variant="ghost"
              />
              <Heading size="lg">Detalle del Paciente</Heading>
            </HStack>

            <HStack justify="space-between" flexWrap="wrap" gap={3}>
              <HStack spacing={4}>
                <Avatar
                  size="xl"
                  name={`${patient.firstName} ${patient.lastName}`}
                  src={patient.avatar}
                />
                <VStack align="start" spacing={1}>
                  <Heading size="md">
                    {patient.firstName} {patient.lastName}
                  </Heading>
                  <HStack spacing={2}>
                    {patient.gender && (
                      <Badge colorScheme="blue">
                        {patient.gender === 'male'
                          ? 'Masculino'
                          : patient.gender === 'female'
                            ? 'Femenino'
                            : 'Otro'}
                      </Badge>
                    )}
                    {patient.bloodType && (
                      <Badge colorScheme="red">{patient.bloodType}</Badge>
                    )}
                  </HStack>
                  {patient.dateOfBirth && (
                    <Text fontSize="sm" color="gray.500">
                      Fecha de nacimiento:{' '}
                      {format(new Date(patient.dateOfBirth), "d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                    </Text>
                  )}
                </VStack>
              </HStack>

              <HStack spacing={3}>
                <Button
                  leftIcon={<FiCalendar />}
                  colorScheme="brand"
                  onClick={() => navigate('/calendar', { state: { patientId: patient.id } })}
                >
                  Nueva Cita
                </Button>
                <Button
                  leftIcon={<FiFileText />}
                  variant="outline"
                  onClick={() => navigate(`/patients/${patient.id}/notes/new`)}
                >
                  Nueva Nota
                </Button>
                <IconButton
                  aria-label="Editar paciente"
                  icon={<FiEdit />}
                  variant="outline"
                  onClick={() =>
                    toast({
                      title: 'Editar paciente',
                      description: 'Función en desarrollo',
                      status: 'info',
                      duration: 2000,
                    })
                  }
                />
              </HStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Content */}
      <Container maxW="container.xl" py={8}>
        <Tabs colorScheme="brand">
          <TabList>
            <Tab>Información General</Tab>
            <Tab>Expediente Médico ({notes.length})</Tab>
            <Tab>Archivos ({patientAttachments.length})</Tab>
          </TabList>

          <TabPanels>
            {/* General Information Tab */}
            <TabPanel px={0} pt={6}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {/* Personal Information */}
                <Card bg={cardBg}>
                  <CardHeader>
                    <Heading size="md">Información Personal</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {patient.email && (
                        <HStack spacing={3}>
                          <FiMail />
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="sm" color="gray.500">
                              Email
                            </Text>
                            <Text>{patient.email}</Text>
                          </VStack>
                        </HStack>
                      )}
                      {patient.phone && (
                        <HStack spacing={3}>
                          <FiPhone />
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="sm" color="gray.500">
                              Teléfono
                            </Text>
                            <Text>{patient.phone}</Text>
                          </VStack>
                        </HStack>
                      )}
                      {(patient.address || patient.city || patient.state) && (
                        <HStack spacing={3} align="start">
                          <FiMapPin />
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="sm" color="gray.500">
                              Dirección
                            </Text>
                            <Text>
                              {patient.address}
                              {patient.city && `, ${patient.city}`}
                              {patient.state && `, ${patient.state}`}
                              {patient.zipCode && ` ${patient.zipCode}`}
                            </Text>
                          </VStack>
                        </HStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Legal/Fiscal Information */}
                <Card bg={cardBg}>
                  <CardHeader>
                    <Heading size="md">Información Legal/Fiscal</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {patient.curp && (
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.500">
                            CURP
                          </Text>
                          <Text fontFamily="mono">{patient.curp}</Text>
                        </VStack>
                      )}
                      {patient.rfc && (
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.500">
                            RFC
                          </Text>
                          <Text fontFamily="mono">{patient.rfc}</Text>
                        </VStack>
                      )}
                      {patient.socialSecurityNumber && (
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.500">
                            Número de Seguro Social
                          </Text>
                          <Text fontFamily="mono">
                            {patient.socialSecurityNumber}
                          </Text>
                        </VStack>
                      )}
                      {patient.insuranceProvider && (
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.500">
                            Seguro Médico
                          </Text>
                          <Text>
                            {patient.insuranceProvider}
                            {patient.insuranceNumber &&
                              ` - ${patient.insuranceNumber}`}
                          </Text>
                        </VStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Latest Note Preview */}
                {latestNote && (
                  <Card bg={cardBg}>
                    <CardHeader>
                      <HStack justify="space-between">
                        <Heading size="md">Última Nota Médica</Heading>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewNote(latestNote)}
                        >
                          Ver completa
                        </Button>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold">{latestNote.title}</Text>
                          <Badge colorScheme="blue">
                            {getNoteTypeLabel(latestNote.type)}
                          </Badge>
                        </VStack>
                        <Text fontSize="sm" color="gray.500" noOfLines={3}>
                          {latestNote.content.substring(0, 150)}...
                        </Text>
                        {latestNote.isSigned && (
                          <Badge colorScheme="green" fontSize="xs">
                            Firmado por {latestNote.signedBy} el{' '}
                            {latestNote.signedAt &&
                              format(
                                new Date(latestNote.signedAt),
                                "d 'de' MMM 'a las' HH:mm",
                                { locale: es }
                              )}
                          </Badge>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* Quick Links */}
                <Card bg={cardBg}>
                  <CardHeader>
                    <Heading size="md">Accesos Rápidos</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <Button
                        leftIcon={<FiFileText />}
                        variant="outline"
                        justifyContent="start"
                        onClick={() =>
                          navigate(`/patients/${patient.id}/notes/new`, {
                            state: { type: 'initial_interrogation' },
                          })
                        }
                      >
                        Crear Interrogatorio Inicial
                      </Button>
                      <Button
                        leftIcon={<FiCalendar />}
                        variant="outline"
                        justifyContent="start"
                        onClick={() =>
                          navigate('/calendar', {
                            state: { patientId: patient.id },
                          })
                        }
                      >
                        Agendar Cita
                      </Button>
                      <Button
                        leftIcon={<FiEdit />}
                        variant="outline"
                        justifyContent="start"
                        onClick={() =>
                          toast({
                            title: 'Editar paciente',
                            description: 'Función en desarrollo',
                            status: 'info',
                            duration: 2000,
                          })
                        }
                      >
                        Editar Información
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Medical Notes Tab */}
            <TabPanel px={0} pt={6}>
              <VStack spacing={4} align="stretch">
                {notes.length === 0 ? (
                  <Card bg={cardBg}>
                    <CardBody>
                      <VStack spacing={4} py={8}>
                        <Text fontSize="lg" color="gray.500">
                          No hay notas médicas registradas
                        </Text>
                        <Button
                          leftIcon={<FiFileText />}
                          colorScheme="brand"
                          onClick={() =>
                            navigate(`/patients/${patient.id}/notes/new`)
                          }
                        >
                          Crear Primera Nota
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                ) : (
                  notes.map((note) => (
                    <Card key={note.id} bg={cardBg}>
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Heading size="sm">{note.title}</Heading>
                              <HStack spacing={2}>
                                <Badge colorScheme="blue">
                                  {getNoteTypeLabel(note.type)}
                                </Badge>
                                <Text fontSize="xs" color="gray.500">
                                  {format(
                                    new Date(note.createdAt),
                                    "d 'de' MMMM, yyyy 'a las' HH:mm",
                                    { locale: es }
                                  )}
                                </Text>
                              </HStack>
                            </VStack>
                            <Button
                              size="sm"
                              onClick={() => handleViewNote(note)}
                            >
                              Ver Nota
                            </Button>
                          </HStack>
                          {note.isSigned && (
                            <Badge
                              colorScheme="green"
                              fontSize="xs"
                              alignSelf="start"
                            >
                              Firmado por {note.signedBy} el{' '}
                              {note.signedAt &&
                                format(
                                  new Date(note.signedAt),
                                  "d 'de' MMM 'a las' HH:mm",
                                  { locale: es }
                                )}
                            </Badge>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  ))
                )}
              </VStack>
            </TabPanel>

            {/* Attachments Tab */}
            <TabPanel px={0} pt={6}>
              <VStack spacing={4} align="stretch">
                {patientAttachments.length === 0 ? (
                  <Card bg={cardBg}>
                    <CardBody>
                      <VStack spacing={4} py={8}>
                        <Text fontSize="lg" color="gray.500">
                          No hay archivos adjuntos
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {patientAttachments.map((attachment) => (
                      <Card key={attachment.id} bg={cardBg}>
                        <CardBody>
                          <HStack spacing={3}>
                            <Box fontSize="2xl">
                              {getFileIcon(attachment.fileType)}
                            </Box>
                            <VStack align="start" spacing={0} flex={1}>
                              <Text fontWeight="medium" noOfLines={1}>
                                {attachment.fileName}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                {(attachment.fileSize / 1024 / 1024).toFixed(2)}{' '}
                                MB
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                {format(
                                  new Date(attachment.uploadedAt),
                                  "d 'de' MMM, yyyy",
                                  { locale: es }
                                )}
                              </Text>
                            </VStack>
                            <IconButton
                              aria-label="Descargar"
                              icon={<FiDownload />}
                              variant="ghost"
                              size="sm"
                            />
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      {/* Note View Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <VStack align="start" spacing={2}>
              <Text>{selectedNote?.title}</Text>
              <HStack spacing={2}>
                <Badge colorScheme="blue">
                  {selectedNote && getNoteTypeLabel(selectedNote.type)}
                </Badge>
                {selectedNote?.isSigned && (
                  <Badge colorScheme="green" fontSize="xs">
                    Firmado por {selectedNote.signedBy}
                  </Badge>
                )}
              </HStack>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Box
              sx={{
                '& h1': { fontSize: '2xl', fontWeight: 'bold', mb: 4 },
                '& h2': { fontSize: 'xl', fontWeight: 'bold', mb: 3, mt: 6 },
                '& h3': { fontSize: 'lg', fontWeight: 'semibold', mb: 2, mt: 4 },
                '& p': { mb: 2 },
                '& ul': { ml: 6, mb: 4 },
                '& li': { mb: 1 },
              }}
            >
              <ReactMarkdown>{selectedNote?.content || ''}</ReactMarkdown>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PatientDetail;
