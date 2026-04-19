import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Avatar,
  useToast,
  useColorModeValue,
  useBreakpointValue,
  Icon,
  IconButton,
  Tooltip,
  Checkbox,
  Heading,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiCalendar as FiCalendarIcon,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
} from 'react-icons/fi';
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  type View,
  type ToolbarProps,
} from 'react-big-calendar';
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addDays,
  addMonths,
  startOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppointments } from '../hooks/useAppointments';
import { usePatients } from '../hooks/usePatients';
import AppointmentFormModal from '../components/AppointmentFormModal';
import PageHead from '../components/PageHead';
import MiniCalendar from '../components/MiniCalendar';
import CalendarDayView from '../components/CalendarDayView';
import CalendarAgendaView from '../components/CalendarAgendaView';
import StatusBadge from '../components/StatusBadge';
import type { ApiAppointment } from '../types';

const locales = { es };

const CALENDAR_MIN = new Date(2000, 0, 1, 8, 0, 0);
const CALENDAR_MAX = new Date(2000, 0, 1, 22, 0, 0);

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales,
});

type ProtoView = 'day' | 'agenda' | 'week' | 'month';

function RbcEmptyToolbar(_: ToolbarProps<CalendarEvent, object>) {
  return null;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: ApiAppointment & { duration: number };
}

type StatusFilter = {
  confirmed: boolean;
  pending: boolean;
  cancelled: boolean;
};

const statusTone = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED':
      return 'confirm' as const;
    case 'COMPLETED':
      return 'signed' as const;
    case 'PENDING':
      return 'pending' as const;
    case 'CANCELLED':
      return 'cancel' as const;
    default:
      return 'neutral' as const;
  }
};

const statusLabel = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED':
      return 'Confirmada';
    case 'COMPLETED':
      return 'Completada';
    case 'PENDING':
      return 'Pendiente';
    case 'CANCELLED':
      return 'Cancelada';
    default:
      return status ?? '';
  }
};

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const {
    appointments,
    createAppointment,
    updateAppointmentStatus,
    deleteAppointment,
  } = useAppointments();
  const { patients } = usePatients();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isNewOpen,
    onOpen: onNewOpen,
    onClose: onNewClose,
  } = useDisclosure();
  const {
    isOpen: isCancelOpen,
    onOpen: onCancelOpen,
    onClose: onCancelClose,
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [slotDate, setSlotDate] = useState<string>('');
  const [slotTime, setSlotTime] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [initialPatientId, setInitialPatientId] = useState<string | undefined>(
    undefined
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [view, setView] = useState<ProtoView>('day');
  const [currentDate, setCurrentDate] = useState<Date>(() =>
    startOfDay(new Date())
  );
  const [miniMonth, setMiniMonth] = useState<Date>(() => new Date());
  const [filters, setFilters] = useState<StatusFilter>({
    confirmed: true,
    pending: true,
    cancelled: true,
  });

  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const mutedColor = useColorModeValue('paper.700', 'paper.400');

  const patientsMap = useMemo(
    () => Object.fromEntries(patients.map((p) => [p.id, p])),
    [patients]
  );

  const patientName = (id: string) => {
    const p = patientsMap[id];
    return p ? `${p.firstName} ${p.lastName}` : 'Paciente';
  };
  const patientMeta = (id: string) => {
    const p = patientsMap[id];
    if (!p) return '';
    return p.isRecurrent ? 'Recurrente' : 'Primera vez';
  };

  const initialPatientIdFromRoute = (
    location.state as { patientId?: string } | null
  )?.patientId;

  useEffect(() => {
    if (initialPatientIdFromRoute) {
      setInitialPatientId(initialPatientIdFromRoute);
      onNewOpen();
      navigate('/calendar', { replace: true, state: {} });
    }
  }, [initialPatientIdFromRoute, onNewOpen, navigate]);

  const passesFilter = (apt: ApiAppointment) => {
    const s = apt.status?.toUpperCase();
    if (s === 'CANCELLED') return filters.cancelled;
    if (s === 'PENDING') return filters.pending;
    return filters.confirmed; // CONFIRMED / COMPLETED share the "Confirmadas" toggle
  };

  const filteredAppointments = useMemo(
    () => appointments.filter(passesFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appointments, filters]
  );

  const events: CalendarEvent[] = useMemo(() => {
    return filteredAppointments.map((apt) => {
      const start = new Date(apt.starts_at);
      const end = new Date(apt.ends_at);
      const duration = Math.round((end.getTime() - start.getTime()) / 60000);
      return {
        id: apt.id,
        title: patientName(apt.patient_id),
        start,
        end,
        resource: { ...apt, duration },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredAppointments, patientsMap]);

  const daysWithEvents = useMemo(() => {
    const s = new Set<string>();
    for (const apt of filteredAppointments) {
      s.add(format(new Date(apt.starts_at), 'yyyy-MM-dd'));
    }
    return s;
  }, [filteredAppointments]);

  const openEvent = (apt: ApiAppointment) => {
    const ev = events.find((e) => e.id === apt.id);
    if (ev) {
      setSelectedEvent(ev);
      onOpen();
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    onOpen();
  };

  const handleNewAppointmentClick = () => {
    setSlotDate('');
    setSlotTime('');
    setInitialPatientId(undefined);
    onNewOpen();
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSlotDate(format(slotInfo.start, 'yyyy-MM-dd'));
    setSlotTime(format(slotInfo.start, 'HH:mm'));
    setInitialPatientId(undefined);
    onNewOpen();
  };

  const handleConfirmAppointment = async () => {
    if (!selectedEvent) return;
    setIsUpdatingStatus(true);
    try {
      await updateAppointmentStatus(selectedEvent.id, 'CONFIRMED');
      toast({
        title: 'Cita confirmada',
        description: 'La cita ha sido confirmada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message ?? 'No se pudo confirmar la cita',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRequestCancelAppointment = () => {
    if (!selectedEvent) return;
    onCancelOpen();
  };

  const handleConfirmCancelAppointment = async () => {
    if (!selectedEvent) return;
    setIsCancelling(true);
    try {
      await deleteAppointment(selectedEvent.id);
      toast({
        title: 'Cita cancelada',
        description: 'La cita ha sido cancelada',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      onCancelClose();
      onClose();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message ?? 'No se pudo cancelar la cita',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const patient = selectedEvent
    ? patientsMap[selectedEvent.resource.patient_id]
    : null;

  const handleNavPrev = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, -1));
    else if (view === 'week') setCurrentDate(addDays(currentDate, -7));
    else if (view === 'agenda') setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(addDays(currentDate, -1));
  };
  const handleNavNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addDays(currentDate, 7));
    else if (view === 'agenda') setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addDays(currentDate, 1));
  };
  const handleToday = () => {
    const d = startOfDay(new Date());
    setCurrentDate(d);
    setMiniMonth(d);
  };

  const longDateLabel = useMemo(() => {
    if (view === 'day')
      return format(currentDate, "EEEE d 'de' MMMM", { locale: es });
    if (view === 'week') {
      const start = startOfWeek(currentDate, { locale: es, weekStartsOn: 1 });
      const end = addDays(start, 6);
      const sameMonth = start.getMonth() === end.getMonth();
      const fmtS = sameMonth ? 'd' : 'd MMM';
      return `${format(start, fmtS, { locale: es })} – ${format(end, 'd MMM yyyy', { locale: es })}`;
    }
    if (view === 'agenda') {
      const end = addDays(currentDate, 6);
      return `${format(currentDate, 'd MMM', { locale: es })} – ${format(end, 'd MMM yyyy', { locale: es })}`;
    }
    return format(currentDate, 'MMMM yyyy', { locale: es });
  }, [view, currentDate]);

  const shortDateLabel = useMemo(() => {
    if (view === 'day') return format(currentDate, 'd MMM', { locale: es });
    if (view === 'week') {
      const start = startOfWeek(currentDate, { locale: es, weekStartsOn: 1 });
      const end = addDays(start, 6);
      return `${format(start, 'd', { locale: es })}–${format(end, 'd MMM', { locale: es })}`;
    }
    if (view === 'agenda') {
      const end = addDays(currentDate, 6);
      return `${format(currentDate, 'd', { locale: es })}–${format(end, 'd MMM', { locale: es })}`;
    }
    return format(currentDate, 'MMM yyyy', { locale: es });
  }, [view, currentDate]);

  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  useEffect(() => {
    if (isMobile && (view === 'week' || view === 'month')) {
      setView('day');
    }
  }, [isMobile, view]);

  const viewOptions: Array<{ id: ProtoView; label: string }> = [
    { id: 'day', label: 'Día' },
    { id: 'agenda', label: 'Agenda' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mes' },
  ];

  const rbcView: View = view === 'week' ? 'week' : 'month';

  const rbcEventStyle = (event: CalendarEvent) => {
    const s = event.resource.status?.toUpperCase();
    let bg = '#8890a0';
    if (s === 'CONFIRMED' || s === 'COMPLETED') bg = '#2f6b4a';
    else if (s === 'PENDING') bg = '#9a6a17';
    else if (s === 'CANCELLED') bg = '#a6392e';
    return {
      style: {
        backgroundColor: bg,
        borderRadius: '4px',
        opacity: 0.92,
        color: 'white',
        border: 'none',
        fontSize: '12px',
        padding: '3px 6px',
        fontWeight: 500,
      },
    };
  };

  return (
    <Container maxW="1280px" px={{ base: 5, md: 10 }} pt={7} pb={14}>
      <PageHead
        crumbs="Calendario"
        title="Agenda"
        sub={`Vista ${viewOptions.find((v) => v.id === view)?.label.toLowerCase() ?? ''}`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              h="36px"
              leftIcon={<FiDownload />}
              borderColor="line.strong"
              color="paper.800"
              bg={cardBg}
              isDisabled
              _hover={{ borderColor: 'paper.600' }}
            >
              Importar
            </Button>
            <Button
              leftIcon={<FiPlus />}
              size="sm"
              h="36px"
              colorScheme="brand"
              bg="brand.600"
              color="white"
              _hover={{ bg: 'brand.700' }}
              onClick={handleNewAppointmentClick}
            >
              Nueva cita
            </Button>
          </>
        }
      />

      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', lg: '260px 1fr' }}
        gap={5}
        alignItems="start"
      >
        <VStack spacing={4} align="stretch">
          <Box
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="8px"
            p="14px"
          >
            <MiniCalendar
              month={miniMonth}
              selected={currentDate}
              daysWithEvents={daysWithEvents}
              onChangeMonth={setMiniMonth}
              onSelect={(d) => {
                setCurrentDate(d);
                setMiniMonth(d);
              }}
            />
          </Box>
          <Box
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="8px"
          >
            <Box
              px="14px"
              py="10px"
              borderBottom="1px solid"
              borderColor={borderColor}
            >
              <Text
                fontFamily="mono"
                fontSize="10.5px"
                letterSpacing="0.08em"
                textTransform="uppercase"
                color={mutedColor}
              >
                Filtros
              </Text>
            </Box>
            <VStack align="stretch" spacing={2} p="14px">
              <Checkbox
                colorScheme="brand"
                isChecked={filters.confirmed}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, confirmed: e.target.checked }))
                }
              >
                <Text fontSize="13px">Confirmadas</Text>
              </Checkbox>
              <Checkbox
                colorScheme="brand"
                isChecked={filters.pending}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, pending: e.target.checked }))
                }
              >
                <Text fontSize="13px">Pendientes</Text>
              </Checkbox>
              <Checkbox
                colorScheme="brand"
                isChecked={filters.cancelled}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, cancelled: e.target.checked }))
                }
              >
                <Text fontSize="13px">Canceladas</Text>
              </Checkbox>
            </VStack>
          </Box>
        </VStack>

        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="8px"
          overflow="hidden"
        >
          <Flex
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={3}
            px={{ base: 3, md: '18px' }}
            py="12px"
            borderBottom="1px solid"
            borderColor={borderColor}
          >
            <HStack spacing={3} minW={0} flex={{ base: '1 1 auto', md: '0 1 auto' }}>
              <Button
                size="xs"
                h="30px"
                px="12px"
                variant="outline"
                borderColor="line.strong"
                onClick={handleToday}
              >
                Hoy
              </Button>
              <HStack spacing={1}>
                <IconButton
                  aria-label="Anterior"
                  icon={<FiChevronLeft />}
                  size="xs"
                  variant="outline"
                  w="30px"
                  h="30px"
                  borderColor="line.strong"
                  onClick={handleNavPrev}
                />
                <IconButton
                  aria-label="Siguiente"
                  icon={<FiChevronRight />}
                  size="xs"
                  variant="outline"
                  w="30px"
                  h="30px"
                  borderColor="line.strong"
                  onClick={handleNavNext}
                />
              </HStack>
              <Text
                fontSize={{ base: '13px', md: '15px' }}
                fontWeight={600}
                textTransform="capitalize"
                ml={1}
                noOfLines={1}
                display={{ base: 'none', sm: 'block' }}
              >
                {longDateLabel}
              </Text>
              <Text
                fontSize="13px"
                fontWeight={600}
                textTransform="capitalize"
                ml={1}
                noOfLines={1}
                display={{ base: 'block', sm: 'none' }}
              >
                {shortDateLabel}
              </Text>
            </HStack>
            <HStack
              spacing={0}
              border="1px solid"
              borderColor="line.strong"
              borderRadius="6px"
              overflow="hidden"
              bg={cardBg}
              flexShrink={0}
            >
              {viewOptions.map((v, i) => {
                const on = v.id === view;
                const hideOnMobile = v.id === 'week' || v.id === 'month';
                return (
                  <Box
                    key={v.id}
                    as="button"
                    onClick={() => setView(v.id)}
                    px="12px"
                    py="6px"
                    fontSize="12px"
                    fontWeight={500}
                    color={on ? 'white' : 'paper.700'}
                    bg={on ? 'brand.600' : 'transparent'}
                    borderRight={
                      i < viewOptions.length - 1 ? '1px solid' : 'none'
                    }
                    borderColor="line.strong"
                    _hover={!on ? { bg: 'paper.200', color: 'paper.900' } : {}}
                    display={
                      hideOnMobile
                        ? { base: 'none', md: 'block' }
                        : 'block'
                    }
                  >
                    {v.label}
                  </Box>
                );
              })}
            </HStack>
          </Flex>

          {view === 'day' && (
            <CalendarDayView
              day={currentDate}
              appointments={filteredAppointments}
              patientName={patientName}
              onSelect={openEvent}
            />
          )}

          {view === 'agenda' && (
            <CalendarAgendaView
              from={currentDate}
              days={7}
              appointments={filteredAppointments}
              patientName={patientName}
              patientMeta={patientMeta}
              onSelect={openEvent}
            />
          )}

          {(view === 'week' || view === 'month') && (
            <Box
              px={{ base: 3, md: 4 }}
              py={3}
              sx={{
                '& .rbc-calendar': { fontFamily: 'inherit' },
                '& .rbc-header': {
                  padding: '10px 4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'paper.700',
                  borderBottom: '1px solid',
                  borderColor: borderColor,
                  textTransform: 'capitalize',
                },
                '& .rbc-today': { backgroundColor: 'statusSoft.infoBg' },
                '& .rbc-off-range-bg': { backgroundColor: 'paper.100' },
                '& .rbc-date-cell': { padding: '6px 8px', fontSize: '12.5px' },
                '& .rbc-event': { padding: '3px 6px', borderRadius: '4px' },
                '& .rbc-month-view, & .rbc-time-view': {
                  border: '1px solid',
                  borderColor: borderColor,
                  borderRadius: '6px',
                  overflow: 'hidden',
                },
                '& .rbc-day-bg, & .rbc-month-row, & .rbc-header + .rbc-header':
                  {
                    borderColor: borderColor,
                  },
                '& .rbc-time-header-content, & .rbc-time-header-gutter': {
                  borderColor: borderColor,
                },
              }}
            >
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 640 }}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                views={['month', 'week']}
                view={rbcView}
                onView={() => {
                  /* controlled by our external switch */
                }}
                date={currentDate}
                onNavigate={(d: Date) => setCurrentDate(d)}
                defaultView={rbcView}
                min={CALENDAR_MIN}
                max={CALENDAR_MAX}
                eventPropGetter={rbcEventStyle}
                culture="es"
                components={{ toolbar: RbcEmptyToolbar }}
                messages={{
                  next: 'Siguiente',
                  previous: 'Anterior',
                  today: 'Hoy',
                  month: 'Mes',
                  week: 'Semana',
                  day: 'Día',
                  agenda: 'Agenda',
                  date: 'Fecha',
                  time: 'Hora',
                  event: 'Cita',
                  noEventsInRange: 'No hay citas en este rango',
                  showMore: (total: number) => `+ Ver más (${total})`,
                }}
              />
            </Box>
          )}

          <HStack
            spacing={5}
            px="18px"
            py="12px"
            borderTop="1px solid"
            borderColor={borderColor}
            flexWrap="wrap"
          >
            <HStack spacing={2}>
              <Box w="8px" h="8px" borderRadius="full" bg="statusSoft.okFg" />
              <Text fontSize="12px" color={mutedColor}>
                Confirmada
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Box w="8px" h="8px" borderRadius="full" bg="statusSoft.warnFg" />
              <Text fontSize="12px" color={mutedColor}>
                Pendiente
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Box w="8px" h="8px" borderRadius="full" bg="statusSoft.critFg" />
              <Text fontSize="12px" color={mutedColor}>
                Cancelada
              </Text>
            </HStack>
          </HStack>
        </Box>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="10px">
          <ModalHeader>
            <HStack spacing={3}>
              <Box bg="brand.600" p={2} borderRadius="md" color="white">
                <Icon as={FiCalendarIcon} boxSize={5} />
              </Box>
              <Heading as="span" size="md">
                Detalles de la Cita
              </Heading>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedEvent && (
              <VStack spacing={5} align="stretch">
                <HStack
                  spacing={4}
                  p={4}
                  bg="statusSoft.infoBg"
                  borderRadius="md"
                  cursor={patient ? 'pointer' : 'default'}
                  onClick={
                    patient
                      ? () => {
                          navigate(`/patients/${patient.id}`);
                          onClose();
                        }
                      : undefined
                  }
                >
                  <Avatar
                    size="lg"
                    name={
                      patient
                        ? `${patient.firstName} ${patient.lastName}`
                        : 'Paciente'
                    }
                    src={patient?.avatar}
                    bg="brand.600"
                    color="white"
                  />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontWeight="bold" fontSize="lg">
                      {patient
                        ? `${patient.firstName} ${patient.lastName}`
                        : `Paciente (${selectedEvent.resource.patient_id.slice(0, 8)}...)`}
                    </Text>
                    <Text fontSize="sm" color="paper.700">
                      {patient
                        ? 'Click para ver perfil'
                        : 'Paciente no encontrado'}
                    </Text>
                  </VStack>
                </HStack>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="semibold" fontSize="sm">
                      Estado
                    </Text>
                    <StatusBadge
                      tone={statusTone(selectedEvent.resource.status)}
                    >
                      {statusLabel(selectedEvent.resource.status)}
                    </StatusBadge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold" fontSize="sm">
                      Fecha
                    </Text>
                    <Text fontSize="sm">
                      {format(
                        selectedEvent.start,
                        "EEEE, d 'de' MMMM 'de' yyyy",
                        { locale: es }
                      )}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold" fontSize="sm">
                      Hora
                    </Text>
                    <Text fontSize="sm" fontFamily="mono">
                      {format(selectedEvent.start, 'HH:mm')} –{' '}
                      {format(selectedEvent.end, 'HH:mm')}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold" fontSize="sm">
                      Duración
                    </Text>
                    <Text fontSize="sm">
                      {selectedEvent.resource.duration} minutos
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2}>
              {selectedEvent?.resource.status === 'PENDING' && (
                <Tooltip label="Confirmar">
                  <IconButton
                    aria-label="Confirmar cita"
                    icon={<Icon as={FiCheck} />}
                    colorScheme="green"
                    variant="ghost"
                    size="sm"
                    onClick={handleConfirmAppointment}
                    isLoading={isUpdatingStatus}
                    isDisabled={isUpdatingStatus}
                  />
                </Tooltip>
              )}
              {selectedEvent?.resource.status !== 'CANCELLED' && (
                <Tooltip label="Cancelar cita">
                  <IconButton
                    aria-label="Cancelar cita"
                    icon={<Icon as={FiX} />}
                    colorScheme="red"
                    variant="ghost"
                    size="sm"
                    onClick={handleRequestCancelAppointment}
                    isDisabled={isUpdatingStatus || isCancelling}
                  />
                </Tooltip>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cerrar
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isCancelOpen}
        leastDestructiveRef={cancelRef}
        onClose={isCancelling ? () => {} : onCancelClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="10px">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Cancelar cita
            </AlertDialogHeader>
            <AlertDialogBody>
              ¿Seguro que quieres cancelar esta cita? Esta acción la marcará
              como cancelada.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onCancelClose}
                isDisabled={isCancelling}
              >
                Volver
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmCancelAppointment}
                ml={3}
                isLoading={isCancelling}
                loadingText="Cancelando..."
              >
                Cancelar cita
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AppointmentFormModal
        isOpen={isNewOpen}
        onClose={onNewClose}
        onSuccess={onNewClose}
        initialDate={slotDate}
        initialTime={slotTime}
        initialPatientId={initialPatientId}
        createAppointment={createAppointment}
      />
    </Container>
  );
};

export default CalendarPage;
