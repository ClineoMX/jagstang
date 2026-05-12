import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  ButtonGroup,
  Container,
  Heading,
  HStack,
  VStack,
  Text,
  Button,
  Avatar,
  Badge,
  useColorModeValue,
  SimpleGrid,
  Divider,
  IconButton,
  useToast,
  useDisclosure,
  Tooltip,
  Icon,
  Checkbox,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import {
  FiCalendar,
  FiChevronDown,
  FiEdit,
  FiEdit3,
  FiPrinter,
  FiFileText,
  FiUser,
  FiClipboard,
  FiPhone,
  FiPlus,
  FiMoreVertical,
} from 'react-icons/fi';
import { FaWandMagicSparkles } from 'react-icons/fa6';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { usePatient, usePatients } from '../hooks/usePatients';
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
import PatientClinicalVitalsBar from '../components/PatientClinicalVitalsBar';
import { usePatientVitals } from '../hooks/usePatientVitals';
import Timeline, { type TimelineItem } from '../components/Timeline';
import FormDrawer from '../components/FormDrawer';
import StatusBadge from '../components/StatusBadge';
import NoteAttachmentsList from '../components/NoteAttachmentsList';
import { mergeNoteBodyForEditor } from '../utils/noteReceta';
import { normalizePatientSlug } from '../utils/patientSlug';
import InterrogationFormDrawer from '../components/InterrogationFormDrawer';
import PatientFormModal from '../components/PatientFormModal';
import { usePatientNotesSummary } from '../hooks/usePatientNotesSummary';
import StreamingMarkdown from '../components/StreamingMarkdown';
import SummaryLoadingSkeleton from '../components/SummaryLoadingSkeleton';
import type { Patient } from '../types';

const PatientDetail: React.FC = () => {
  const { patientSlug } = useParams<{ patientSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { doctor } = useAuth();
  const isWellness = (doctor?.role ?? '').toUpperCase() === 'WELLNESS';

  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const subColor = useColorModeValue('paper.700', 'paper.400');
  const inkStrong = useColorModeValue('paper.900', 'paper.50');
  const previewBodyBg = useColorModeValue('paper.50', 'paper.900');
  const consentGrantedBg = 'statusSoft.okBg';
  const consentGrantedBorder = 'statusSoft.okBorder';
  const consentGrantedText = 'statusSoft.okFg';
  const descriptionColor = useColorModeValue('paper.600', 'paper.300');
  /** Alinea divisores entre columnas (icono + título vs solo título) y con el borde 1px del card. */
  const cardSectionHeaderMinH = '48px';

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const formNoteViewerRef = React.useRef<FormNoteViewerHandle>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const notePreviewDocumentOk = useMemo(() => {
    if (!selectedNote || selectedNote.type !== 'document') return false;
    try {
      const parsed = JSON.parse(String(selectedNote.content || '{}'));
      return Boolean(parsed?.formId && Array.isArray(parsed?.fields));
    } catch {
      return false;
    }
  }, [selectedNote]);

  const handlePrintClinicalNotePdf = useCallback(() => {
    if (!selectedNote) return;
    const html = mergeNoteBodyForEditor(String(selectedNote.content || ''));
    const rawTitle = String(selectedNote.title || 'Nota');
    const meta =
      selectedNote.status === 'signed' && selectedNote.signedAt
        ? `Firmada el ${format(new Date(selectedNote.signedAt), "d 'de' MMM yyyy, HH:mm", { locale: es })}`
        : selectedNote.createdAt
          ? `Creada el ${format(new Date(selectedNote.createdAt), "d 'de' MMM yyyy, HH:mm", { locale: es })}`
          : '';
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const titleEsc = esc(rawTitle);
    const metaEsc = esc(meta);

    /** Evita `window.open` + `noopener` (devuelve null pero igual abre pestaña en blanco) y bloqueadores de popups. */
    const iframe = document.createElement('iframe');
    iframe.setAttribute('title', 'Impresión de nota');
    iframe.style.cssText =
      'position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0;pointer-events:none';
    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    const doc = iframe.contentDocument ?? win?.document;
    if (!win || !doc) {
      document.body.removeChild(iframe);
      toast({
        title: 'No se pudo preparar la impresión',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    const remove = () => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    };

    const runPrint = () => {
      try {
        win.focus();
        win.print();
      } catch {
        toast({
          title: 'Error al abrir el diálogo de impresión',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
      win.addEventListener('afterprint', remove, { once: true });
      window.setTimeout(remove, 90_000);
    };

    doc.open();
    doc.write(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<title>${titleEsc}</title>
<style>
  @page { margin: 16mm; }
  body { font-family: ui-monospace, 'Cascadia Code', 'Segoe UI Mono', monospace; font-size: 11pt; line-height: 1.6; color: #111827; max-width: 720px; margin: 0 auto; padding: 8px; }
  h1.note-title { font-size: 20pt; font-weight: 600; margin: 0 0 10pt; letter-spacing: -0.02em; }
  p.note-meta { font-size: 9pt; color: #4b5563; margin: 0 0 18pt; }
  main :where(h1) { font-size: 17pt; font-weight: 600; margin: 18pt 0 10pt; }
  main :where(h2) { font-size: 14pt; font-weight: 600; margin: 16pt 0 8pt; }
  main :where(h3) { font-size: 9pt; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280; margin: 16pt 0 8pt; }
  main :where(p) { margin: 0 0 10pt; }
  main :where(ul, ol) { margin: 0 0 12pt 1.25em; padding-left: 0.5em; }
  main :where(li) { margin-bottom: 4pt; }
  main :where(a) { color: #2563eb; }
  main :where(blockquote) { border-left: 3px solid #d1d5db; margin: 12pt 0; padding-left: 12pt; color: #4b5563; }
  main :where(hr) { border: none; border-top: 1px solid #e5e7eb; margin: 16pt 0; }
</style>
</head>
<body>
  <h1 class="note-title">${titleEsc}</h1>
  ${meta ? `<p class="note-meta">${metaEsc}</p>` : ''}
  <main>${html}</main>
</body>
</html>`);
    doc.close();

    requestAnimationFrame(() => {
      window.setTimeout(runPrint, 150);
    });
  }, [selectedNote, toast]);

  const { patients, loading: patientsLoading } = usePatients();
  const patientId = useMemo(() => {
    const raw = (patientSlug ?? '').trim().replace(/^#/, '');
    if (!raw) return undefined;
    const match = patients.find((p: Patient) => p.slug === raw || p.id === raw);
    if (match?.id) return match.id;
    const looksLikeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      raw
    );
    return looksLikeUuid ? raw : undefined;
  }, [patients, patientSlug]);

  const {
    patient,
    loading: patientLoading,
    error: patientError,
    refetch: refetchPatient,
  } = usePatient(patientId);
  const { notes, loading: notesLoading, createNote } = useNotes(patientId);
  const { appointments } = useAppointments();
  const {
    consents: patientConsents,
    loading: consentsLoading,
    error: consentsError,
  } = usePatientConsents(patientId);
  const {
    identity,
    exists: identityExists,
    loading: identityLoading,
    error: identityError,
    saveIdentity,
  } = usePatientIdentity(patientId);
  const {
    vitals,
    saving: vitalsSaving,
    error: vitalsError,
    addAllergy,
    removeAllergy,
    addChronicCondition,
    removeChronicCondition,
    addMedication,
    removeMedication,
    setBloodType,
  } = usePatientVitals(patientId);

  const notesSummary = usePatientNotesSummary(patientId);

  const patientPathBase = useMemo(() => {
    const slug =
      normalizePatientSlug(patient?.slug) ||
      normalizePatientSlug(patientSlug) ||
      patientId;
    return slug ? `/patients/${slug}` : '/patients';
  }, [patient?.slug, patientSlug, patientId]);

  // If user landed on /patients/{id}, replace URL with /patients/{slug} once available.
  useEffect(() => {
    const slug = patient?.slug?.trim();
    const raw = (patientSlug ?? '').trim().replace(/^#/, '');
    if (!slug || !raw || raw === slug) return;
    if (location.pathname.startsWith(`/patients/${raw}`)) {
      navigate(location.pathname.replace(`/patients/${raw}`, `/patients/${slug}`), {
        replace: true,
        state: location.state,
      });
    }
  }, [location.pathname, location.state, navigate, patient?.slug, patientSlug]);

  const {
    isOpen: isSummaryDrawerOpen,
    onOpen: onSummaryDrawerOpen,
    onClose: onSummaryDrawerClose,
  } = useDisclosure();

  const handleOpenSummaryDrawer = useCallback(() => {
    onSummaryDrawerOpen();
    void notesSummary.start();
  }, [onSummaryDrawerOpen, notesSummary.start]);

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

  const {
    isOpen: isInterrogationDrawerOpen,
    onOpen: onInterrogationDrawerOpen,
    onClose: onInterrogationDrawerClose,
  } = useDisclosure();

  const {
    isOpen: isPatientEditOpen,
    onOpen: onPatientEditOpen,
    onClose: onPatientEditClose,
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
  const hasInitialInterrogation = !!interrogatoryNote;
  const hasAtLeastOneExtraNote = notes.length > (hasInitialInterrogation ? 1 : 0);
  const canShowSummary = hasInitialInterrogation && hasAtLeastOneExtraNote;

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
    if (!patientId) return [];
    const fromNotes: TimelineItem[] = notes.map((n) => ({
      id: `note-${n.id}`,
      kind: n.status === 'signed' ? ('signed' as const) : ('draft' as const),
      date: new Date(n.createdAt),
      title: n.title,
      body:
        n.type === 'document'
          ? 'Formulario'
          : stripHtml(n.content).slice(0, 180),
      onClick: () => {
        if (n.status === 'draft') {
          navigate(`${patientPathBase}/notes/${n.id}/edit`);
        } else {
          handleViewNote(n);
        }
      },
    }));

    const fromAppointments: TimelineItem[] = appointments
      .filter((apt) => apt.patient_id === patientId)
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

    return [...fromNotes, ...fromAppointments];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, notes, appointments, patientPathBase]);

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

  // Avoid flashing "not found" while we're still resolving slug -> id.
  if (patientSlug && !patientId && patientsLoading) {
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

  const birthdate = identity?.birthdate || patient.dateOfBirth;
  const age = (() => {
    if (!birthdate) return null;
    const dob = new Date(birthdate);
    if (isNaN(dob.getTime())) return null;
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    const hadBirthdayThisYear =
      now.getMonth() > dob.getMonth() ||
      (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate());
    if (!hadBirthdayThisYear) years -= 1;
    return Math.max(0, years);
  })();

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

  const phone = patient.phone;

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
            {(() => {
              const gender = patient.gender || identity?.gender;
              if (!gender) return '';
              return ` · ${
                gender === 'male'
                  ? 'Hombre'
                  : gender === 'female'
                    ? 'Mujer'
                    : 'Otro'
              }`;
            })()}
            <br />
            {patient.slug?.trim()
              ? `Expediente #${patient.slug.toUpperCase()}`
              : 'Expediente'}
          </>
        }
        actions={
          <>
            {phone && (
              <>
                <IconButton
                  as="a"
                  href={`tel:${phone}`}
                  aria-label="Llamar"
                  icon={<FiPhone />}
                  variant="outline"
                  size="sm"
                  h="36px"
                  borderColor="line.strong"
                  color="text.strong"
                  bg={cardBg}
                  _hover={{ borderColor: 'paper.600' }}
                  display={{ base: 'inline-flex', md: 'none' }}
                />
                <Button
                  as="a"
                  href={`tel:${phone}`}
                  leftIcon={<FiPhone />}
                  variant="outline"
                  size="sm"
                  h="36px"
                  borderColor="line.strong"
                  color="text.strong"
                  bg={cardBg}
                  _hover={{ borderColor: 'paper.600' }}
                  display={{ base: 'none', md: 'inline-flex' }}
                >
                  Llamar
                </Button>
              </>
            )}
            <IconButton
              aria-label="Nueva cita"
              icon={<FiCalendar />}
              variant="outline"
              size="sm"
              h="36px"
              borderColor="line.strong"
              color="text.strong"
              bg={cardBg}
              onClick={() =>
                navigate('/calendar', { state: { patientId: patient.id } })
              }
              _hover={{ borderColor: 'paper.600' }}
              display={{ base: 'inline-flex', md: 'none' }}
            />
            <Button
              leftIcon={<FiCalendar />}
              variant="outline"
              size="sm"
              h="36px"
              borderColor="line.strong"
              color="text.strong"
              bg={cardBg}
              onClick={() =>
                navigate('/calendar', { state: { patientId: patient.id } })
              }
              _hover={{ borderColor: 'paper.600' }}
              display={{ base: 'none', md: 'inline-flex' }}
            >
              Nueva cita
            </Button>
            {canShowSummary && (
              <>
                <Tooltip label="Resumen del expediente" hasArrow placement="bottom">
                  <IconButton
                    aria-label="Resumen del expediente"
                    icon={<FaWandMagicSparkles />}
                    variant="outline"
                    size="sm"
                    h="36px"
                    borderColor="line.strong"
                    color="text.strong"
                    bg={cardBg}
                    onClick={handleOpenSummaryDrawer}
                    _hover={{ borderColor: 'paper.600' }}
                    display={{ base: 'inline-flex', md: 'none' }}
                  />
                </Tooltip>
                <Tooltip label="Resumen del expediente" hasArrow placement="bottom">
                  <Button
                    leftIcon={<FaWandMagicSparkles />}
                    variant="outline"
                    size="sm"
                    h="36px"
                    borderColor="line.strong"
                    color="text.strong"
                    bg={cardBg}
                    onClick={handleOpenSummaryDrawer}
                    _hover={{ borderColor: 'paper.600' }}
                    display={{ base: 'none', md: 'inline-flex' }}
                  >
                    Resumen
                  </Button>
                </Tooltip>
              </>
            )}
            <ButtonGroup isAttached size="sm" variant="solid">
              <Button
                leftIcon={<FiPlus />}
                h="36px"
                bg="brand.600"
                color="white"
                _hover={{ bg: 'brand.700' }}
                borderRightRadius={0}
                onClick={() => navigate(`${patientPathBase}/notes/new`)}
              >
                Nueva nota
              </Button>
              <Menu placement="bottom-end">
                <MenuButton
                  as={IconButton}
                  aria-label="Tipo de nota"
                  icon={<FiChevronDown />}
                  h="36px"
                  minW="32px"
                  bg="brand.600"
                  color="white"
                  _hover={{ bg: 'brand.700' }}
                  _active={{ bg: 'brand.700' }}
                  borderLeft="1px solid"
                  borderColor="brand.700"
                  borderLeftRadius={0}
                />
                <MenuList>
                  <MenuItem
                    icon={<FiEdit3 />}
                    onClick={() =>
                      navigate(`${patientPathBase}/notes/new`)
                    }
                  >
                    Nota de texto
                  </MenuItem>
                  <MenuItem
                    icon={<FiFileText />}
                    onClick={() =>
                      navigate(`${patientPathBase}/notes/new-form`)
                    }
                  >
                    Formulario
                  </MenuItem>
                </MenuList>
              </Menu>
            </ButtonGroup>
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
                <MenuItem icon={<FiEdit />} onClick={onPatientEditOpen}>
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

      <PatientClinicalVitalsBar
        vitals={vitals}
        patientBloodFallback={patient.bloodType ?? null}
        saving={vitalsSaving}
        vitalsError={vitalsError}
        onAddAllergy={addAllergy}
        onRemoveAllergy={removeAllergy}
        onAddChronic={addChronicCondition}
        onRemoveChronic={removeChronicCondition}
        onAddMedication={addMedication}
        onRemoveMedication={removeMedication}
        onSetBloodType={setBloodType}
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
              align="center"
              minH={cardSectionHeaderMinH}
              px={4}
              py={3}
              borderBottom="1px solid"
              borderColor={borderColor}
            >
              <HStack spacing={2} align="center">
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
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
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
                align="center"
                minH={cardSectionHeaderMinH}
                px={4}
                py={3}
                borderBottom="1px solid"
                borderColor={borderColor}
              >
                <HStack spacing={2} align="center">
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
                      onClick={onInterrogationDrawerOpen}
                    >
                      Crear interrogatorio
                    </Button>
                  </VStack>
                ) : (
                  <VStack align="stretch" spacing={3}>
                    <Text fontSize="13px" fontWeight={600} noOfLines={1}>
                      {interrogatoryNote.title}
                    </Text>
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
                        __html: mergeNoteBodyForEditor(
                          interrogatoryNote.content || ''
                        ),
                      }}
                    />
                    <NoteAttachmentsList
                      attachments={interrogatoryNote.attachments}
                      patientId={patient.id}
                    />
                    {!interrogatoryNote.isSigned && (
                      <Button
                        size="xs"
                        variant="outline"
                        alignSelf="flex-start"
                        onClick={() =>
                          navigate(
                            `${patientPathBase}/notes/${interrogatoryNote.id}`
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

        <Box pt="1px">
          <HStack
            spacing={2}
            minH={cardSectionHeaderMinH}
            py={3}
            mb={4}
            align="center"
            borderBottom="1px solid"
            borderColor={borderColor}
          >
            <Heading
              as="h2"
              fontSize="14px"
              fontWeight={600}
              letterSpacing="-0.01em"
              lineHeight="1.25"
              m={0}
            >
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
            color="text.muted"
            _hover={{ color: 'text.strong', bg: 'surface.hover' }}
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
                        <>
                          <FormNoteViewer
                            ref={formNoteViewerRef}
                            formId={formId}
                            values={fields}
                            title={selectedNote?.title}
                          />
                          <NoteAttachmentsList
                            attachments={selectedNote?.attachments}
                            patientId={patient.id}
                          />
                        </>
                      );
                    }
                  } catch {
                    /* invalid JSON */
                  }
                  return (
                    <Box>
                      <Text color={subColor} py={4} fontSize="sm">
                        Documento firmado. No se pudo cargar la vista previa.
                      </Text>
                      <NoteAttachmentsList
                        attachments={selectedNote?.attachments}
                        patientId={patient.id}
                      />
                    </Box>
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
                  fontFamily="mono"
                  fontSize="14px"
                  lineHeight="1.65"
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
                    __html: mergeNoteBodyForEditor(selectedNote?.content || ''),
                  }}
                />
                <NoteAttachmentsList
                  attachments={selectedNote?.attachments}
                  patientId={patient.id}
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
                color="text.strong"
                bg={cardBg}
                _hover={{ borderColor: 'paper.600' }}
                onClick={onClose}
              >
                Cerrar
              </Button>
              <HStack spacing={2}>
                {(notePreviewDocumentOk ||
                  (selectedNote && selectedNote.type !== 'document')) && (
                  <Button
                    size="sm"
                    h="36px"
                    variant="outline"
                    leftIcon={<FiPrinter />}
                    borderColor="line.strong"
                    color="text.strong"
                    bg={cardBg}
                    _hover={{ borderColor: 'paper.600' }}
                    onClick={async () => {
                      if (!selectedNote) return;
                      if (selectedNote.type === 'document') {
                        setIsDownloading(true);
                        try {
                          await formNoteViewerRef.current?.printPdf();
                        } finally {
                          setIsDownloading(false);
                        }
                      } else {
                        handlePrintClinicalNotePdf();
                      }
                    }}
                    isLoading={
                      selectedNote?.type === 'document' ? isDownloading : false
                    }
                    loadingText="Generando…"
                  >
                    Imprimir
                  </Button>
                )}
                {selectedNote?.status !== 'signed' && (
                  <Button
                    size="sm"
                    h="36px"
                    variant="outline"
                    leftIcon={<FiEdit />}
                    borderColor="line.strong"
                    color="text.strong"
                    bg={cardBg}
                    _hover={{ borderColor: 'paper.600' }}
                    onClick={() => {
                      onClose();
                      navigate(
                        `${patientPathBase}/notes/${selectedNote.id}/edit`
                      );
                    }}
                  >
                    Editar borrador
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
                      navigate(`${patientPathBase}/notes/new`, {
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

      <FormDrawer
        isOpen={isConsentsListModalOpen}
        onClose={onConsentsListModalClose}
        crumb={`Pacientes · ${patient.firstName} ${patient.lastName}`}
        title="Consentimientos de clínica"
        sub="Vista de solo lectura. Solo el paciente puede modificar sus consentimientos."
        size="lg"
        hideDefaultActions
        bodyFillHeight
      >
        <VStack spacing={4} align="stretch" flex={1} minH={0} w="full">
          {consentsLoading ? (
            <HStack justify="center" py={8}>
              <Spinner size="lg" colorScheme="brand" />
              <Text fontSize="sm" color={subColor}>
                Cargando consentimientos…
              </Text>
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
            <Text fontSize="sm" color={subColor} py={2}>
              No hay consentimientos registrados para este paciente.
            </Text>
          ) : (
            <VStack spacing={3} align="stretch" flex={1} minH={0} w="full">
              {patientConsents.map((consent) => {
                const isGranted = consent.isGranted && !consent.isRevoked;
                const statusLabel = isGranted
                  ? 'Otorgado'
                  : consent.isRevoked
                    ? 'Revocado'
                    : 'No otorgado';
                const statusTone = isGranted
                  ? 'green'
                  : consent.isRevoked
                    ? 'red'
                    : 'gray';

                return (
                  <Box
                    key={consent.id}
                    bg={isGranted ? consentGrantedBg : cardBg}
                    border="1px solid"
                    borderColor={isGranted ? consentGrantedBorder : borderColor}
                    borderRadius="10px"
                    px={4}
                    py={4}
                    cursor="pointer"
                    _hover={{ borderColor: isGranted ? consentGrantedBorder : 'paper.600' }}
                    onClick={() => handleConsentClick(consent)}
                  >
                    <HStack align="start" spacing={4}>
                      <Checkbox
                        size="lg"
                        colorScheme="green"
                        isChecked={isGranted}
                        isDisabled
                        pointerEvents="none"
                        mt="2px"
                      />
                      <Box flex={1} minW={0}>
                        <HStack spacing={2} align="center" mb={1}>
                          <Text fontWeight={600} fontSize="14px" noOfLines={1}>
                            {getConsentTypeLabel(consent.consentType)}
                          </Text>
                          <Badge
                            colorScheme={statusTone}
                            fontSize="10px"
                            letterSpacing="0.06em"
                            textTransform="uppercase"
                          >
                            {statusLabel}
                          </Badge>
                        </HStack>

                        {getConsentTypeDescription(consent.consentType) ? (
                          <Text
                            fontSize="13px"
                            color={descriptionColor}
                            lineHeight="1.45"
                            noOfLines={3}
                          >
                            {getConsentTypeDescription(consent.consentType)}
                          </Text>
                        ) : null}

                        {consent.grantedAt ? (
                          <Text
                            fontSize="12px"
                            color={isGranted ? consentGrantedText : subColor}
                            fontWeight={isGranted ? 600 : 500}
                            mt={2.5}
                          >
                            Otorgado el{' '}
                            {format(
                              new Date(consent.grantedAt),
                              "d 'de' MMMM, yyyy 'a las' HH:mm",
                              { locale: es }
                            )}
                          </Text>
                        ) : null}

                        {consent.expiresAt ? (
                          <Text fontSize="12px" color={subColor} mt={0.5}>
                            Expira:{' '}
                            {format(
                              new Date(consent.expiresAt),
                              "d 'de' MMM yyyy",
                              { locale: es }
                            )}
                          </Text>
                        ) : null}
                      </Box>

                      <Button
                        size="sm"
                        h="34px"
                        variant="ghost"
                        color="text.strong"
                        _hover={{ bg: 'blackAlpha.50' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConsentClick(consent);
                        }}
                        flexShrink={0}
                      >
                        Ver detalles
                      </Button>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          )}
        </VStack>
      </FormDrawer>

      <FormDrawer
        isOpen={isConsentModalOpen}
        onClose={onConsentModalClose}
        crumb={`Pacientes · ${patient.firstName} ${patient.lastName}`}
        title={
          selectedConsent
            ? getConsentTypeLabel(selectedConsent.consentType)
            : 'Detalle de consentimiento'
        }
        sub={
          selectedConsent
            ? getConsentTypeDescription(selectedConsent.consentType)
            : undefined
        }
        size="md"
        hideDefaultActions
      >
        {selectedConsent ? (
          <VStack align="stretch" spacing={4}>
            <HStack spacing={2} align="center">
              {selectedConsent.isGranted && !selectedConsent.isRevoked ? (
                <Badge
                  colorScheme="green"
                  fontSize="10px"
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                >
                  Otorgado
                </Badge>
              ) : selectedConsent.isRevoked ? (
                <Badge
                  colorScheme="red"
                  fontSize="10px"
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                >
                  Revocado
                </Badge>
              ) : (
                <Badge
                  colorScheme="gray"
                  fontSize="10px"
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                >
                  No otorgado
                </Badge>
              )}
            </HStack>

            <Box
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="10px"
              px={4}
              py={4}
            >
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                <VStack align="start" spacing={0}>
                  <Text
                    fontSize="11px"
                    fontFamily="mono"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color={labelColor}
                    fontWeight={500}
                  >
                    Otorgado el
                  </Text>
                  <Text
                    fontSize="13.5px"
                    fontWeight={600}
                    color="text.strong"
                    mt={1}
                  >
                    {selectedConsent.grantedAt
                      ? format(
                          new Date(selectedConsent.grantedAt),
                          "d 'de' MMMM, yyyy 'a las' HH:mm",
                          { locale: es }
                        )
                      : '—'}
                  </Text>
                </VStack>

                {selectedConsent.expiresAt ? (
                  <VStack align="start" spacing={0}>
                    <Text
                      fontSize="11px"
                      fontFamily="mono"
                      letterSpacing="0.08em"
                      textTransform="uppercase"
                      color={labelColor}
                      fontWeight={500}
                    >
                      Expira
                    </Text>
                    <Text
                      fontSize="13.5px"
                      fontWeight={600}
                      color="text.strong"
                      mt={1}
                    >
                      {format(
                        new Date(selectedConsent.expiresAt),
                        "d 'de' MMM yyyy",
                        { locale: es }
                      )}
                    </Text>
                  </VStack>
                ) : null}

                {selectedConsent.revokedAt ? (
                  <VStack align="start" spacing={0}>
                    <Text
                      fontSize="11px"
                      fontFamily="mono"
                      letterSpacing="0.08em"
                      textTransform="uppercase"
                      color={labelColor}
                      fontWeight={500}
                    >
                      Revocado el
                    </Text>
                    <Text fontSize="13.5px" fontWeight={700} color="red.600" mt={1}>
                      {format(
                        new Date(selectedConsent.revokedAt),
                        "d 'de' MMM yyyy",
                        { locale: es }
                      )}
                    </Text>
                  </VStack>
                ) : null}
              </SimpleGrid>

              <Divider my={4} borderColor={borderColor} />
              <Text fontSize="12px" color={subColor} fontFamily="mono">
                ID: {selectedConsent.id}
              </Text>
            </Box>

            <HStack justify="flex-end">
              <Button
                variant="outline"
                size="sm"
                h="36px"
                onClick={onConsentModalClose}
              >
                Cerrar
              </Button>
            </HStack>
          </VStack>
        ) : null}
      </FormDrawer>

      {canShowSummary && (
        <FormDrawer
          isOpen={isSummaryDrawerOpen}
          onClose={() => {
            notesSummary.stop();
            onSummaryDrawerClose();
          }}
          title="Resumen de expediente"
          sub="Generado a partir de las notas clínicas con asistencia de IA."
          size="lg"
          hideDefaultActions
          bodyFillHeight
        >
          <VStack align="stretch" spacing={4} flex={1} minH={0} w="full">
            {notesSummary.error ? (
              <Alert status="error" borderRadius="md" flexShrink={0}>
                <AlertIcon />
                <Text fontSize="sm">{notesSummary.error}</Text>
              </Alert>
            ) : null}
            <Box
              flex="1"
              minH={0}
              w="full"
              overflowY="auto"
              bg={previewBodyBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="8px"
              px={4}
              py={3}
            >
              {notesSummary.loading && !notesSummary.hasText ? (
                <SummaryLoadingSkeleton />
              ) : !notesSummary.hasText && !notesSummary.loading ? (
                <Text fontSize="13px" color={subColor}>
                  No hay resumen para mostrar. Cierra el panel y vuelve a abrirlo
                  con el botón Resumen del encabezado.
                </Text>
              ) : (
                <StreamingMarkdown
                  text={notesSummary.text}
                  isStreaming={notesSummary.loading}
                />
              )}
            </Box>
          </VStack>
        </FormDrawer>
      )}

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

      {patient && (
        <PatientFormModal
          isOpen={isPatientEditOpen}
          onClose={onPatientEditClose}
          patientId={patient.id}
          onSuccess={() => {
            void refetchPatient();
          }}
        />
      )}

      {!isWellness && patient && (
        <InterrogationFormDrawer
          isOpen={isInterrogationDrawerOpen}
          onClose={onInterrogationDrawerClose}
          patient={patient}
          identity={identity}
          noteTitle={`Interrogatorio inicial – ${patient.firstName} ${patient.lastName}`}
          onSave={async ({ content, title }) => {
            try {
              await createNote({
                content,
                type: 'interrogation',
                title,
              });
              toast({
                title: 'Borrador guardado',
                description:
                  'El interrogatorio se guardó como borrador. Puedes editarlo o firmarlo desde la nota.',
                status: 'success',
                duration: 4000,
                isClosable: true,
              });
            } catch (err: unknown) {
              const message =
                err && typeof err === 'object' && 'message' in err
                  ? String((err as { message: string }).message)
                  : 'No se pudo guardar el interrogatorio';
              toast({
                title: 'Error',
                description: message,
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
              throw err;
            }
          }}
        />
      )}
    </Container>
  );
};

export default PatientDetail;
