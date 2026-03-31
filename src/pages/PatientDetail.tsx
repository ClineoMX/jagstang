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
  CardBody,
  useColorModeValue,
  SimpleGrid,
  Grid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
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
  FormControl,
  FormLabel,
  Input,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import {
  FiCalendar,
  FiFileText,
  FiEdit,
  FiFile,
  FiDownload,
  FiArrowLeft,
  FiUser,
  FiClipboard,
  FiTrendingUp,
  FiSearch,
  FiPaperclip,
  FiPhone,
  FiPlus,
  FiMoreVertical,
} from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import type { NoteType } from '../types';
import { usePatient } from '../hooks/usePatients';
import { useNotes } from '../hooks/useNotes';
import {
  usePatientConsents,
  getConsentTypeLabel,
  getConsentTypeDescription,
  type PatientConsentItem,
} from '../hooks/usePatientConsents';
import {
  usePatientIdentity,
  GENDER_LABELS,
  MARITAL_STATUS_LABELS,
  type PatientIdentity,
} from '../hooks/usePatientIdentity';
import { Spinner, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import FormNoteViewer, { type FormNoteViewerHandle } from '../components/FormNoteViewer';
import type { FormFieldValue } from '../components/FormNoteFiller';
import PhoneNumberField, { phoneNumberFieldUtils } from '../components/PhoneNumberField';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const consentGrantedBg = useColorModeValue('green.50', 'green.900');
  const consentGrantedBorder = useColorModeValue('green.300', 'green.700');
  const consentGrantedText = useColorModeValue('green.700', 'green.300');
  const descriptionColor = useColorModeValue('gray.600', 'gray.400');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const formNoteViewerRef = React.useRef<FormNoteViewerHandle>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Usar hooks de API
  const { patient, profile, loading: patientLoading, error: patientError } = usePatient(id);
  const { notes, loading: notesLoading } = useNotes(id);
  const { consents: patientConsents, loading: consentsLoading, error: consentsError } = usePatientConsents(id);
  const {
    identity,
    exists: identityExists,
    loading: identityLoading,
    error: identityError,
    saveIdentity,
  } = usePatientIdentity(id);

  // Consent modal (detail)
  const {
    isOpen: isConsentModalOpen,
    onOpen: onConsentModalOpen,
    onClose: onConsentModalClose,
  } = useDisclosure();
  const [selectedConsent, setSelectedConsent] = useState<PatientConsentItem | null>(null);

  // Consents list modal (view all consentimientos de clínica)
  const {
    isOpen: isConsentsListModalOpen,
    onOpen: onConsentsListModalOpen,
    onClose: onConsentsListModalClose,
  } = useDisclosure();

  // Identity form modal
  const {
    isOpen: isIdentityModalOpen,
    onOpen: onIdentityModalOpen,
    onClose: onIdentityModalClose,
  } = useDisclosure();

  const [identityForm, setIdentityForm] = useState<Record<string, string>>({});
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);
  const [emergencyPhone, setEmergencyPhone] = useState({
    countryIso2: 'MX',
    nationalNumber: '',
  });

  const interrogatoryNote = useMemo(
    () => notes.find((n) => n.type === 'interrogation'),
    [notes]
  );

  const timelineLineColor = useColorModeValue('gray.200', 'gray.600');

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
      case 'interrogation':
        return 'Detalles';
      case 'evolution':
        return 'Nota de Evolución';
      case 'exploration':
        return 'Exploración Física';
      case 'psychology-interrogation':
        return 'Psicología · Historia Clínica Inicial';
      case 'psychology-evolution':
        return 'Psicología · Nota de Sesión';
      case 'document':
        return 'Documento';
      default:
        return 'Nota Personalizada';
    }
  };

  const getNoteTypeIcon = (type: NoteType) => {
    switch (type) {
      case 'interrogation':
        return { icon: FiClipboard, color: 'purple.500', bg: 'purple.50' };
      case 'evolution':
        return { icon: FiTrendingUp, color: 'blue.500', bg: 'blue.50' };
      case 'exploration':
        return { icon: FiSearch, color: 'green.500', bg: 'green.50' };
      case 'psychology-interrogation':
        return { icon: FiClipboard, color: 'purple.500', bg: 'purple.50' };
      case 'psychology-evolution':
        return { icon: FiTrendingUp, color: 'blue.500', bg: 'blue.50' };
      case 'document':
        return { icon: FiFile, color: 'teal.500', bg: 'teal.50' };
      default:
        return { icon: FiFileText, color: 'gray.500', bg: 'gray.50' };
    }
  };

  const stripHtml = (html: string): string => {
    const withBreaks = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(
        /<\/(p|div|h[1-6]|li|tr|blockquote|section|article|header|footer|pre)>/gi,
        '\n'
      );
    const tmp = document.createElement('div');
    tmp.innerHTML = withBreaks;
    return (tmp.textContent || tmp.innerText || '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };


  const handleConsentClick = (consent: PatientConsentItem) => {
    setSelectedConsent(consent);
    onConsentModalOpen();
  };

  const handleOpenIdentityForm = () => {
    if (identity) {
      const form: Record<string, string> = {};
      for (const [key, value] of Object.entries(identity)) {
        if (value != null) form[key] = String(value);
      }
      setIdentityForm(form);
      const parsedEmergency = phoneNumberFieldUtils.splitE164ToCountry(
        form.emergency_contact_phone || ''
      );
      setEmergencyPhone({
        countryIso2: parsedEmergency.countryIso2,
        nationalNumber: parsedEmergency.national,
      });
    } else {
      setIdentityForm({});
      setEmergencyPhone({ countryIso2: 'MX', nationalNumber: '' });
    }
    onIdentityModalOpen();
  };

  const handleSaveIdentity = async () => {
    setIsSavingIdentity(true);
    try {
      const normalizedForm: Record<string, string> = { ...identityForm };
      const emergencyE164 = phoneNumberFieldUtils.toE164(
        emergencyPhone.countryIso2,
        emergencyPhone.nationalNumber
      );
      if (emergencyE164) {
        normalizedForm.emergency_contact_phone = emergencyE164;
      } else {
        delete normalizedForm.emergency_contact_phone;
      }
      await saveIdentity(normalizedForm);
      onIdentityModalClose();
      toast({
        title: identityExists ? 'Ficha actualizada' : 'Ficha creada',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'No se pudo guardar la ficha',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSavingIdentity(false);
    }
  };

  const identityFields: { key: string; label: string; type?: 'text' | 'date' | 'select'; options?: Record<string, string> }[] = [
    { key: 'birthdate', label: 'Fecha de nacimiento', type: 'date' },
    { key: 'gender', label: 'Sexo', type: 'select', options: GENDER_LABELS },
    { key: 'nationality', label: 'Nacionalidad' },
    { key: 'marital_status', label: 'Estado civil', type: 'select', options: MARITAL_STATUS_LABELS },
    { key: 'occupation', label: 'Ocupación' },
    { key: 'education_level', label: 'Nivel de estudios' },
    { key: 'education', label: 'Educación' },
    { key: 'religion', label: 'Religión' },
    { key: 'birthplace_city', label: 'Ciudad de nacimiento' },
    { key: 'birthplace_state', label: 'Estado de nacimiento' },
    { key: 'birthplace_country', label: 'País de nacimiento' },
    { key: 'residence_city', label: 'Ciudad de residencia' },
    { key: 'residence_state', label: 'Estado de residencia' },
    { key: 'residence_country', label: 'País de residencia' },
    { key: 'emergency_contact_name', label: 'Contacto de emergencia' },
    { key: 'emergency_contact_phone', label: 'Teléfono de emergencia' },
    { key: 'emergency_contact_relationship', label: 'Parentesco' },
  ];

  const formatIdentityValue = (key: string, value: string | undefined): string => {
    if (!value) return '—';
    if (key === 'gender') return GENDER_LABELS[value] ?? value;
    if (key === 'marital_status') return MARITAL_STATUS_LABELS[value] ?? value;
    if (key === 'birthdate') {
      try { return format(new Date(value), "d 'de' MMMM, yyyy", { locale: es }); } catch { return value; }
    }
    return value;
  };

  return (
    <Box>
      {/* Header with Gradient */}
      <Box
        bgGradient="linear(135deg, brand.400 0%, brand.600 100%)"
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
                  src={
                    profile?.avatar_url &&
                    profile.avatar_url.trim() !== ''
                      ? profile.avatar_url
                      : undefined
                  }
                  bg="whiteAlpha.300"
                  color="white"
                  borderWidth="4px"
                  borderColor="whiteAlpha.400"
                  sx={{
                    '& span': {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                    },
                  }}
                />
                <VStack align="start" spacing={2}>
                  <Heading size="xl">
                    {patient.firstName} {patient.lastName}
                  </Heading>
                  {(patient.phone || profile?.phone) && (
                    <Button
                      as="a"
                      href={`tel:${patient.phone || profile?.phone}`}
                      size="sm"
                      leftIcon={<FiPhone />}
                      colorScheme="whiteAlpha"
                      bg="whiteAlpha.300"
                      _hover={{ bg: 'whiteAlpha.400' }}
                    >
                      Llamar
                    </Button>
                  )}
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
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Opciones del paciente"
                    icon={<FiMoreVertical />}
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
                    transition="all 0.2s"
                  />
                  <MenuList color="gray.800" minW="220px">
                    <MenuItem
                      icon={<FiEdit />}
                      onClick={() =>
                        toast({
                          title: 'Editar paciente',
                          description: 'Función en desarrollo',
                          status: 'info',
                          duration: 2000,
                        })
                      }
                    >
                      Editar
                    </MenuItem>
                    <MenuItem
                      icon={<FiClipboard />}
                      onClick={onConsentsListModalOpen}
                    >
                      Ver consentimientos de clínica
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Content: dos columnas — izquierda Ficha + Interrogatorio (colapsables), derecha timeline */}
      <Container maxW="container.xl" py={8}>
        <Grid
          templateColumns={{ base: '1fr', lg: 'minmax(320px, 380px) 1fr' }}
          gap={8}
          alignItems="start"
        >
          {/* Columna izquierda: Ficha de Identidad e Interrogatorio (colapsables) */}
          <Box>
            <Accordion allowMultiple defaultIndex={[0, 1]} borderWidth="0" reduceMotion>
              <AccordionItem bg={cardBg} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} mb={4} overflow="hidden">
                <AccordionButton _expanded={{ borderBottom: '1px', borderColor }} px={5} py={4}>
                  <HStack spacing={3} flex={1} textAlign="left">
                    <Box bg="purple.50" p={2} borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                      <Icon as={FiUser} boxSize={5} color="purple.500" />
                    </Box>
                    <Heading size="md">Ficha de Identidad</Heading>
                  </HStack>
                  {identityExists && (
                    <Button
                      size="sm"
                      leftIcon={<FiEdit />}
                      colorScheme="brand"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenIdentityForm();
                      }}
                      mr={2}
                    >
                      Editar
                    </Button>
                  )}
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={5} pt={4} px={5}>
                  {identityLoading ? (
                    <HStack justify="center" py={6}>
                      <Spinner size="md" />
                      <Text>Cargando...</Text>
                    </HStack>
                  ) : identityError ? (
                    <Alert status="error" borderRadius="lg">
                      <AlertIcon />
                      {identityError}
                    </Alert>
                  ) : !identityExists ? (
                    <VStack spacing={4} py={4}>
                      <Icon as={FiUser} boxSize={10} color="gray.400" />
                      <Text color="gray.500" textAlign="center" fontSize="sm">
                        No se ha registrado la ficha de identidad del paciente.
                      </Text>
                      <Button
                        size="sm"
                        leftIcon={<FiPlus />}
                        colorScheme="brand"
                        variant="outline"
                        onClick={handleOpenIdentityForm}
                      >
                        Crear ficha
                      </Button>
                    </VStack>
                  ) : (
                    <SimpleGrid columns={2} spacing={3}>
                        {identityFields.map(({ key, label }) => {
                          const value = identity?.[key as keyof PatientIdentity];
                          if (!value) return null;
                          return (
                            <VStack key={key} align="start" spacing={0}>
                              <Text fontSize="xs" color="gray.500">{label}</Text>
                              <Text fontSize="sm" fontWeight="medium">
                                {formatIdentityValue(key, value)}
                              </Text>
                            </VStack>
                          );
                        })}
                      </SimpleGrid>
                  )}
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem bg={cardBg} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} overflow="hidden">
                <AccordionButton _expanded={{ borderBottom: '1px', borderColor }} px={5} py={4}>
                  <HStack spacing={3} flex={1} textAlign="left">
                    <Box bg="blue.50" p={2} borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                      <Icon as={FiClipboard} boxSize={5} color="blue.500" />
                    </Box>
                    <Heading size="md">Interrogatorio Inicial</Heading>
                  </HStack>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={5} pt={4} px={5}>
                  {notesLoading ? (
                    <HStack justify="center" py={6}>
                      <Spinner size="md" />
                      <Text>Cargando...</Text>
                    </HStack>
                  ) : !interrogatoryNote ? (
                    <VStack spacing={4} py={4}>
                      <Icon as={FiClipboard} boxSize={10} color="gray.400" />
                      <Text color="gray.500" textAlign="center" fontSize="sm">
                        No se ha registrado un interrogatorio inicial para este paciente.
                      </Text>
                      <Button
                        size="sm"
                        leftIcon={<FiPlus />}
                        colorScheme="brand"
                        variant="outline"
                        onClick={() =>
                          navigate(`/patients/${patient.id}/notes/new`, {
                            state: { type: 'interrogation' },
                          })
                        }
                      >
                        Crear interrogatorio
                      </Button>
                    </VStack>
                  ) : (
                    <VStack align="stretch" spacing={3}>
                      {!interrogatoryNote.isSigned && (
                        <Button
                          size="sm"
                          leftIcon={<FiEdit />}
                          colorScheme="brand"
                          variant="outline"
                          alignSelf="flex-start"
                          onClick={() =>
                            navigate(`/patients/${patient.id}/notes/${interrogatoryNote.id}`)
                          }
                        >
                          Editar
                        </Button>
                      )}
                      <HStack spacing={2}>
                        <Text fontWeight="semibold" fontSize="sm">
                          {interrogatoryNote.title}
                        </Text>
                        {interrogatoryNote.isSigned ? (
                          <Tooltip label="Firmada" placement="top" hasArrow>
                            <Box as="span" display="inline-flex" color="green.500" alignItems="center">
                              <Icon as={MdVerified} boxSize={4} />
                            </Box>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            label={interrogatoryNote.createdAt ? `Borrador creado el ${format(new Date(interrogatoryNote.createdAt), "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es })}` : 'Borrador'}
                            placement="top"
                            hasArrow
                          >
                            <Box as="span" display="inline-flex" color="orange.500" alignItems="center">
                              <Icon as={FiEdit} boxSize={4} />
                            </Box>
                          </Tooltip>
                        )}
                      </HStack>
                      {interrogatoryNote.createdAt && (
                        <Text fontSize="xs" color="gray.500">
                          Creado el{' '}
                          {format(new Date(interrogatoryNote.createdAt), "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es })}
                        </Text>
                      )}
                      <Divider />
                      <Box
                        maxH="400px"
                        overflowY="auto"
                        fontSize="sm"
                        sx={{
                          '& h1': { fontSize: 'xl', fontWeight: 'bold', mb: 3 },
                          '& h2': { fontSize: 'lg', fontWeight: 'bold', mb: 2, mt: 4 },
                          '& h3': { fontSize: 'md', fontWeight: 'semibold', mb: 1, mt: 3 },
                          '& p': { mb: 2 },
                          '& ul, & ol': { ml: 5, mb: 3 },
                          '& li': { mb: 1 },
                          '& strong': { fontWeight: 'bold' },
                        }}
                        dangerouslySetInnerHTML={{ __html: interrogatoryNote.content }}
                      />
                    </VStack>
                  )}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>

          {/* Columna derecha: Timeline del expediente */}
          <Box>
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
              <Box position="relative" pl={{ base: 8, md: 10 }}>
                <Box
                  position="absolute"
                  left={{ base: '15px', md: '19px' }}
                  top={0}
                  bottom={0}
                  width="2px"
                  bg={timelineLineColor}
                />
                <VStack spacing={6} align="stretch">
                  {notes.map((note, noteIndex) => {
                    const noteIcon = getNoteTypeIcon(note.type as NoteType);
                    const isDocument = note.type === 'document';
                    const plainContent = isDocument ? '' : stripHtml(note.content);
                    return (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: noteIndex * 0.05 }}
                      >
                        <Box position="relative">
                          <Tooltip label={getNoteTypeLabel(note.type)} placement="top" hasArrow>
                            <Box
                              position="absolute"
                              left={{ base: '-33px', md: '-37px' }}
                              top="20px"
                              w="32px"
                              h="32px"
                              borderRadius="full"
                              bg={noteIcon.bg}
                              border="2px solid"
                              borderColor={noteIcon.color}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              zIndex={1}
                            >
                              <Icon as={noteIcon.icon} color={noteIcon.color} boxSize={4} />
                            </Box>
                          </Tooltip>
                          <Card
                            bg={cardBg}
                            borderWidth="1px"
                            borderColor={borderColor}
                            borderRadius="xl"
                            shadow="sm"
                            minH={isDocument ? '88px' : '120px'}
                            transition="all 0.2s"
                            _hover={{
                              shadow: 'md',
                              borderColor: noteIcon.color,
                              transform: 'translateX(4px)',
                            }}
                            cursor="pointer"
                            onClick={() => {
                              if (note.status === 'draft') {
                                navigate(`/patients/${patient.id}/notes/${note.id}/edit`);
                              } else {
                                handleViewNote(note);
                              }
                            }}
                          >
                            <CardBody p={5}>
                              <VStack spacing={3} align="stretch">
                                <HStack justify="space-between" align="center" spacing={3}>
                                  <Heading size="sm" noOfLines={1} flex={1}>
                                    {note.title}
                                  </Heading>
                                  {note.status === 'signed' ? (
                                    <Tooltip
                                      label={note.signedAt ? `Firmada el ${format(new Date(note.signedAt), "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es })}` : 'Firmada'}
                                      placement="top"
                                      hasArrow
                                    >
                                      <Box as="span" display="inline-flex" color="green.500" alignItems="center" flexShrink={0}>
                                        <Icon as={MdVerified} boxSize={4} />
                                      </Box>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip
                                      label={note.createdAt ? `Borrador creado el ${format(new Date(note.createdAt), "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es })}` : 'Borrador'}
                                      placement="top"
                                      hasArrow
                                    >
                                      <Box as="span" display="inline-flex" color="orange.500" alignItems="center" flexShrink={0}>
                                        <Icon as={FiEdit} boxSize={4} />
                                      </Box>
                                    </Tooltip>
                                  )}
                                </HStack>
                                {plainContent && (
                                  <Text
                                    fontSize="sm"
                                    color="gray.600"
                                    noOfLines={3}
                                    lineHeight="tall"
                                    whiteSpace="pre-line"
                                  >
                                    {plainContent}
                                  </Text>
                                )}
                                <HStack justify="space-between" align="center" pt={1}>
                                  <Text fontSize="xs" color="gray.500">
                                    {format(
                                      new Date(note.createdAt),
                                      "d 'de' MMM, yyyy 'a las' HH:mm",
                                      { locale: es }
                                    )}
                                  </Text>
                                  {note.attachments && note.attachments.length > 0 && (
                                    <HStack spacing={1} color="gray.500">
                                      <Icon as={FiPaperclip} boxSize={3.5} />
                                      <Text fontSize="xs">
                                        {note.attachments.length}{' '}
                                        {note.attachments.length === 1 ? 'archivo' : 'archivos'}
                                      </Text>
                                    </HStack>
                                  )}
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        </Box>
                      </motion.div>
                    );
                  })}
                </VStack>
              </Box>
            )}
          </Box>
        </Grid>
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
                    label={selectedNote?.signedAt ? `Firmada el ${format(new Date(selectedNote.signedAt), "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es })}` : 'Firmada'}
                    placement="top"
                    hasArrow
                  >
                    <Box as="span" display="inline-flex" color="green.500" alignItems="center">
                      <Icon as={MdVerified} boxSize={5} />
                    </Box>
                  </Tooltip>
                ) : (
                  <Tooltip
                    label={selectedNote?.createdAt ? `Borrador creado el ${format(new Date(selectedNote.createdAt), "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es })}` : 'Borrador'}
                    placement="top"
                    hasArrow
                  >
                    <Box as="span" display="inline-flex" color="orange.500" alignItems="center">
                      <Icon as={FiEdit} boxSize={5} />
                    </Box>
                  </Tooltip>
                )}
              </HStack>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedNote?.type === 'document' ? (
              (() => {
                try {
                  const parsed = JSON.parse(selectedNote?.content || '{}');
                  const formId = parsed?.formId;
                  const fields: FormFieldValue[] = parsed?.fields ?? [];
                  if (formId && Array.isArray(fields)) {
                    return <FormNoteViewer ref={formNoteViewerRef} formId={formId} values={fields} title={selectedNote?.title} />;
                  }
                } catch { /* invalid JSON */ }
                return (
                  <Text color="gray.500" py={4}>
                    Documento firmado. No se pudo cargar la vista previa.
                  </Text>
                );
              })()
            ) : (
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
            )}
          </ModalBody>
          {selectedNote?.status === 'signed' && (
            <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
              <HStack spacing={3}>
                {selectedNote?.type === 'document' && (
                  <Button
                    leftIcon={<FiDownload />}
                    variant="outline"
                    colorScheme="brand"
                    onClick={async () => {
                      setIsDownloading(true);
                      try {
                        await formNoteViewerRef.current?.download();
                      } finally {
                        setIsDownloading(false);
                      }
                    }}
                    isLoading={isDownloading}
                    loadingText="Generando…"
                  >
                    Descargar PDF
                  </Button>
                )}
                <Button
                  colorScheme="brand"
                  leftIcon={<FiPlus />}
                  onClick={() => {
                    onClose();
                    navigate(`/patients/${patient.id}/notes/new`, {
                      state: { followUpFromNoteId: selectedNote.id },
                    });
                  }}
                >
                  Seguimiento
                </Button>
              </HStack>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>

      {/* Consents list modal (Ver consentimientos de clínica) */}
      <Modal
        isOpen={isConsentsListModalOpen}
        onClose={onConsentsListModalClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">Consentimientos de clínica</Heading>
            <Text fontSize="sm" color="gray.500" fontWeight="normal" mt={2}>
              Vista de solo lectura. Solo el paciente puede modificar sus consentimientos.
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {consentsLoading ? (
              <HStack justify="center" py={8}>
                <Spinner size="lg" colorScheme="brand" />
                <Text>Cargando consentimientos...</Text>
              </HStack>
            ) : consentsError ? (
              <Alert status="error" borderRadius="lg">
                <AlertIcon />
                <VStack align="start" spacing={0}>
                  <AlertTitle>Error al cargar consentimientos</AlertTitle>
                  <AlertDescription>{consentsError}</AlertDescription>
                </VStack>
              </Alert>
            ) : patientConsents.length === 0 ? (
              <Text color="gray.500" py={4}>
                No hay consentimientos registrados para este paciente.
              </Text>
            ) : (
              <VStack spacing={4} align="stretch">
                {patientConsents.map((consent) => {
                  const isGranted = consent.isGranted && !consent.isRevoked;
                  return (
                    <Card
                      key={consent.id}
                      variant="outline"
                      borderWidth="2px"
                      borderColor={isGranted ? consentGrantedBorder : borderColor}
                      bg={isGranted ? consentGrantedBg : 'transparent'}
                    >
                      <CardBody>
                        <HStack spacing={4} align="start">
                          <Checkbox
                            size="lg"
                            colorScheme="green"
                            isChecked={isGranted}
                            isDisabled
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
                              <Text fontWeight="bold">
                                {getConsentTypeLabel(consent.consentType)}
                              </Text>
                              {isGranted ? (
                                <Badge colorScheme="green" fontSize="xs">
                                  Otorgado
                                </Badge>
                              ) : consent.isRevoked ? (
                                <Badge colorScheme="red" fontSize="xs">
                                  Revocado
                                </Badge>
                              ) : (
                                <Badge colorScheme="gray" fontSize="xs">
                                  No otorgado
                                </Badge>
                              )}
                            </HStack>
                            {getConsentTypeDescription(consent.consentType) && (
                              <Text fontSize="sm" color={descriptionColor}>
                                {getConsentTypeDescription(consent.consentType)}
                              </Text>
                            )}
                            {consent.grantedAt && (
                              <Text fontSize="xs" color={consentGrantedText} fontWeight="medium">
                                Otorgado el{' '}
                                {format(new Date(consent.grantedAt), "d 'de' MMMM, yyyy 'a las' HH:mm", {
                                  locale: es,
                                })}
                              </Text>
                            )}
                            {consent.expiresAt && (
                              <Text fontSize="xs" color="gray.500">
                                Expira: {format(new Date(consent.expiresAt), "d 'de' MMM yyyy", { locale: es })}
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
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Consent Detail Modal */}
      <Modal
        isOpen={isConsentModalOpen}
        onClose={onConsentModalClose}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <VStack align="start" spacing={2}>
              <HStack>
                <Text>
                  {selectedConsent ? getConsentTypeLabel(selectedConsent.consentType) : 'Detalle de consentimiento'}
                </Text>
                {selectedConsent && (
                  selectedConsent.isGranted && !selectedConsent.isRevoked ? (
                    <Badge colorScheme="green" fontSize="sm">Otorgado</Badge>
                  ) : selectedConsent.isRevoked ? (
                    <Badge colorScheme="red" fontSize="sm">Revocado</Badge>
                  ) : (
                    <Badge colorScheme="gray" fontSize="sm">No otorgado</Badge>
                  )
                )}
              </HStack>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedConsent && (
              <VStack align="stretch" spacing={4}>
                {getConsentTypeDescription(selectedConsent.consentType) && (
                  <Text fontSize="sm" color={descriptionColor}>
                    {getConsentTypeDescription(selectedConsent.consentType)}
                  </Text>
                )}
                <HStack justify="space-between" wrap="wrap" gap={2}>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color="gray.500">Otorgado el</Text>
                    <Text fontWeight="medium">
                      {selectedConsent.grantedAt
                        ? format(new Date(selectedConsent.grantedAt), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })
                        : '—'}
                    </Text>
                  </VStack>
                  {selectedConsent.expiresAt && (
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" color="gray.500">Expira</Text>
                      <Text fontWeight="medium">
                        {format(new Date(selectedConsent.expiresAt), "d 'de' MMM yyyy", { locale: es })}
                      </Text>
                    </VStack>
                  )}
                  {selectedConsent.revokedAt && (
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" color="gray.500">Revocado el</Text>
                      <Text fontWeight="medium" color="red.600">
                        {format(new Date(selectedConsent.revokedAt), "d 'de' MMM yyyy", { locale: es })}
                      </Text>
                    </VStack>
                  )}
                </HStack>
                <Divider />
                <Text fontSize="xs" color="gray.500">
                  ID: {selectedConsent.id}
                </Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onConsentModalClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Identity Form Modal */}
      <Modal isOpen={isIdentityModalOpen} onClose={onIdentityModalClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {identityExists ? 'Editar Ficha de Identidad' : 'Crear Ficha de Identidad'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {identityFields.map((field) => {
                if (field.key === 'emergency_contact_phone') {
                  return (
                    <PhoneNumberField
                      key={field.key}
                      label={field.label}
                      value={emergencyPhone}
                      onChange={setEmergencyPhone}
                      e164Value={identityForm.emergency_contact_phone || ''}
                    />
                  );
                }
                return (
                  <FormControl key={field.key}>
                    <FormLabel fontSize="sm">{field.label}</FormLabel>
                    {field.type === 'select' && field.options ? (
                      <Select
                        size="sm"
                        placeholder="Seleccionar..."
                        value={identityForm[field.key] || ''}
                        onChange={(e) =>
                          setIdentityForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                      >
                        {Object.entries(field.options).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        size="sm"
                        type={field.type === 'date' ? 'date' : 'text'}
                        value={identityForm[field.key] || ''}
                        onChange={(e) =>
                          setIdentityForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                      />
                    )}
                  </FormControl>
                );
              })}
            </SimpleGrid>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onIdentityModalClose} isDisabled={isSavingIdentity}>
                Cancelar
              </Button>
              <Button
                colorScheme="brand"
                onClick={handleSaveIdentity}
                isLoading={isSavingIdentity}
                loadingText="Guardando..."
              >
                Guardar
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PatientDetail;
