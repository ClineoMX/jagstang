import React, { useState, useMemo } from 'react';
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
  Tooltip,
  Icon,
  Checkbox,
  ModalFooter,
  Input,
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
  FiUser,
} from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import {
  mockAttachments,
  getConsentTypes,
  getPatientConsentsByPatientId,
} from '../data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import type { MedicalNote, ConsentType, PatientConsent } from '../types';
import { usePatient } from '../hooks/usePatients';
import { useNotes } from '../hooks/useNotes';
import { Spinner, Alert, AlertIcon } from '@chakra-ui/react';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const greenHeaderBg = useColorModeValue('green.50', 'gray.700');
  const orangeHeaderBg = useColorModeValue('orange.50', 'gray.700');
  const purpleHeaderBg = useColorModeValue('purple.50', 'gray.700');
  const blueHeaderBg = useColorModeValue('blue.50', 'gray.700');
  const redHeaderBg = useColorModeValue('red.50', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedNote, setSelectedNote] = useState<any>(null);

  // Usar hooks de API
  const { patient, profile, loading: patientLoading, error: patientError } = usePatient(id);
  const { notes, loading: notesLoading, error: notesError } = useNotes(id);

  // Consent states (todavía usando mock data hasta que haya endpoint)
  const {
    isOpen: isConsentModalOpen,
    onOpen: onConsentModalOpen,
    onClose: onConsentModalClose,
  } = useDisclosure();
  const [selectedConsent, setSelectedConsent] = useState<ConsentType | null>(null);
  const [consentTypes] = useState<ConsentType[]>(getConsentTypes());
  const [patientConsents] = useState<PatientConsent[]>(
    id ? getPatientConsentsByPatientId(id) : []
  );

  const patientAttachments = mockAttachments.filter(
    (a) => a.patientId === id
  );
  const latestNote = notes[0]; // Already sorted by date

  // Group notes by date
  const groupedNotes = useMemo(() => {
    const groups: Record<string, MedicalNote[]> = {};
    notes.forEach((note) => {
      const dateKey = format(new Date(note.createdAt), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(note);
    });
    // Sort by date descending
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [notes]);

  // State for expanded stacks
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const toggleDateExpansion = (dateKey: string) => {
    setExpandedDates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey);
      } else {
        newSet.add(dateKey);
      }
      return newSet;
    });
  };

  if (patientLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Cargando paciente...</Text>
        </VStack>
      </Container>
    );
  }

  if (patientError || !patient) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold">Error al cargar paciente</Text>
              <Text fontSize="sm">{patientError || 'Paciente no encontrado'}</Text>
            </VStack>
          </Alert>
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
        return 'Interrogatorio';
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

  // Consent functions
  const handleConsentClick = (consent: ConsentType) => {
    setSelectedConsent(consent);
    onConsentModalOpen();
  };

  const isConsentGranted = (consentTypeId: string) => {
    return patientConsents.some(
      (pc) => pc.consentTypeId === consentTypeId && pc.status === 'granted'
    );
  };

  return (
    <Box>
      {/* Header with Gradient */}
      <Box
        bgGradient="linear(135deg, purple.500 0%, purple.600 100%)"
        color="white"
        px={8}
        py={8}
      >
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            <HStack>
              <IconButton
                aria-label="Volver"
                icon={<FiArrowLeft />}
                onClick={() => navigate('/patients')}
                variant="ghost"
                colorScheme="whiteAlpha"
                _hover={{
                  bg: 'whiteAlpha.300',
                }}
              />
              <Heading size="lg">Expediente del Paciente</Heading>
            </HStack>

            <HStack justify="space-between" flexWrap="wrap" gap={4}>
              <HStack spacing={6}>
                <Avatar
                  size="2xl"
                  name={`${patient.firstName} ${patient.lastName}`}
                  src={patient.avatar}
                  bg="whiteAlpha.300"
                  color="white"
                  borderWidth="4px"
                  borderColor="whiteAlpha.400"
                />
                <VStack align="start" spacing={2}>
                  <Heading size="xl">
                    {patient.firstName} {patient.lastName}
                  </Heading>
                  <HStack spacing={2}>
                    {patient.gender && (
                      <Badge
                        colorScheme={patient.gender === 'male' ? 'blue' : 'pink'}
                        fontSize="sm"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {patient.gender === 'male'
                          ? 'Masculino'
                          : patient.gender === 'female'
                            ? 'Femenino'
                            : 'Otro'}
                      </Badge>
                    )}
                    {patient.bloodType && (
                      <Badge
                        colorScheme="red"
                        fontSize="sm"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {patient.bloodType}
                      </Badge>
                    )}
                  </HStack>
                  {patient.dateOfBirth && (
                    <Text fontSize="md" opacity={0.9}>
                      Fecha de nacimiento:{' '}
                      {format(new Date(patient.dateOfBirth), "d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                    </Text>
                  )}
                </VStack>
              </HStack>

              <HStack spacing={3} flexWrap="wrap">
                <Button
                  leftIcon={<FiCalendar />}
                  size="lg"
                  colorScheme="whiteAlpha"
                  bg="whiteAlpha.300"
                  backdropFilter="blur(10px)"
                  _hover={{
                    bg: 'whiteAlpha.400',
                    transform: 'translateY(-2px)',
                    boxShadow: 'xl',
                  }}
                  _active={{
                    bg: 'whiteAlpha.500',
                    transform: 'translateY(0)',
                  }}
                  onClick={() => navigate('/calendar', { state: { patientId: patient.id } })}
                  transition="all 0.2s"
                >
                  Nueva Cita
                </Button>
                <Button
                  leftIcon={<FiFileText />}
                  size="lg"
                  colorScheme="whiteAlpha"
                  bg="whiteAlpha.300"
                  backdropFilter="blur(10px)"
                  _hover={{
                    bg: 'whiteAlpha.400',
                    transform: 'translateY(-2px)',
                    boxShadow: 'xl',
                  }}
                  _active={{
                    bg: 'whiteAlpha.500',
                    transform: 'translateY(0)',
                  }}
                  onClick={() => navigate(`/patients/${patient.id}/notes/new`)}
                  transition="all 0.2s"
                >
                  Nueva Nota
                </Button>
                <IconButton
                  aria-label="Editar paciente"
                  icon={<FiEdit />}
                  size="lg"
                  colorScheme="whiteAlpha"
                  bg="whiteAlpha.300"
                  backdropFilter="blur(10px)"
                  _hover={{
                    bg: 'whiteAlpha.400',
                    transform: 'translateY(-2px)',
                    boxShadow: 'xl',
                  }}
                  _active={{
                    bg: 'whiteAlpha.500',
                    transform: 'translateY(0)',
                  }}
                  onClick={() =>
                    toast({
                      title: 'Editar paciente',
                      description: 'Función en desarrollo',
                      status: 'info',
                      duration: 2000,
                    })
                  }
                  transition="all 0.2s"
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
            <Tab>Consentimientos</Tab>
          </TabList>

          <TabPanels>
            {/* General Information Tab */}
            <TabPanel px={0} pt={6}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {/* Personal Information */}
                <Card
                  bg={cardBg}
                  borderRadius="2xl"
                  borderWidth="1px"
                  borderColor={borderColor}
                  transition="all 0.2s"
                  _hover={{
                    transform: 'translateY(-4px)',
                    shadow: 'xl',
                  }}
                >
                  <CardHeader bg={purpleHeaderBg} borderTopRadius="2xl">
                    <HStack spacing={3}>
                      <Box
                        bg="purple.500"
                        p={2}
                        borderRadius="lg"
                        color="white"
                      >
                        <Icon as={FiUser} boxSize={5} />
                      </Box>
                      <Heading size="md">Información Personal</Heading>
                    </HStack>
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
                <Card
                  bg={cardBg}
                  borderRadius="2xl"
                  borderWidth="1px"
                  borderColor={borderColor}
                  transition="all 0.2s"
                  _hover={{
                    transform: 'translateY(-4px)',
                    shadow: 'xl',
                  }}
                >
                  <CardHeader bg={blueHeaderBg} borderTopRadius="2xl">
                    <HStack spacing={3}>
                      <Box
                        bg="blue.500"
                        p={2}
                        borderRadius="lg"
                        color="white"
                      >
                        <Icon as={FiFile} boxSize={5} />
                      </Box>
                      <Heading size="md">Información Legal/Fiscal</Heading>
                    </HStack>
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
                  <Card
                    bg={cardBg}
                    borderRadius="2xl"
                    borderWidth="1px"
                    borderColor={borderColor}
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateY(-4px)',
                      shadow: 'xl',
                    }}
                  >
                    <CardHeader bg={greenHeaderBg} borderTopRadius="2xl">
                      <HStack justify="space-between">
                        <HStack spacing={3}>
                          <Box
                            bg="success.500"
                            p={2}
                            borderRadius="lg"
                            color="white"
                          >
                            <Icon as={FiFileText} boxSize={5} />
                          </Box>
                          <Heading size="md">Última Nota Médica</Heading>
                        </HStack>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (latestNote.status === 'draft') {
                              navigate(`/patients/${patient.id}/notes/${latestNote.id}/edit`);
                            } else {
                              handleViewNote(latestNote);
                            }
                          }}
                        >
                          {latestNote.status === 'draft' ? 'Editar' : 'Ver completa'}
                        </Button>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <VStack align="start" spacing={1}>
                          <HStack align="center" spacing={2}>
                            <Text fontWeight="bold">{latestNote.title}</Text>
                            {latestNote.status === 'signed' ? (
                              <Tooltip
                                label={`Firmado por ${latestNote.signedBy} el ${latestNote.signedAt ? format(new Date(latestNote.signedAt), "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es }) : ''}`}
                                placement="top"
                                hasArrow
                              >
                                <Badge colorScheme="green" fontSize="xs">
                                  Firmada
                                </Badge>
                              </Tooltip>
                            ) : (
                              <Badge colorScheme="orange" fontSize="xs">
                                Borrador
                              </Badge>
                            )}
                          </HStack>
                          <Badge colorScheme="blue">
                            {getNoteTypeLabel(latestNote.type)}
                          </Badge>
                        </VStack>
                        <Text fontSize="sm" color="gray.500" noOfLines={3}>
                          {latestNote.content.substring(0, 150)}...
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* Quick Links */}
                <Card
                  bg={cardBg}
                  borderRadius="2xl"
                  borderWidth="1px"
                  borderColor={borderColor}
                  transition="all 0.2s"
                  _hover={{
                    transform: 'translateY(-4px)',
                    shadow: 'xl',
                  }}
                >
                  <CardHeader bg={orangeHeaderBg} borderTopRadius="2xl">
                    <HStack spacing={3}>
                      <Box
                        bg="orange.500"
                        p={2}
                        borderRadius="lg"
                        color="white"
                      >
                        <Icon as={FiCalendar} boxSize={5} />
                      </Box>
                      <Heading size="md">Accesos Rápidos</Heading>
                    </HStack>
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
                        Crear Interrogatorio
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
              <VStack spacing={6} align="stretch">
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
                  groupedNotes.map(([dateKey, dateNotes], index) => {
                    const isExpanded = expandedDates.has(dateKey);
                    const noteCount = dateNotes.length;

                    return (
                      <Box key={dateKey}>
                        {/* Date Divider */}
                        <HStack spacing={4} mb={4}>
                          <Divider />
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color="gray.500"
                            whiteSpace="nowrap"
                          >
                            {format(new Date(dateKey), "d 'de' MMMM, yyyy", {
                              locale: es,
                            })}
                          </Text>
                          <Divider />
                        </HStack>

                        {/* Notes Stack */}
                        {isExpanded ? (
                          // Expanded view - show all notes in grid
                          <SimpleGrid
                            columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
                            spacing={4}
                          >
                            {dateNotes.map((note, noteIndex) => (
                              <motion.div
                                key={note.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: noteIndex * 0.05,
                                }}
                              >
                                <Card
                                  bg={cardBg}
                                  shadow="md"
                                  borderWidth="1px"
                                  borderColor={borderColor}
                                  maxW="280px"
                                  mx="auto"
                                  transition="all 0.2s"
                                  _hover={{
                                    transform: 'translateY(-4px)',
                                    shadow: 'lg',
                                    borderColor: 'purple.300',
                                  }}
                                  cursor="pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (note.status === 'draft') {
                                      navigate(`/patients/${patient.id}/notes/${note.id}/edit`);
                                    } else {
                                      handleViewNote(note);
                                    }
                                  }}
                                >
                                  <CardBody p={4}>
                                    <VStack spacing={3} align="stretch">
                          <HStack align="start" spacing={2} justify="space-between">
                            <VStack align="start" spacing={1} flex={1}>
                              <Heading size="sm" noOfLines={2}>
                                {note.title}
                              </Heading>
                              <HStack spacing={2} flexWrap="wrap">
                                <Badge colorScheme="blue" fontSize="xs">
                                  {getNoteTypeLabel(note.type)}
                                </Badge>
                                {note.status === 'signed' ? (
                                  <Tooltip
                                    label={`Firmado por ${note.signedBy} el ${note.signedAt ? format(new Date(note.signedAt), "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es }) : ''}`}
                                    placement="top"
                                    hasArrow
                                  >
                                    <Badge colorScheme="green" fontSize="xs">
                                      Firmada
                                    </Badge>
                                  </Tooltip>
                                ) : (
                                  <Badge colorScheme="orange" fontSize="xs">
                                    Borrador
                                  </Badge>
                                )}
                              </HStack>
                            </VStack>
                          </HStack>
                                      <Text fontSize="xs" color="gray.500">
                                        {format(
                                          new Date(note.createdAt),
                                          "d 'de' MMM, yyyy 'a las' HH:mm",
                                          { locale: es }
                                        )}
                                      </Text>
                                    </VStack>
                                  </CardBody>
                                </Card>
                              </motion.div>
                            ))}
                          </SimpleGrid>
                        ) : (
                          // Collapsed view - show stacked cards
                          <Box
                            position="relative"
                            cursor="pointer"
                            role="group"
                            maxW="280px"
                            mx="auto"
                          >
                            {dateNotes.map((note, noteIndex) => {
                              const isVisible = noteIndex < 3;
                              const offsetIndex = Math.min(noteIndex, 2);

                              return (
                                <motion.div
                                  key={note.id}
                                  initial={false}
                                  animate={{
                                    y: offsetIndex * 8,
                                    scale: 1 - offsetIndex * 0.02,
                                    opacity: isVisible ? 1 : 0,
                                  }}
                                  whileHover={
                                    noteIndex < 3
                                      ? {
                                          y: offsetIndex * 14,
                                          transition: { duration: 0.2 },
                                        }
                                      : {}
                                  }
                                  transition={{
                                    duration: 0.3,
                                    ease: 'easeOut',
                                  }}
                                  style={{
                                    position: noteIndex === 0 ? 'relative' : 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    zIndex: dateNotes.length - noteIndex,
                                  }}
                                  onClick={() => {
                                    if (note.status === 'draft') {
                                      navigate(`/patients/${patient.id}/notes/${note.id}/edit`);
                                    } else {
                                      toggleDateExpansion(dateKey);
                                    }
                                  }}
                                >
                                  <Card
                                    bg={cardBg}
                                    shadow={noteIndex === 0 ? 'lg' : 'md'}
                                    borderWidth={noteIndex > 0 ? '2px' : '1px'}
                                    borderColor={
                                      noteIndex > 0 ? 'brand.300' : borderColor
                                    }
                                  >
                                    <CardBody p={4}>
                                      <VStack spacing={3} align="stretch">
                                        <VStack align="start" spacing={1}>
                          <HStack align="start" spacing={2} justify="space-between" w="full">
                            <Heading size="sm" noOfLines={2} flex={1}>
                              {note.title}
                            </Heading>
                            {note.status === 'signed' ? (
                              <Tooltip
                                label={`Firmado por ${note.signedBy} el ${note.signedAt ? format(new Date(note.signedAt), "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es }) : ''}`}
                                placement="top"
                                hasArrow
                              >
                                <Badge colorScheme="green" fontSize="xs">
                                  Firmada
                                </Badge>
                              </Tooltip>
                            ) : (
                              <Badge colorScheme="orange" fontSize="xs">
                                Borrador
                              </Badge>
                            )}
                          </HStack>
                          <HStack spacing={2} flexWrap="wrap">
                            <Badge colorScheme="blue" fontSize="xs">
                              {getNoteTypeLabel(note.type)}
                            </Badge>
                          </HStack>
                                          <Text fontSize="xs" color="gray.500">
                                            {format(
                                              new Date(note.createdAt),
                                              "d 'de' MMM, yyyy 'a las' HH:mm",
                                              { locale: es }
                                            )}
                                          </Text>
                                        </VStack>
                                      </VStack>
                                    </CardBody>
                                  </Card>
                                </motion.div>
                              );
                            })}

                            {/* Show count indicator when collapsed */}
                            {noteCount > 1 && (
                              <Box
                                position="absolute"
                                bottom="-16px"
                                left="50%"
                                transform="translateX(-50%)"
                                zIndex={dateNotes.length + 1}
                                pointerEvents="none"
                              >
                                <Badge
                                  colorScheme="brand"
                                  fontSize="sm"
                                  px={4}
                                  py={2}
                                  borderRadius="full"
                                  boxShadow="lg"
                                >
                                  {noteCount} {noteCount === 1 ? 'nota' : 'notas'}
                                </Badge>
                              </Box>
                            )}
                          </Box>
                        )}

                        {/* Toggle button */}
                        <Box textAlign="center" mt={isExpanded ? 4 : 8}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleDateExpansion(dateKey)}
                          >
                            {isExpanded ? 'Colapsar' : 'Ver todas'}
                          </Button>
                        </Box>
                      </Box>
                    );
                  })
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

            {/* Consents Tab */}
            <TabPanel px={0} pt={6}>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg}>
                  <CardHeader>
                    <Heading size="md">Consentimientos del Paciente</Heading>
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      Vista de solo lectura de los consentimientos otorgados por el paciente.
                      Solo el paciente puede modificar sus consentimientos.
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {consentTypes.map((consent) => {
                        const isGranted = isConsentGranted(consent.id);

                        return (
                          <Card
                            key={consent.id}
                            variant="outline"
                            borderWidth="2px"
                            borderColor={isGranted ? 'green.300' : borderColor}
                            bg={isGranted ? 'green.50' : 'transparent'}
                          >
                            <CardBody>
                              <HStack spacing={4} align="start">
                                <Checkbox
                                  size="lg"
                                  colorScheme="green"
                                  isChecked={isGranted}
                                  isDisabled={true}
                                  pointerEvents="none"
                                />
                                <VStack
                                  align="start"
                                  spacing={1}
                                  flex={1}
                                  cursor="pointer"
                                  onClick={() => handleConsentClick(consent)}
                                >
                                  <HStack>
                                    <Text fontWeight="bold">{consent.name}</Text>
                                    {consent.isRequired && (
                                      <Badge colorScheme="red" fontSize="xs">
                                        Requerido
                                      </Badge>
                                    )}
                                    {isGranted && (
                                      <Badge colorScheme="green" fontSize="xs">
                                        Otorgado
                                      </Badge>
                                    )}
                                  </HStack>
                                  <Text fontSize="sm" color="gray.600">
                                    {consent.description}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    Categoría: {consent.category} • Versión:{' '}
                                    {consent.version}
                                  </Text>
                                  {isGranted && (
                                    <Text fontSize="xs" color="green.600" fontWeight="medium">
                                      Otorgado el{' '}
                                      {patientConsents
                                        .find(
                                          (pc) =>
                                            pc.consentTypeId === consent.id &&
                                            pc.status === 'granted'
                                        )
                                        ?.grantedAt &&
                                        format(
                                          new Date(
                                            patientConsents.find(
                                              (pc) =>
                                                pc.consentTypeId === consent.id &&
                                                pc.status === 'granted'
                                            )!.grantedAt!
                                          ),
                                          "d 'de' MMMM, yyyy 'a las' HH:mm",
                                          { locale: es }
                                        )}
                                    </Text>
                                  )}
                                </VStack>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleConsentClick(consent)}
                                >
                                  Ver detalles
                                </Button>
                              </HStack>
                            </CardBody>
                          </Card>
                        );
                      })}
                    </VStack>
                  </CardBody>
                </Card>
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
              <HStack align="center" spacing={2}>
                <Text>{selectedNote?.title}</Text>
                {selectedNote?.status === 'signed' ? (
                  <Tooltip
                    label={`Firmado por ${selectedNote.signedBy} el ${selectedNote.signedAt ? format(new Date(selectedNote.signedAt), "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es }) : ''}`}
                    placement="top"
                    hasArrow
                  >
                    <Badge colorScheme="green" fontSize="sm">
                      Firmada
                    </Badge>
                  </Tooltip>
                ) : (
                  <Badge colorScheme="orange" fontSize="sm">
                    Borrador
                  </Badge>
                )}
              </HStack>
              <HStack spacing={2}>
                <Badge colorScheme="blue">
                  {selectedNote && getNoteTypeLabel(selectedNote.type)}
                </Badge>
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
                '& ul, & ol': { ml: 6, mb: 4 },
                '& li': { mb: 1 },
                '& strong': { fontWeight: 'bold' },
                '& em': { fontStyle: 'italic' },
                '& a': { color: 'brand.500', textDecoration: 'underline' },
              }}
              dangerouslySetInnerHTML={{ __html: selectedNote?.content || '' }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Consent Detail Modal */}
      <Modal
        isOpen={isConsentModalOpen}
        onClose={onConsentModalClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <VStack align="start" spacing={2}>
              <HStack>
                <Text>{selectedConsent?.name}</Text>
                {selectedConsent?.isRequired && (
                  <Badge colorScheme="red" fontSize="sm">
                    Requerido
                  </Badge>
                )}
              </HStack>
              <Text fontSize="sm" fontWeight="normal" color="gray.500">
                {selectedConsent?.description}
              </Text>
              <HStack fontSize="xs" color="gray.500">
                <Text>Categoría: {selectedConsent?.category}</Text>
                <Text>•</Text>
                <Text>Versión: {selectedConsent?.version}</Text>
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
                '& p': { mb: 2, lineHeight: '1.6' },
                '& ul, & ol': { ml: 6, mb: 4 },
                '& li': { mb: 1 },
                '& strong': { fontWeight: 'bold' },
                '& em': { fontStyle: 'italic' },
                '& a': { color: 'brand.500', textDecoration: 'underline' },
              }}
            >
              <ReactMarkdown>{selectedConsent?.fullText || ''}</ReactMarkdown>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onConsentModalClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PatientDetail;
