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
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import {
  FiCalendar,
  FiEdit,
  FiDownload,
  FiUser,
  FiClipboard,
  FiPhone,
  FiPlus,
  FiMoreVertical,
} from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { usePatient } from '../hooks/usePatients';
import { useNotes } from '../hooks/useNotes';
import { useAppointments } from '../hooks/useAppointments';
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
import FormNoteViewer, {
  type FormNoteViewerHandle,
} from '../components/FormNoteViewer';
import type { FormFieldValue } from '../components/FormNoteFiller';
import PhoneNumberField, {
  phoneNumberFieldUtils,
} from '../components/PhoneNumberField';
import { useAuth } from '../contexts/AuthContext';
import PageHead from '../components/PageHead';
import VitalsBar from '../components/VitalsBar';
import Timeline, { type TimelineItem } from '../components/Timeline';
import FormDrawer from '../components/FormDrawer';
import StatusBadge from '../components/StatusBadge';
import { getMockTimelineForPatient } from '../data/timelineMockData';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { doctor } = useAuth();
  const isWellness = (doctor?.role ?? '').toUpperCase() === 'WELLNESS';

  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const subColor = useColorModeValue('paper.700', 'paper.400');
  const inkStrong = useColorModeValue('paper.900', 'paper.50');
  const previewBodyBg = useColorModeValue('paper.50', 'paper.900');
  const consentGrantedBg = useColorModeValue('green.50', 'green.900');
  const consentGrantedBorder = useColorModeValue('green.300', 'green.700');
  const consentGrantedText = useColorModeValue('green.700', 'green.300');
  const descriptionColor = useColorModeValue('gray.600', 'gray.400');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const formNoteViewerRef = React.useRef<FormNoteViewerHandle>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    patient,
    profile,
    loading: patientLoading,
    error: patientError,
  } = usePatient(id);
  const { notes, loading: notesLoading } = useNotes(id);
  const { appointments } = useAppointments();
  const {
    consents: patientConsents,
    loading: consentsLoading,
    error: consentsError,
  } = usePatientConsents(id);
  const {
    identity,
    exists: identityExists,
    loading: identityLoading,
    error: identityError,
    saveIdentity,
  } = usePatientIdentity(id);

  const {
    isOpen: isConsentModalOpen,
    onOpen: onConsentModalOpen,
    onClose: onConsentModalClose,
  } = useDisclosure();
  const [selectedConsent, setSelectedConsent] =
    useState<PatientConsentItem | null>(null);

  const {
    isOpen: isConsentsListModalOpen,
    onOpen: onConsentsListModalOpen,
    onClose: onConsentsListModalClose,
  } = useDisclosure();

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

  const handleViewNote = (note: any) => {
    setSelectedNote(note);
    onOpen();
  };

  const timelineItems: TimelineItem[] = useMemo(() => {
    if (!id) return [];
    const fromNotes: TimelineItem[] = notes.map((n) => ({
      id: `note-${n.id}`,
      kind: n.status === 'signed' ? ('signed' as const) : ('draft' as const),
      date: new Date(n.createdAt),
      title: n.title,
      body:
        n.type === 'document'
          ? 'Documento / formulario'
          : stripHtml(n.content).slice(0, 180),
      onClick: () => {
        if (n.status === 'draft') {
          navigate(`/patients/${id}/notes/${n.id}/edit`);
        } else {
          handleViewNote(n);
        }
      },
    }));

    const fromAppointments: TimelineItem[] = appointments
      .filter((apt) => apt.patient_id === id)
      .map((apt) => {
        const start = new Date(apt.starts_at);
        const end = new Date(apt.ends_at);
        const mins = Math.max(
          0,
          Math.round((end.getTime() - start.getTime()) / 60000)
        );
        return {
          id: `apt-${apt.id}`,
          kind: 'event' as const,
          date: start,
          title: `Cita · ${format(start, 'HH:mm')}`,
          chips: [
            `${mins} min`,
            apt.status === 'CONFIRMED'
              ? 'Confirmada'
              : apt.status === 'PENDING'
                ? 'Pendiente'
                : apt.status === 'CANCELLED'
                  ? 'Cancelada'
                  : 'Completada',
          ],
          onClick: () => navigate('/calendar'),
        };
      });

    const mock = getMockTimelineForPatient(id).map((m) => ({
      id: m.id,
      kind: m.kind,
      date: new Date(m.date),
      title: m.title,
      body: m.body,
    }));

    return [...fromNotes, ...fromAppointments, ...mock];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, notes, appointments]);

  if (patientLoading) {
    return (
      <Container maxW="1280px" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Cargando paciente...</Text>
        </VStack>
      </Container>
    );
  }

  if (patientError || !patient) {
    return (
      <Container maxW="1280px" py={10}>
        <VStack spacing={4}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold">Error al cargar paciente</Text>
              <Text fontSize="sm">
                {patientError || 'Paciente no encontrado'}
              </Text>
            </VStack>
          </Alert>
          <Button onClick={() => navigate('/patients')}>
            Volver a pacientes
          </Button>
        </VStack>
      </Container>
    );
  }

  const age = patient.dateOfBirth
    ? Math.max(
        0,
        new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
      )
    : null;

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
      if (emergencyE164) normalizedForm.emergency_contact_phone = emergencyE164;
      else delete normalizedForm.emergency_contact_phone;
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

  const identityFields: {
    key: string;
    label: string;
    type?: 'text' | 'date' | 'select';
    options?: Record<string, string>;
  }[] = [
    { key: 'birthdate', label: 'Fecha de nacimiento', type: 'date' },
    { key: 'gender', label: 'Sexo', type: 'select', options: GENDER_LABELS },
    { key: 'nationality', label: 'Nacionalidad' },
    {
      key: 'marital_status',
      label: 'Estado civil',
      type: 'select',
      options: MARITAL_STATUS_LABELS,
    },
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

  const formatIdentityValue = (
    key: string,
    value: string | undefined
  ): string => {
    if (!value) return '—';
    if (key === 'gender') return GENDER_LABELS[value] ?? value;
    if (key === 'marital_status') return MARITAL_STATUS_LABELS[value] ?? value;
    if (key === 'birthdate') {
      try {
        return format(new Date(value), "d 'de' MMMM, yyyy", { locale: es });
      } catch {
        return value;
      }
    }
    return value;
  };

  const handleConsentClick = (consent: PatientConsentItem) => {
    setSelectedConsent(consent);
    onConsentModalOpen();
  };

  const phone = patient.phone || profile?.phone;

  return (
    <Container maxW="1280px" px={{ base: 5, md: 10 }} pt={7} pb={14}>
      <PageHead
        crumbs={
          <>
            Pacientes · {patient.firstName} {patient.lastName}
          </>
        }
        title={
          <HStack spacing={3} align="center">
            <Avatar
              size="sm"
              name={`${patient.firstName} ${patient.lastName}`}
              src={profile?.avatar_url?.trim() || undefined}
              bg="statusSoft.infoBg"
              color="brand.700"
              fontWeight={600}
            />
            <Text as="span">
              {patient.firstName} {patient.lastName}
            </Text>
          </HStack>
        }
        sub={
          <>
            {age !== null ? `${age} años` : 'Edad no registrada'}
            {patient.gender
              ? ` · ${
                  patient.gender === 'male'
                    ? 'Hombre'
                    : patient.gender === 'female'
                      ? 'Mujer'
                      : 'Otro'
                }`
              : ''}
            {` · Expediente #${patient.id.slice(0, 8).toUpperCase()}`}
          </>
        }
        actions={
          <>
            {phone && (
              <Button
                as="a"
                href={`tel:${phone}`}
                leftIcon={<FiPhone />}
                variant="outline"
                size="sm"
                h="36px"
                borderColor="line.strong"
                color="paper.800"
                bg={cardBg}
                _hover={{ borderColor: 'paper.600' }}
              >
                Llamar
              </Button>
            )}
            <Button
              leftIcon={<FiCalendar />}
              variant="outline"
              size="sm"
              h="36px"
              borderColor="line.strong"
              color="paper.800"
              bg={cardBg}
              onClick={() =>
                navigate('/calendar', { state: { patientId: patient.id } })
              }
              _hover={{ borderColor: 'paper.600' }}
            >
              Nueva cita
            </Button>
            <Button
              leftIcon={<FiPlus />}
              size="sm"
              h="36px"
              colorScheme="brand"
              bg="brand.600"
              color="white"
              _hover={{ bg: 'brand.700' }}
              onClick={() => navigate(`/patients/${patient.id}/notes/new`)}
            >
              Nueva nota
            </Button>
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Opciones del paciente"
                icon={<FiMoreVertical />}
                variant="outline"
                size="sm"
                h="36px"
                borderColor="line.strong"
              />
              <MenuList>
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
          </>
        }
      />

      <VitalsBar
        items={[
          { label: 'Alergias', value: 'No registradas' },
          { label: 'Crónicas', value: '—' },
          { label: 'Medicamentos', value: '—' },
          { label: 'Tipo sangre', value: patient.bloodType || '—' },
          { label: 'NOM %', value: '94%' },
        ]}
      />

      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', lg: '320px 1fr' }}
        gap={6}
        alignItems="start"
      >
        <VStack spacing={4} align="stretch">
          {/* Ficha de identidad */}
          <Box
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="8px"
            overflow="hidden"
          >
            <HStack
              justify="space-between"
              px={4}
              py={3}
              borderBottom="1px solid"
              borderColor={borderColor}
            >
              <HStack spacing={2}>
                <Icon as={FiUser} color="brand.600" />
                <Text fontSize="14px" fontWeight={600}>
                  Ficha de identidad
                </Text>
              </HStack>
              {identityExists && (
                <Button
                  size="xs"
                  variant="link"
                  color="brand.600"
                  onClick={handleOpenIdentityForm}
                >
                  Editar
                </Button>
              )}
            </HStack>
            <Box p={4}>
              {identityLoading ? (
                <HStack py={4} justify="center">
                  <Spinner size="sm" />
                  <Text fontSize="sm">Cargando…</Text>
                </HStack>
              ) : identityError ? (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">{identityError}</Text>
                </Alert>
              ) : !identityExists ? (
                <VStack spacing={3} py={3}>
                  <Text fontSize="13px" color={subColor} textAlign="center">
                    Aún no se ha registrado la ficha.
                  </Text>
                  <Button
                    size="xs"
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
                        <Text
                          fontFamily="mono"
                          fontSize="10.5px"
                          letterSpacing="0.06em"
                          textTransform="uppercase"
                          color={labelColor}
                        >
                          {label}
                        </Text>
                        <Text fontSize="12.5px" fontWeight={500}>
                          {formatIdentityValue(key, value)}
                        </Text>
                      </VStack>
                    );
                  })}
                </SimpleGrid>
              )}
            </Box>
          </Box>

          {!isWellness && (
            <Box
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="8px"
              overflow="hidden"
            >
              <HStack
                justify="space-between"
                px={4}
                py={3}
                borderBottom="1px solid"
                borderColor={borderColor}
              >
                <HStack spacing={2}>
                  <Icon as={FiClipboard} color="brand.600" />
                  <Text fontSize="14px" fontWeight={600}>
                    Interrogatorio inicial
                  </Text>
                </HStack>
              </HStack>
              <Box p={4}>
                {notesLoading ? (
                  <HStack py={4} justify="center">
                    <Spinner size="sm" />
                    <Text fontSize="sm">Cargando…</Text>
                  </HStack>
                ) : !interrogatoryNote ? (
                  <VStack spacing={3} py={3}>
                    <Text fontSize="13px" color={subColor} textAlign="center">
                      No se ha registrado un interrogatorio inicial.
                    </Text>
                    <Button
                      size="xs"
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
                    <HStack spacing={2}>
                      <Text
                        fontSize="13px"
                        fontWeight={600}
                        flex={1}
                        noOfLines={1}
                      >
                        {interrogatoryNote.title}
                      </Text>
                      {interrogatoryNote.status === 'signed' ? (
                        <Icon as={MdVerified} color="statusSoft.okFg" />
                      ) : (
                        <Icon as={FiEdit} color="statusSoft.warnFg" />
                      )}
                    </HStack>
                    {interrogatoryNote.createdAt && (
                      <Text fontSize="11.5px" color={labelColor}>
                        {format(
                          new Date(interrogatoryNote.createdAt),
                          "d 'de' MMM, yyyy 'a las' HH:mm",
                          { locale: es }
                        )}
                      </Text>
                    )}
                    <Box
                      fontSize="12.5px"
                      maxH="260px"
                      overflowY="auto"
                      sx={{
                        '& h1': { fontSize: 'sm', fontWeight: 600, mb: 2 },
                        '& h2': {
                          fontSize: 'sm',
                          fontWeight: 600,
                          mb: 1,
                          mt: 3,
                        },
                        '& p': { mb: 2 },
                        '& ul, & ol': { ml: 4, mb: 2 },
                        '& li': { mb: 1 },
                      }}
                      dangerouslySetInnerHTML={{
                        __html: interrogatoryNote.content,
                      }}
                    />
                    {!interrogatoryNote.isSigned && (
                      <Button
                        size="xs"
                        variant="outline"
                        alignSelf="flex-start"
                        onClick={() =>
                          navigate(
                            `/patients/${patient.id}/notes/${interrogatoryNote.id}`
                          )
                        }
                      >
                        Editar
                      </Button>
                    )}
                  </VStack>
                )}
              </Box>
            </Box>
          )}
        </VStack>

        <Box>
          <HStack
            spacing={3}
            mb={3}
            pb={2}
            align="center"
            borderBottom="1px solid"
            borderColor={borderColor}
          >
            <Heading as="h2" size="md" fontSize="16px" fontWeight={600}>
              Expediente clínico
            </Heading>
          </HStack>

          <Timeline items={timelineItems} />
        </Box>
      </Box>

      {/* Note View Modal — proto styled preview */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="10px"
          boxShadow="0 20px 60px -20px rgba(15, 23, 42, 0.25)"
          overflow="hidden"
        >
          <ModalCloseButton
            top="14px"
            right="14px"
            color="paper.600"
            _hover={{ color: 'paper.900', bg: 'paper.200' }}
          />
          <ModalHeader
            px={7}
            pt={6}
            pb={4}
            borderBottom="1px solid"
            borderColor={borderColor}
          >
            <Box pr={8}>
              <HStack spacing={3} mb={2} align="center">
                <Text
                  as="span"
                  fontFamily="mono"
                  fontSize="11px"
                  color={labelColor}
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                  fontWeight={500}
                >
                  {selectedNote?.type === 'document'
                    ? 'Documento'
                    : selectedNote?.type === 'interrogation'
                      ? 'Interrogatorio inicial'
                      : 'Nota clínica'}
                </Text>
                {selectedNote?.status === 'signed' ? (
                  <Tooltip
                    label={
                      selectedNote?.signedAt
                        ? `Firmada el ${format(
                            new Date(selectedNote.signedAt),
                            "d 'de' MMM, yyyy 'a las' HH:mm",
                            { locale: es }
                          )}`
                        : 'Firmada'
                    }
                    placement="top"
                    hasArrow
                  >
                    <Box as="span" display="inline-flex">
                      <StatusBadge tone="signed">Firmada</StatusBadge>
                    </Box>
                  </Tooltip>
                ) : (
                  <Tooltip
                    label={
                      selectedNote?.createdAt
                        ? `Borrador creado el ${format(
                            new Date(selectedNote.createdAt),
                            "d 'de' MMM, yyyy 'a las' HH:mm",
                            { locale: es }
                          )}`
                        : 'Borrador'
                    }
                    placement="top"
                    hasArrow
                  >
                    <Box as="span" display="inline-flex">
                      <StatusBadge tone="draft">Borrador</StatusBadge>
                    </Box>
                  </Tooltip>
                )}
              </HStack>
              <Heading
                as="h2"
                fontSize="22px"
                fontWeight={600}
                letterSpacing="-0.015em"
                lineHeight="1.25"
                color={inkStrong}
              >
                {selectedNote?.title}
              </Heading>
              {selectedNote && (
                <Text
                  fontFamily="mono"
                  fontSize="11.5px"
                  color={labelColor}
                  letterSpacing="0.04em"
                  mt={2}
                >
                  {selectedNote?.status === 'signed' && selectedNote?.signedAt
                    ? `Firmada · ${format(
                        new Date(selectedNote.signedAt),
                        "d 'de' MMM, yyyy · HH:mm",
                        { locale: es }
                      )}`
                    : selectedNote?.createdAt
                      ? `Creada · ${format(
                          new Date(selectedNote.createdAt),
                          "d 'de' MMM, yyyy · HH:mm",
                          { locale: es }
                        )}`
                      : null}
                </Text>
              )}
            </Box>
          </ModalHeader>
          <ModalBody px={0} py={0} bg={previewBodyBg}>
            {selectedNote?.type === 'document' ? (
              <Box px={7} py={6}>
                {(() => {
                  try {
                    const parsed = JSON.parse(selectedNote?.content || '{}');
                    const formId = parsed?.formId;
                    const fields: FormFieldValue[] = parsed?.fields ?? [];
                    if (formId && Array.isArray(fields)) {
                      return (
                        <FormNoteViewer
                          ref={formNoteViewerRef}
                          formId={formId}
                          values={fields}
                          title={selectedNote?.title}
                        />
                      );
                    }
                  } catch {
                    /* invalid JSON */
                  }
                  return (
                    <Text color={subColor} py={4} fontSize="sm">
                      Documento firmado. No se pudo cargar la vista previa.
                    </Text>
                  );
                })()}
              </Box>
            ) : (
              <Box px={7} py={6}>
                <Box
                  bg={cardBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="8px"
                  px={{ base: 6, md: 10 }}
                  py={{ base: 6, md: 8 }}
                  color={inkStrong}
                  fontSize="14.5px"
                  lineHeight="1.7"
                  sx={{
                    '& h1': {
                      fontSize: '22px',
                      fontWeight: 600,
                      letterSpacing: '-0.015em',
                      mt: 6,
                      mb: 3,
                      _first: { mt: 0 },
                    },
                    '& h2': {
                      fontSize: '17px',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                      mt: 6,
                      mb: 2,
                      _first: { mt: 0 },
                    },
                    '& h3': {
                      fontFamily: 'mono',
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: labelColor,
                      mt: 6,
                      mb: 2,
                      _first: { mt: 0 },
                    },
                    '& p': { mb: 3 },
                    '& ul, & ol': { ml: 6, mb: 4 },
                    '& li': { mb: 1 },
                    '& strong': { fontWeight: 600 },
                    '& em': { fontStyle: 'italic' },
                    '& a': {
                      color: 'brand.600',
                      textDecoration: 'underline',
                    },
                    '& blockquote': {
                      borderLeft: '3px solid',
                      borderColor: 'line.strong',
                      pl: 4,
                      color: subColor,
                      my: 4,
                    },
                    '& hr': {
                      borderColor: borderColor,
                      my: 5,
                    },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: selectedNote?.content || '',
                  }}
                />
              </Box>
            )}
          </ModalBody>
          <ModalFooter
            px={7}
            py={4}
            borderTop="1px solid"
            borderColor={borderColor}
            bg={cardBg}
          >
            <HStack justify="space-between" w="full">
              <Button
                variant="outline"
                size="sm"
                h="36px"
                borderColor="line.strong"
                color="paper.800"
                bg={cardBg}
                _hover={{ borderColor: 'paper.600' }}
                onClick={onClose}
              >
                Cerrar
              </Button>
              <HStack spacing={2}>
                {selectedNote?.status !== 'signed' && (
                  <Button
                    size="sm"
                    h="36px"
                    variant="outline"
                    leftIcon={<FiEdit />}
                    borderColor="line.strong"
                    color="paper.800"
                    bg={cardBg}
                    _hover={{ borderColor: 'paper.600' }}
                    onClick={() => {
                      onClose();
                      navigate(
                        `/patients/${patient.id}/notes/${selectedNote.id}/edit`
                      );
                    }}
                  >
                    Editar borrador
                  </Button>
                )}
                {selectedNote?.status === 'signed' &&
                  selectedNote?.type === 'document' && (
                    <Button
                      size="sm"
                      h="36px"
                      variant="outline"
                      leftIcon={<FiDownload />}
                      borderColor="line.strong"
                      color="paper.800"
                      bg={cardBg}
                      _hover={{ borderColor: 'paper.600' }}
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
                {selectedNote?.status === 'signed' && (
                  <Button
                    size="sm"
                    h="36px"
                    colorScheme="brand"
                    bg="brand.600"
                    color="white"
                    _hover={{ bg: 'brand.700' }}
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
                )}
              </HStack>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
            <Text fontSize="sm" color={subColor} fontWeight="normal" mt={2}>
              Vista de solo lectura. Solo el paciente puede modificar sus
              consentimientos.
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
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={0}>
                  <AlertTitle>Error al cargar consentimientos</AlertTitle>
                  <AlertDescription>{consentsError}</AlertDescription>
                </VStack>
              </Alert>
            ) : patientConsents.length === 0 ? (
              <Text color={subColor} py={4}>
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
                      borderColor={
                        isGranted ? consentGrantedBorder : borderColor
                      }
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
                              <Text
                                fontSize="xs"
                                color={consentGrantedText}
                                fontWeight="medium"
                              >
                                Otorgado el{' '}
                                {format(
                                  new Date(consent.grantedAt),
                                  "d 'de' MMMM, yyyy 'a las' HH:mm",
                                  { locale: es }
                                )}
                              </Text>
                            )}
                            {consent.expiresAt && (
                              <Text fontSize="xs" color={subColor}>
                                Expira:{' '}
                                {format(
                                  new Date(consent.expiresAt),
                                  "d 'de' MMM yyyy",
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
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

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
                  {selectedConsent
                    ? getConsentTypeLabel(selectedConsent.consentType)
                    : 'Detalle de consentimiento'}
                </Text>
                {selectedConsent &&
                  (selectedConsent.isGranted && !selectedConsent.isRevoked ? (
                    <Badge colorScheme="green" fontSize="sm">
                      Otorgado
                    </Badge>
                  ) : selectedConsent.isRevoked ? (
                    <Badge colorScheme="red" fontSize="sm">
                      Revocado
                    </Badge>
                  ) : (
                    <Badge colorScheme="gray" fontSize="sm">
                      No otorgado
                    </Badge>
                  ))}
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
                    <Text fontSize="xs" color={labelColor}>
                      Otorgado el
                    </Text>
                    <Text fontWeight="medium">
                      {selectedConsent.grantedAt
                        ? format(
                            new Date(selectedConsent.grantedAt),
                            "d 'de' MMMM, yyyy 'a las' HH:mm",
                            { locale: es }
                          )
                        : '—'}
                    </Text>
                  </VStack>
                  {selectedConsent.expiresAt && (
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" color={labelColor}>
                        Expira
                      </Text>
                      <Text fontWeight="medium">
                        {format(
                          new Date(selectedConsent.expiresAt),
                          "d 'de' MMM yyyy",
                          { locale: es }
                        )}
                      </Text>
                    </VStack>
                  )}
                  {selectedConsent.revokedAt && (
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" color={labelColor}>
                        Revocado el
                      </Text>
                      <Text fontWeight="medium" color="red.600">
                        {format(
                          new Date(selectedConsent.revokedAt),
                          "d 'de' MMM yyyy",
                          { locale: es }
                        )}
                      </Text>
                    </VStack>
                  )}
                </HStack>
                <Divider />
                <Text fontSize="xs" color={subColor}>
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

      <FormDrawer
        isOpen={isIdentityModalOpen}
        onClose={onIdentityModalClose}
        crumb={`Pacientes · ${patient.firstName} ${patient.lastName}`}
        title={
          identityExists
            ? 'Editar ficha de identidad'
            : 'Crear ficha de identidad'
        }
        sub="Datos sociodemográficos y contacto de emergencia."
        size="lg"
        submitLabel="Guardar"
        submitLoadingText="Guardando…"
        isSubmitting={isSavingIdentity}
        onSubmit={(e) => {
          e.preventDefault();
          void handleSaveIdentity();
        }}
      >
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
                <FormLabel
                  fontSize="11px"
                  fontFamily="mono"
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                  color={labelColor}
                  fontWeight={500}
                  mb={1.5}
                >
                  {field.label}
                </FormLabel>
                {field.type === 'select' && field.options ? (
                  <Select
                    size="sm"
                    h="36px"
                    borderColor="line.strong"
                    _hover={{ borderColor: 'paper.600' }}
                    _focus={{
                      borderColor: 'brand.500',
                      boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                    }}
                    placeholder="Seleccionar…"
                    value={identityForm[field.key] || ''}
                    onChange={(e) =>
                      setIdentityForm((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                  >
                    {Object.entries(field.options).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    size="sm"
                    h="36px"
                    borderColor="line.strong"
                    _hover={{ borderColor: 'paper.600' }}
                    _focus={{
                      borderColor: 'brand.500',
                      boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                    }}
                    type={field.type === 'date' ? 'date' : 'text'}
                    value={identityForm[field.key] || ''}
                    onChange={(e) =>
                      setIdentityForm((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                  />
                )}
              </FormControl>
            );
          })}
        </SimpleGrid>
      </FormDrawer>
    </Container>
  );
};

export default PatientDetail;
